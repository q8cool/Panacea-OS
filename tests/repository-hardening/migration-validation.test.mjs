import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function serviceMigrationFiles() {
  const servicesRoot = path.join(repoRoot, "services");
  return fs.readdirSync(servicesRoot)
    .flatMap((service) => {
      const migrationRoot = path.join(servicesRoot, service, "migrations");
      if (!fs.existsSync(migrationRoot)) {
        return [];
      }
      return fs.readdirSync(migrationRoot)
        .filter((file) => file.endsWith(".sql"))
        .map((file) => path.join(migrationRoot, file));
    })
    .sort();
}

test("service migrations define tenant, audit, event, constraint, and index structures", () => {
  const files = serviceMigrationFiles();
  assert.ok(files.length >= 9);
  for (const file of files) {
    const sql = fs.readFileSync(file, "utf8");
    const createsTable = /CREATE TABLE IF NOT EXISTS/i.test(sql);
    const altersSchema = /ALTER TABLE/i.test(sql);
    assert.ok(createsTable || altersSchema, `${path.basename(file)} must create or evolve schema`);
    assert.match(sql, /CHECK\s*\(|CONSTRAINT|PRIMARY KEY/i);
    if (createsTable) {
      assert.match(sql, /CREATE\s+(?:UNIQUE\s+)?INDEX/i);
      assert.match(sql, /\btenant_id\b/i);
      assert.match(sql, /audit_entries|created_by|updated_by|actor_id/i);
      assert.match(sql, /events|published_at|event_type/i);
    } else {
      assert.match(sql, /DROP CONSTRAINT|ADD CONSTRAINT/i);
    }
  }
});

test("service migrations include migration version tracking", () => {
  for (const file of serviceMigrationFiles()) {
    const sql = fs.readFileSync(file, "utf8");
    assert.match(sql, /migrations|schema_migrations/i);
  }
});
