import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildOpenApiDocument } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/api/openapi.mjs";
import { routeDefinitions } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/api/routes.mjs";
import { API_BASE_PATH, requiredEvents } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/command-domain.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("OpenAPI contract contains every Sprint 85 route and required event", () => {
  const document = buildOpenApiDocument();
  for (const route of routeDefinitions) {
    const fullPath = `${API_BASE_PATH}${route.path}`;
    assert.ok(document.paths[fullPath], `missing ${fullPath}`);
    assert.ok(document.paths[fullPath][route.method.toLowerCase()], `missing method ${route.method} for ${fullPath}`);
  }
  assert.ok(document.paths[`${API_BASE_PATH}/integrations/references`]);
  assert.ok(document.paths[`${API_BASE_PATH}/live`]);
  assert.ok(document.paths[`${API_BASE_PATH}/ready`]);
  assert.ok(document.paths[`${API_BASE_PATH}/metrics`]);
  assert.ok(document.paths[`${API_BASE_PATH}/docs/openapi.json`]);
  assert.deepEqual(document["x-panacea"].requiredEvents, requiredEvents);
  assert.equal(Object.keys(document.paths).length, routeDefinitions.length + 5);
});

test("OpenAPI declares command, emergency, regional, country, and governance controls", () => {
  const document = buildOpenApiDocument();
  assert.ok(document.components.securitySchemes.bearerAuth);
  assert.ok(document.components.securitySchemes.tenantHeaders);
  assert.deepEqual(document["x-panacea"].controls, [
    "identity",
    "rbac",
    "abac",
    "audit",
    "tenant_isolation",
    "emergency_access_governance",
    "command_center_permissions",
    "regional_governance_policies",
    "country_level_policy_controls"
  ]);
  assert.equal(document["x-panacea"].advisoryOnly, true);
  assert.equal(document["x-panacea"].governanceApprovalRequired, true);
  assert.equal(document["x-panacea"].autonomousDiagnosis, "not_permitted");
  assert.equal(document["x-panacea"].autonomousTreatment, "not_permitted");
  assert.equal(document["x-panacea"].autonomousEmergencyEnforcement, "not_permitted");
});

test("PostgreSQL migration defines records, events, audit, integration references, and governance constraints", () => {
  const sql = fs.readFileSync(
    path.join(repoRoot, "services/real-time-global-healthcare-command-intelligence-platform/migrations/001_real_time_global_command_intelligence.sql"),
    "utf8"
  );
  for (const tableName of [
    "global_command_intelligence_records",
    "global_command_intelligence_events",
    "global_command_intelligence_audit_entries",
    "global_command_intelligence_integration_references"
  ]) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}`));
  }
  for (const eventName of requiredEvents) {
    assert.match(sql, new RegExp(eventName.replaceAll(".", "\\.")));
  }
  for (const requiredControl of [
    "advisoryOnly",
    "noAutonomousDiagnosis",
    "noAutonomousTreatment",
    "noAutonomousEmergencyEnforcement",
    "governanceApprovalEnforced",
    "regionalPolicyChecked",
    "countryPolicyChecked",
    "emergencyAccessGoverned",
    "autonomousExecutionBlocked"
  ]) {
    assert.match(sql, new RegExp(requiredControl));
  }
});
