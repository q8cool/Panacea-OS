import fs from "node:fs";
import path from "node:path";
import { ensureDir, listFiles, repoRoot, run, serviceDirectories } from "./lib/workspace.mjs";

const writeMode = process.argv.includes("--write");

if (writeMode) {
  ensureDir("docs/contracts/openapi");
  for (const servicePath of serviceDirectories()) {
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, servicePath, "package.json"), "utf8"));
    if (packageJson.scripts?.openapi) {
      run("npm", ["--prefix", path.join(repoRoot, servicePath), "run", "openapi"]);
    }
    const serviceName = path.basename(servicePath);
    const source = path.join(repoRoot, servicePath, "docs/openapi.json");
    const target = path.join(repoRoot, "docs/contracts/openapi", `${serviceName}.openapi.json`);
    fs.copyFileSync(source, target);
  }
}

const openApiFiles = [
  ...listFiles("services", (file) => file.endsWith("/docs/openapi.json")),
  ...listFiles("docs/contracts/openapi", (file) => file.endsWith(".json")),
  ...listFiles("release", (file) => file.includes("/openapi/") && file.endsWith(".json"))
].sort();

const versionedPathPattern = /^\/api\/v\d+(?:\/|$)/;
const failures = [];

for (const file of openApiFiles) {
  const document = JSON.parse(fs.readFileSync(path.join(repoRoot, file), "utf8"));
  const paths = Object.keys(document.paths ?? {});
  if (paths.length === 0) {
    failures.push(`${file}: no paths defined`);
    continue;
  }
  for (const publicPath of paths) {
    if (!versionedPathPattern.test(publicPath)) {
      failures.push(`${file}: unversioned public path ${publicPath}`);
    }
  }
  if (!document.info?.version) {
    failures.push(`${file}: missing info.version`);
  }
  if (!document.openapi?.startsWith("3.")) {
    failures.push(`${file}: missing OpenAPI 3.x version`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    process.stderr.write(`${failure}\n`);
  }
  process.exit(1);
}

process.stdout.write(`Validated ${openApiFiles.length} OpenAPI document(s); all public paths are /api/v... versioned.\n`);
