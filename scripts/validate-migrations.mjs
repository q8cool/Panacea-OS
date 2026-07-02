import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { listFiles, repoRoot, serviceDirectories } from "./lib/workspace.mjs";

const migrationFiles = [
  ...listFiles("services", (file) => file.includes("/migrations/") && file.endsWith(".sql")),
  ...listFiles("release", (file) => file.includes("/database/") && file.endsWith(".sql"))
].sort();

const failures = [];

for (const file of migrationFiles) {
  const sql = fs.readFileSync(path.join(repoRoot, file), "utf8");
  const createTables = [...sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi)].map((match) => match[1]);
  const createIndexes = [...sql.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi)].map((match) => match[1]);
  const isSchemaEvolutionMigration = createTables.length === 0 && /\bALTER\s+TABLE\b/i.test(sql) && /\bCONSTRAINT\b/i.test(sql);
  if (isSchemaEvolutionMigration) {
    if (!/INSERT\s+INTO\s+[a-zA-Z0-9_]*migrations\b/i.test(sql)) {
      failures.push(`${file}: schema evolution migration must record its migration version`);
    }
    continue;
  }
  if (createTables.length === 0) {
    failures.push(`${file}: no CREATE TABLE statements found`);
  }
  if (createIndexes.length === 0) {
    failures.push(`${file}: no CREATE INDEX statements found`);
  }
  if (!/\btenant_id\b/i.test(sql)) {
    failures.push(`${file}: tenant_id field not found`);
  }
  if (!/audit_entries|created_by|updated_by|actor_id/i.test(sql)) {
    failures.push(`${file}: audit field/table not found`);
  }
  if (!/CHECK\s*\(|CONSTRAINT|PRIMARY KEY/i.test(sql)) {
    failures.push(`${file}: constraints not found`);
  }
  if (!/events|published_at|event_type/i.test(sql)) {
    failures.push(`${file}: event outbox structure not found`);
  }
}

if (process.env.PANACEA_POSTGRES_TEST_URL) {
  for (const servicePath of serviceDirectories()) {
    process.stdout.write(`Executing live PostgreSQL migration for ${servicePath}\n`);
    const repositoryModule = await import(pathToFileURL(path.join(repoRoot, servicePath, "src/infrastructure/postgres-repository.mjs")));
    await repositoryModule.runPostgresMigrations({
      connectionString: process.env.PANACEA_POSTGRES_TEST_URL
    });
  }
} else {
  process.stdout.write("PANACEA_POSTGRES_TEST_URL is not set; completed deterministic SQL structure validation without live execution.\n");
}

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write(`Validated ${migrationFiles.length} migration file(s).\n`);
