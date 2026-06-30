import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function walk(start, predicate, output = []) {
  if (!fs.existsSync(start)) {
    return output;
  }
  const stat = fs.statSync(start);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(start)) {
      walk(path.join(start, entry), predicate, output);
    }
    return output;
  }
  if (predicate(start)) {
    output.push(start);
  }
  return output;
}

test("all OpenAPI public paths use /api/vN prefixes", () => {
  const files = [
    ...walk(path.join(repoRoot, "services"), (file) => file.endsWith("/docs/openapi.json")),
    ...walk(path.join(repoRoot, "docs/contracts/openapi"), (file) => file.endsWith(".json")),
    ...walk(path.join(repoRoot, "release"), (file) => file.includes("/openapi/") && file.endsWith(".json"))
  ];
  assert.ok(files.length >= 9);
  for (const file of files) {
    const document = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const publicPath of Object.keys(document.paths ?? {})) {
      assert.match(publicPath, /^\/api\/v\d+(?:\/|$)/, `${path.relative(repoRoot, file)} exposes ${publicPath}`);
    }
  }
});

test("all service OpenAPI contracts expose security and tenant headers", () => {
  const files = walk(path.join(repoRoot, "services"), (file) => file.endsWith("/docs/openapi.json"));
  for (const file of files) {
    const document = JSON.parse(fs.readFileSync(file, "utf8"));
    assert.ok(document.components?.securitySchemes?.bearerAuth, `${file} missing bearerAuth`);
    assert.ok(document.components?.securitySchemes?.tenantHeaders, `${file} missing tenantHeaders`);
  }
});
