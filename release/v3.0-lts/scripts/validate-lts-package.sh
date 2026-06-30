#!/usr/bin/env sh
set -eu

test -s release/v3.0-lts/database/001_v3_lts_maintenance.sql
test -s release/v3.0-lts/openapi/panacea-v3-lts-maintenance.openapi.json
test -s release/v3.0-lts/policies/version-3-lts-policy.md
test -s release/v3.0-lts/policies/version-compatibility-matrix.md
test -s release/v3.0-lts/monitoring/lts-monitoring-catalog.md
test -s release/v3.0-lts/reports/lts-validation-summary.md

node - <<'NODE'
const assert = require("node:assert/strict");
const fs = require("node:fs");

const openApi = JSON.parse(fs.readFileSync("release/v3.0-lts/openapi/panacea-v3-lts-maintenance.openapi.json", "utf8"));
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

assert.equal(openApi.info.version, "3.0.1-LTS");
assert.equal(openApi.servers[0].url, "/api/v3/lts-maintenance");
assert.equal(Object.keys(openApi.paths).length, 55);
assert.deepEqual(openApi["x-panacea"].events, requiredEvents);
assert.equal(openApi["x-panacea"].maintenanceOnly, true);
assert.equal(openApi["x-panacea"].noNewBusinessFeatures, true);
assert.equal(openApi["x-panacea"].noNewAiCapabilities, true);
assert.equal(openApi["x-panacea"].clinicalAutomation, "not_permitted");

const sql = fs.readFileSync("release/v3.0-lts/database/001_v3_lts_maintenance.sql", "utf8");
for (const eventName of requiredEvents) assert.match(sql, new RegExp(eventName.replaceAll(".", "\\.")));
for (const tableName of ["v3_lts_maintenance_records", "v3_lts_events", "v3_lts_audit_entries", "v3_lts_migrations"]) {
  assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}`));
}
NODE

if git ls-files 'services/*/package.json' | grep -q .; then
  :
fi

echo "lts.package.validated"
