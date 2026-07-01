import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { repoRoot, serviceDirectories } from "../../scripts/lib/workspace.mjs";

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function filesFor(servicePath) {
  return {
    dockerfile: `${servicePath}/Dockerfile`,
    index: `${servicePath}/src/index.mjs`,
    server: `${servicePath}/src/api/server.mjs`,
    repository: `${servicePath}/src/infrastructure/postgres-repository.mjs`,
    config: `${servicePath}/src/infrastructure/config.mjs`,
    migration: fs.readdirSync(path.join(repoRoot, servicePath, "migrations"))
      .filter((file) => file.endsWith(".sql"))
      .map((file) => `${servicePath}/migrations/${file}`)
      .sort()[0]
  };
}

test("service processes expose clean runtime lifecycle hooks and structured lifecycle logs", () => {
  for (const servicePath of serviceDirectories()) {
    const { index } = filesFor(servicePath);
    const source = read(index);
    assert.match(source, /process\.on\("SIGINT", shutdown\)/, `${servicePath} must handle SIGINT`);
    assert.match(source, /process\.on\("SIGTERM", shutdown\)/, `${servicePath} must handle SIGTERM`);
    assert.match(source, /await pool\.end\(\)/, `${servicePath} must close PostgreSQL pool`);
    assert.match(source, /JSON\.stringify\(\{\s*level: "info",\s*event: "service\.started"/s, `${servicePath} must emit structured start log`);
    assert.match(source, /event: "service\.stopped"/, `${servicePath} must emit structured stop log`);
  }
});

test("runtime endpoints are present for health, readiness, metrics, and OpenAPI exposure", () => {
  for (const servicePath of serviceDirectories()) {
    const { server } = filesFor(servicePath);
    const source = read(server);
    for (const endpoint of ["/live", "/ready", "/metrics", "/docs/openapi.json"]) {
      assert.match(source, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${servicePath} missing ${endpoint}`);
    }
  }
});

test("runtime services expose trusted-origin CORS preflight for browser live integration", () => {
  for (const servicePath of serviceDirectories()) {
    const { server } = filesFor(servicePath);
    const source = read(server);
    assert.match(source, /handleCorsPreflight/, `${servicePath} must handle OPTIONS preflight`);
    assert.match(source, /http:\/\/localhost:5174/, `${servicePath} must default to the trusted local web origin`);
    for (const header of ["Authorization", "Content-Type", "X-Tenant-Id", "X-User-Id", "X-Request-Id", "X-Correlation-Id"]) {
      assert.match(source, new RegExp(header), `${servicePath} CORS allowlist missing ${header}`);
    }
    assert.doesNotMatch(source, /Access-Control-Allow-Origin", "\*"/, `${servicePath} must not allow wildcard credential-style CORS`);
  }
});

test("Dockerfiles define production health checks without duplicate environment declarations", () => {
  for (const servicePath of serviceDirectories()) {
    const { dockerfile } = filesFor(servicePath);
    const source = read(dockerfile);
    const envLines = source.split(/\r?\n/).filter((line) => line.startsWith("ENV "));
    assert.equal(new Set(envLines).size, envLines.length, `${servicePath} has duplicate ENV declarations`);
    assert.match(source, /HEALTHCHECK .*\/live/, `${servicePath} Dockerfile must validate live endpoint`);
    assert.match(source, /npm ci --omit=dev/, `${servicePath} Dockerfile must install production dependencies`);
    assert.match(source, /USER node/, `${servicePath} Dockerfile must run as node user`);
  }
});

test("PostgreSQL migration runners and configuration are wired for runtime execution", () => {
  for (const servicePath of serviceDirectories()) {
    const { config, index, repository } = filesFor(servicePath);
    assert.match(read(config), /databaseUrl/, `${servicePath} config must expose databaseUrl`);
    assert.match(read(repository), /export async function runPostgresMigrations/, `${servicePath} must export migration runner`);
    assert.match(read(repository), /await import\("pg"\)/, `${servicePath} migration runner must use pg at runtime`);
    assert.match(read(index), /runPostgresMigrations/, `${servicePath} entrypoint must wire migration execution`);
  }
});

test("migration schemas include tenant isolation, audit fields, indexes, and event outbox tables", () => {
  for (const servicePath of serviceDirectories()) {
    const { migration } = filesFor(servicePath);
    const source = read(migration);
    assert.match(source, /\btenant_id\b/i, `${servicePath} migration must include tenant_id`);
    assert.match(source, /created_by|updated_by|actor_id/i, `${servicePath} migration must include audit actor fields`);
    assert.match(source, /CREATE\s+(?:UNIQUE\s+)?INDEX/i, `${servicePath} migration must include indexes`);
    assert.match(source, /CREATE TABLE IF NOT EXISTS [a-z0-9_]+_events/i, `${servicePath} migration must create event outbox table`);
    assert.match(source, /\bpublished_at\b/i, `${servicePath} event outbox must include published_at`);
  }
});

test("OpenAPI documents are available from service docs and repository contract bundle", () => {
  for (const servicePath of serviceDirectories()) {
    const service = path.basename(servicePath);
    const serviceDocument = JSON.parse(read(`${servicePath}/docs/openapi.json`));
    const contractDocument = JSON.parse(read(`docs/contracts/openapi/${service}.openapi.json`));
    assert.equal(serviceDocument.openapi, "3.1.0", `${service} service OpenAPI version mismatch`);
    assert.equal(contractDocument.openapi, "3.1.0", `${service} contract OpenAPI version mismatch`);
    assert.deepEqual(Object.keys(serviceDocument.paths).sort(), Object.keys(contractDocument.paths).sort(), `${service} runtime and contract paths must match`);
  }
});

test("event persistence writes through repository event insert paths", () => {
  for (const servicePath of serviceDirectories()) {
    const { repository } = filesFor(servicePath);
    const source = read(repository);
    assert.match(source, /INSERT INTO [a-z0-9_]+_events/i, `${servicePath} repository must insert event rows`);
    assert.match(source, /published_at/i, `${servicePath} event rows must track publication state`);
    assert.match(source, /COMMIT/, `${servicePath} record and event write must commit atomically`);
    assert.match(source, /ROLLBACK/, `${servicePath} record and event write must roll back atomically`);
  }
});
