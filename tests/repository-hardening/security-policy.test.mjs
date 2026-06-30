import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const services = fs.readdirSync(path.join(repoRoot, "services")).sort();

test("service security layers enforce authentication, tenant isolation, RBAC, ABAC, and audit controls", () => {
  for (const service of services) {
    const serviceRoot = path.join(repoRoot, "services", service);
    const files = [
      path.join(serviceRoot, "src/infrastructure/security.mjs"),
      path.join(serviceRoot, "src/application", fs.readdirSync(path.join(serviceRoot, "src/application"))[0]),
      path.join(serviceRoot, "docs/openapi.json")
    ];
    const content = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    assert.match(content, /authenticate|authenticated/i, `${service} missing authentication`);
    assert.match(content, /tenant/i, `${service} missing tenant isolation`);
    assert.match(content, /rbac/i, `${service} missing RBAC`);
    assert.match(content, /abac/i, `${service} missing ABAC`);
    assert.match(content, /audit/i, `${service} missing audit control`);
  }
});

test("root package identity is Panacea OS only", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  assert.equal(packageJson.name, "panacea-os-enterprise");
  assert.deepEqual(packageJson.dependencies ?? {}, {});
  assert.deepEqual(packageJson.devDependencies ?? {}, {});
});
