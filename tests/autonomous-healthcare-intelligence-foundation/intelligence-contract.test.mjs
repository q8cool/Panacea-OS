import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildOpenApiDocument } from "../../services/autonomous-healthcare-intelligence-foundation/src/api/openapi.mjs";
import { routeDefinitions } from "../../services/autonomous-healthcare-intelligence-foundation/src/api/routes.mjs";
import { API_BASE_PATH, requiredEvents } from "../../services/autonomous-healthcare-intelligence-foundation/src/domain/intelligence-domain.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

test("OpenAPI contract contains every Sprint 84 route and required event", () => {
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

test("OpenAPI declares advisory intelligence, clinical approval, safety, and emergency controls", () => {
  const document = buildOpenApiDocument();
  assert.ok(document.components.securitySchemes.bearerAuth);
  assert.ok(document.components.securitySchemes.tenantHeaders);
  assert.deepEqual(document["x-panacea"].controls, [
    "identity",
    "rbac",
    "abac",
    "audit",
    "tenant_isolation",
    "ai_governance_permissions",
    "clinical_approval_permissions",
    "emergency_stop_permissions"
  ]);
  assert.equal(document["x-panacea"].advisoryOnly, true);
  assert.equal(document["x-panacea"].clinicianApprovalRequired, true);
  assert.equal(document["x-panacea"].autonomousDiagnosis, "not_permitted");
  assert.equal(document["x-panacea"].autonomousTreatment, "not_permitted");
  assert.equal(document["x-panacea"].productionClinicalBypass, "not_permitted");
});

test("PostgreSQL migration defines persistent records, events, audit, integration references, and governance constraints", () => {
  const sql = fs.readFileSync(
    path.join(repoRoot, "services/autonomous-healthcare-intelligence-foundation/migrations/001_autonomous_healthcare_intelligence_foundation.sql"),
    "utf8"
  );
  for (const tableName of [
    "autonomous_healthcare_intelligence_records",
    "autonomous_healthcare_intelligence_events",
    "autonomous_healthcare_intelligence_audit_entries",
    "autonomous_healthcare_intelligence_integration_references"
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
    "clinicianApprovalEnforced",
    "humanApprovalRequired",
    "autonomousActionBlocked",
    "emergencyStopAuthorized"
  ]) {
    assert.match(sql, new RegExp(requiredControl));
  }
});
