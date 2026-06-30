import fs from "node:fs";
import path from "node:path";
import { repoRoot, serviceDirectories } from "./lib/workspace.mjs";

const failures = [];

for (const servicePath of serviceDirectories()) {
  const serviceName = path.basename(servicePath);
  const manifestPath = path.join(repoRoot, "infra/kubernetes", serviceName, "deployment.yaml");
  if (!fs.existsSync(manifestPath)) {
    failures.push(`${serviceName}: Kubernetes manifest missing`);
    continue;
  }
  const manifest = fs.readFileSync(manifestPath, "utf8");
  for (const required of [
    "kind: ConfigMap",
    "kind: Deployment",
    "kind: Service",
    "secretKeyRef:",
    "livenessProbe:",
    "readinessProbe:",
    "requests:",
    "limits:",
    "tenant-isolation: required",
    "app.kubernetes.io/part-of: panacea-os"
  ]) {
    if (!manifest.includes(required)) {
      failures.push(`${serviceName}: manifest missing ${required}`);
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write(`Kubernetes readiness validated for ${serviceDirectories().length} service manifest(s).\n`);
