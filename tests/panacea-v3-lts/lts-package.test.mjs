import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const openApiPath = "release/v3.0-lts/openapi/panacea-v3-lts-maintenance.openapi.json";
const migrationPath = "release/v3.0-lts/database/001_v3_lts_maintenance.sql";
const validationScriptPath = "release/v3.0-lts/scripts/validate-lts-package.sh";

const requiredEvents = [
  "lts.patch.created",
  "lts.patch.approved",
  "lts.patch.installed",
  "hotfix.created",
  "hotfix.applied",
  "maintenance.started",
  "maintenance.completed",
  "support.bundle.generated",
  "upgrade.validated",
  "rollback.validated",
  "ai.safety.patch.applied",
  "global.support.alert.created"
];

const requiredDocumentation = [
  "docs/contracts/lts/LTS_Guide_v3.md",
  "docs/contracts/lts/Maintenance_API_v3.md",
  "docs/contracts/lts/Support_API_v3.md",
  "docs/contracts/lts/Upgrade_API_v3.md",
  "docs/contracts/lts/Patch_Management_Guide_v3.md",
  "docs/contracts/lts/Security_Maintenance_Guide_v3.md",
  "docs/contracts/lts/AI_Governance_Maintenance_Guide.md",
  "docs/contracts/lts/Global_Operations_Support_Guide.md",
  "docs/contracts/lts/LTS_Data_Model_v3.md",
  "docs/contracts/lts/LTS_Event_Model_v3.md",
  "docs/panacea/v3-lts/Sprint_82_Report.md",
  "docs/panacea/v3-lts/LTS_Readiness_Report_v3.md",
  "docs/panacea/v3-lts/Maintenance_Roadmap_v3.md",
  "docs/panacea/v3-lts/Version_3_0_1_Release_Notes.md",
  "docs/panacea/sprints/Sprint_82_Report.md",
  "docs/panacea/sprints/Remaining_Work.md",
  "docs/panacea/sprints/Sprint_83_Backlog.md"
];

test("v3 LTS OpenAPI contract is versioned, governed, and complete", () => {
  const openApi = JSON.parse(fs.readFileSync(openApiPath, "utf8"));

  assert.equal(openApi.openapi, "3.1.0");
  assert.equal(openApi.info.version, "3.0.1-LTS");
  assert.equal(openApi.servers[0].url, "/api/v3/lts-maintenance");
  assert.equal(Object.keys(openApi.paths).length, 55);
  assert.deepEqual(openApi["x-panacea"].events, requiredEvents);
  assert.equal(openApi["x-panacea"].maintenanceOnly, true);
  assert.equal(openApi["x-panacea"].noNewBusinessFeatures, true);
  assert.equal(openApi["x-panacea"].noNewAiCapabilities, true);
  assert.equal(openApi["x-panacea"].clinicalAutomation, "not_permitted");

  for (const path of [
    "/api/v3/lts-maintenance/patches",
    "/api/v3/lts-maintenance/support/bundles",
    "/api/v3/lts-maintenance/upgrade/validations",
    "/api/v3/lts-maintenance/rollback/validations",
    "/api/v3/lts-maintenance/ai-governance/safety-patches",
    "/api/v3/lts-maintenance/global-operations/support-alerts"
  ]) {
    assert.ok(openApi.paths[path], `${path} is published`);
  }

  assert.ok(openApi.components.securitySchemes.bearerAuth);
  assert.ok(openApi.components.securitySchemes.tenantHeaders);
});

test("v3 LTS PostgreSQL migration enforces auditability and governed maintenance", () => {
  const sql = fs.readFileSync(migrationPath, "utf8");

  for (const tableName of ["v3_lts_maintenance_records", "v3_lts_events", "v3_lts_audit_entries", "v3_lts_migrations"]) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}`));
  }

  for (const eventName of requiredEvents) {
    assert.match(sql, new RegExp(eventName.replaceAll(".", "\\.")));
  }

  for (const requiredControl of [
    "policyApproved",
    "humanApprovalRequired",
    "auditPolicyApplied",
    "tenantIsolationApplied",
    "globalPolicyEnforced",
    "aiGovernanceApplied",
    "supportRolePermissionsApplied",
    "maintenanceOnly",
    "noNewBusinessFeatures",
    "noNewAiCapabilities",
    "noAutonomousClinicalDecisioning"
  ]) {
    assert.match(sql, new RegExp(requiredControl));
  }
});

test("v3 LTS documentation and validation package are present", () => {
  for (const docPath of requiredDocumentation) {
    assert.ok(fs.statSync(docPath).size > 0, `${docPath} has content`);
  }

  assert.ok((fs.statSync(validationScriptPath).mode & 0o111) !== 0, "validation script is executable");
});
