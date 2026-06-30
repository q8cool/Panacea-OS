import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { repoRoot, serviceDirectories } from "../../scripts/lib/workspace.mjs";

const composePath = path.join(repoRoot, "infra/docker-compose/runtime/docker-compose.yml");
const composeSource = fs.readFileSync(composePath, "utf8");

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

test("Docker Compose runtime profile defines PostgreSQL and every active service", () => {
  assert.match(composeSource, /name: panacea-runtime/);
  assert.match(composeSource, /postgres:16-alpine/);
  assert.match(composeSource, /pg_isready -U panacea -d panacea_runtime/);
  assert.match(composeSource, /panacea-runtime-postgres:/);
  for (const servicePath of serviceDirectories()) {
    const service = path.basename(servicePath);
    assert.match(composeSource, new RegExp(`\\n  ${service}:`), `${service} missing from compose profile`);
    assert.match(composeSource, new RegExp(`container_name: panacea-runtime-${service}`), `${service} container name missing`);
    assert.match(composeSource, new RegExp(`context: ../../../services/${service}`), `${service} build context missing`);
  }
});

test("Docker Compose runtime profile exposes required health, readiness, metrics, and OpenAPI ports", () => {
  for (const port of ["18094", "18141", "18142", "18143", "18144", "18145", "18146", "18147", "18095"]) {
    assert.match(composeSource, new RegExp(`"${port}:`), `host port ${port} missing`);
  }
  const runtimeScript = read("scripts/runtime-orchestration-validate.mjs");
  for (const endpoint of ["/live", "/ready", "/metrics", "/docs/openapi.json"]) {
    assert.match(runtimeScript, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${endpoint} not validated`);
  }
});

test("live infrastructure validation script validates migrations, auth, tenant isolation, audit, events, and shutdown", () => {
  const source = read("scripts/runtime-orchestration-validate.mjs");
  for (const required of [
    "applyMigrations(\"forward\")",
    "applyMigrations(\"idempotency\")",
    "postProtectedRecord",
    "unauthenticated.status !== 401",
    "unauthorized.status !== 403",
    "tenantMismatch.status !== 403",
    "autonomous_healthcare_intelligence_events",
    "autonomous_healthcare_intelligence_audit_entries",
    "compose([\"stop\"",
    "containerExitCode",
    "assertJsonLogs",
    "assertNoSensitiveLogs"
  ]) {
    assert.ok(source.includes(required), `runtime orchestration script missing ${required}`);
  }
});

test("disaster recovery mini-drill validates backup, drop, restore, indexes, audit, and event outbox", () => {
  const source = read("scripts/disaster-recovery-mini-drill.mjs");
  for (const required of [
    "pg_dump",
    "DROP DATABASE panacea_runtime WITH (FORCE);",
    "CREATE DATABASE panacea_runtime OWNER panacea;",
    "pg_restore",
    "autonomous_healthcare_intelligence_records",
    "autonomous_healthcare_intelligence_events",
    "autonomous_healthcare_intelligence_audit_entries",
    "pg_indexes",
    "table_name LIKE '%events'"
  ]) {
    assert.ok(source.includes(required), `DR script missing ${required}`);
  }
});

test("CI includes live infrastructure validation using the runtime orchestration commands", () => {
  const workflow = read(".github/workflows/panacea-ci.yml");
  assert.match(workflow, /live-infrastructure-validation:/);
  assert.match(workflow, /docker compose -f infra\/docker-compose\/runtime\/docker-compose\.yml config --quiet/);
  assert.match(workflow, /npm run runtime:orchestration/);
  assert.match(workflow, /npm run runtime:disaster-recovery/);
  assert.match(workflow, /external-secret-scan:/);
});
