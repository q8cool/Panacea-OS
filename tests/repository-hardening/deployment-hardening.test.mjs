import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const services = fs.readdirSync(path.join(repoRoot, "services")).sort();

test("every service has production Docker support", () => {
  for (const service of services) {
    const serviceRoot = path.join(repoRoot, "services", service);
    const dockerfile = fs.readFileSync(path.join(serviceRoot, "Dockerfile"), "utf8");
    const dockerignore = fs.readFileSync(path.join(serviceRoot, ".dockerignore"), "utf8");
    assert.match(dockerfile, /FROM node:/);
    assert.match(dockerfile, /npm ci --omit=dev/);
    assert.match(dockerfile, /USER node/);
    assert.match(dockerfile, /HEALTHCHECK/);
    assert.match(dockerignore, /node_modules/);
    assert.match(dockerignore, /\.env/);
  }
});

test("every service has hardened Kubernetes deployment, service, config and secret references", () => {
  for (const service of services) {
    const manifest = fs.readFileSync(path.join(repoRoot, "infra/kubernetes", service, "deployment.yaml"), "utf8");
    for (const required of [
      "kind: ConfigMap",
      "kind: Deployment",
      "kind: Service",
      "secretKeyRef:",
      "readinessProbe:",
      "livenessProbe:",
      "requests:",
      "limits:",
      "tenant-isolation: required",
      "allowPrivilegeEscalation: false",
      "readOnlyRootFilesystem: true"
    ]) {
      assert.match(manifest, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${service} missing ${required}`);
    }
  }
});
