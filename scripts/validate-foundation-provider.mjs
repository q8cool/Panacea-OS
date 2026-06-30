import fs from "node:fs";
import path from "node:path";
import { repoRoot, serviceDirectories } from "./lib/workspace.mjs";
import { buildFoundationProviderEnv, loadFoundationProviderConfig } from "./lib/foundation-provider.mjs";

const requiredManifestKeys = [
  "PANACEA_FOUNDATION_URL",
  "PANACEA_FOUNDATION_JWT_ISSUER",
  "PANACEA_FOUNDATION_JWKS_URL",
  "PANACEA_FOUNDATION_AUDIT_APPEND_PATH",
  "PANACEA_FOUNDATION_POLICY_EVALUATION_PATH",
  "PANACEA_FOUNDATION_HEALTH_PATH",
  "PANACEA_FOUNDATION_READY_PATH",
  "PANACEA_FOUNDATION_METRICS_PATH",
  "PANACEA_FOUNDATION_TIMEOUT_MS",
  "PANACEA_FOUNDATION_RETRY_ATTEMPTS",
  "PANACEA_FOUNDATION_RETRY_BACKOFF_MS",
  "PANACEA_FOUNDATION_CIRCUIT_BREAKER_FAILURE_THRESHOLD",
  "PANACEA_FOUNDATION_CIRCUIT_BREAKER_RESET_MS"
];

const failures = [];

try {
  loadFoundationProviderConfig(buildFoundationProviderEnv());
} catch (error) {
  failures.push(`foundation provider sample config failed validation: ${error.message}`);
}

const composePath = path.join(repoRoot, "infra/docker-compose/runtime/docker-compose.yml");
const compose = fs.readFileSync(composePath, "utf8");
for (const key of requiredManifestKeys) {
  if (!compose.includes(`${key}:`)) {
    failures.push(`runtime Docker Compose missing ${key}`);
  }
}

for (const servicePath of serviceDirectories()) {
  const service = path.basename(servicePath);
  const manifestPath = path.join(repoRoot, "infra/kubernetes", service, "deployment.yaml");
  const manifest = fs.readFileSync(manifestPath, "utf8");
  for (const key of requiredManifestKeys) {
    if (!manifest.includes(`${key}:`)) {
      failures.push(`${service}: Kubernetes manifest missing ${key}`);
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write(`Foundation provider wiring validated for ${serviceDirectories().length} service manifest(s).\n`);
