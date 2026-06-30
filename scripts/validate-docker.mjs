import fs from "node:fs";
import path from "node:path";
import { repoRoot, serviceDirectories } from "./lib/workspace.mjs";

const failures = [];

for (const servicePath of serviceDirectories()) {
  const dockerfilePath = path.join(repoRoot, servicePath, "Dockerfile");
  const dockerignorePath = path.join(repoRoot, servicePath, ".dockerignore");
  if (!fs.existsSync(dockerfilePath)) {
    failures.push(`${servicePath}: Dockerfile missing`);
    continue;
  }
  if (!fs.existsSync(dockerignorePath)) {
    failures.push(`${servicePath}: .dockerignore missing`);
    continue;
  }
  const dockerfile = fs.readFileSync(dockerfilePath, "utf8");
  for (const required of ["FROM node:", "npm ci --omit=dev", "USER node", "HEALTHCHECK", "CMD"]) {
    if (!dockerfile.includes(required)) {
      failures.push(`${servicePath}: Dockerfile missing ${required}`);
    }
  }
  const dockerignore = fs.readFileSync(dockerignorePath, "utf8");
  for (const required of ["node_modules", ".env", "coverage", "*.log"]) {
    if (!dockerignore.includes(required)) {
      failures.push(`${servicePath}: .dockerignore missing ${required}`);
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write(`Docker readiness validated for ${serviceDirectories().length} service(s).\n`);
