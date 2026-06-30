import fs from "node:fs";
import path from "node:path";
import { repoRoot, run, serviceDirectories } from "./lib/workspace.mjs";

for (const servicePath of serviceDirectories()) {
  for (const requiredPath of ["package.json", "package-lock.json", "src/index.mjs", "docs/openapi.json"]) {
    const absolutePath = path.join(repoRoot, servicePath, requiredPath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`${servicePath} is missing ${requiredPath}`);
    }
  }
  const migrationDir = path.join(repoRoot, servicePath, "migrations");
  if (!fs.existsSync(migrationDir) || !fs.readdirSync(migrationDir).some((name) => name.endsWith(".sql"))) {
    throw new Error(`${servicePath} is missing a PostgreSQL migration`);
  }
}

run("node", ["scripts/validate-openapi.mjs", "--check-only"]);
run("node", ["scripts/validate-migrations.mjs"]);
run("node", ["scripts/validate-docker.mjs"]);
run("node", ["scripts/validate-kubernetes.mjs"]);

process.stdout.write("Panacea build validation completed.\n");
