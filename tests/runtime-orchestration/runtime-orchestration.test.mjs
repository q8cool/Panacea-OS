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
  const runtimeHelper = read("scripts/lib/runtime-validation.mjs");
  for (const required of [
    "await applyMigrations(\"forward\")",
    "await applyMigrations(\"idempotency\")",
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
  assert.match(runtimeHelper, /stableChecks = 3/, "PostgreSQL readiness must require stable SQL checks");
  assert.match(runtimeHelper, /dockerExecWithRetry/, "runtime SQL execution must retry transient PostgreSQL states");
  assert.ok(runtimeHelper.includes("database system is (?:starting up|shutting down)"), "runtime validation must detect transient PostgreSQL startup and shutdown states");
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
  assert.match(source, /beforeOutboxTables/, "DR script must compare event table counts before and after restore");
  assert.match(source, /runtimeServices\.length/, "DR script must derive the minimum event table expectation from active services");
});

test("CI includes live infrastructure validation using runtime control commands and cleanup", () => {
  const workflow = read(".github/workflows/panacea-ci.yml");
  assert.match(workflow, /live-infrastructure-validation:/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /docker compose -f infra\/docker-compose\/runtime\/docker-compose\.yml up -d --build/);
  assert.match(workflow, /docker ps/);
  assert.match(workflow, /npm run panacea:status/);
  assert.match(workflow, /npm run panacea:health/);
  assert.match(workflow, /npm run panacea:pilot:check/);
  assert.match(workflow, /npm run panacea:pilot:config/);
  assert.match(workflow, /if: failure\(\)/);
  assert.match(workflow, /if: always\(\)/);
  assert.match(workflow, /external-secret-scan:/);
});

test("root Panacea runtime commands control start, stop, status, restart, pilot, deployment, and health checks", () => {
  const packageJson = JSON.parse(read("package.json"));
  for (const script of ["panacea:start", "panacea:stop", "panacea:restart", "panacea:status", "panacea:health", "panacea:pilot:check", "panacea:pilot:config", "panacea:pilot:health", "panacea:deployment:verify"]) {
    assert.match(packageJson.scripts[script], /node scripts\/panacea-runtime\.mjs/, `${script} must use the runtime controller`);
  }
  const source = read("scripts/panacea-runtime.mjs");
  assert.match(source, /compose\(\["up", "-d", "--build"\]/, "start command must build and start Docker runtime");
  assert.match(source, /compose\(\["down", "--remove-orphans"\]/, "stop command must stop safely without deleting volumes");
  assert.doesNotMatch(source, /down", "-v"/, "operator stop must not remove PostgreSQL volumes by default");
  for (const endpoint of ["/live", "/ready", "/metrics", "/docs/openapi.json"]) {
    assert.match(source, new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${endpoint} must be included in health checks`);
  }
  assert.match(source, /pg_isready/, "health command must include PostgreSQL readiness");
  assert.match(source, /PANACEA_HEALTH_ATTEMPTS/, "health command must expose a bounded container health wait");
  assert.match(source, /waitForContainerHealth/, "health command must wait for Docker health checks after startup");
  assert.match(source, /container is .*run npm run panacea:start first/, "stopped-service failures must be clear");
  assert.match(source, /pilotDocuments/, "pilot check must validate operator documents");
  assert.match(source, /deploymentDocuments/, "deployment verification must validate external pilot documents");
  assert.match(source, /pilotArtifacts/, "pilot check must validate pilot deployment artifacts");
  assert.match(source, /requiredEnvironmentVariables/, "pilot check must validate environment templates");
  assert.match(source, /assertNoCommittedRealEnvFiles/, "deployment verification must reject committed real env files");
  assert.match(source, /assertSafeEnvironmentTemplatePatterns/, "deployment verification must reject realistic secret-shaped samples");
  assert.match(source, /assertHealthMatrix/, "pilot check must validate the health matrix");
  assert.match(source, /showPilotConfig/, "pilot config must print the route matrix");
});

test("external pilot deployment artifacts are present and versioned", () => {
  const required = [
    ".env.example",
    ".env.local.example",
    ".env.pilot.example",
    ".env.production.example",
    "infra/docker-compose/pilot/docker-compose.yml",
    "infra/docker-compose/pilot/README.md",
    "infra/reverse-proxy/README.md",
    "infra/reverse-proxy/nginx.panacea.example.conf",
    "docs/user-guides/Domain_And_DNS_Setup_Guide.md",
    "docs/user-guides/Pilot_Database_Setup_Guide.md",
    "docs/user-guides/Pilot_Backup_Restore_Runbook.md",
    "docs/user-guides/Pilot_Security_Deployment_Checklist.md",
    "docs/user-guides/External_Server_Deployment_Runbook.md",
    "docs/user-guides/External_Server_Prerequisite_Checklist.md",
    "docs/user-guides/Pilot_Go_Live_Checklist.md",
    "docs/operations/External_Pilot_Route_Verification_Template.md",
    "docs/user-guides/Pilot_Rollback_And_Recovery_Runbook.md",
    "docs/roadmap/Sprint_118_External_Server_Deployment_Go_Live_Report.md",
    "docs/operations/Pilot_Service_Health_Matrix.json"
  ];
  for (const artifact of required) {
    assert.ok(fs.existsSync(path.join(repoRoot, artifact)), `${artifact} must exist`);
  }

  const matrix = JSON.parse(read("docs/operations/Pilot_Service_Health_Matrix.json"));
  assert.equal(matrix.services.length, serviceDirectories().length);
  for (const service of matrix.services) {
    for (const key of ["livePath", "readyPath", "metricsPath", "openapiPath"]) {
      assert.match(service[key], /^\/api\/v\d+\//, `${service.serviceName} ${key} must be versioned`);
    }
  }
});
