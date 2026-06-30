import fs from "node:fs";
import path from "node:path";
import { listFiles, repoRoot } from "./lib/workspace.mjs";

const jsonFiles = [
  "package.json",
  ...listFiles("services", (file) => file.endsWith("package.json") || file.endsWith("openapi.json")),
  ...listFiles("docs/contracts/openapi", (file) => file.endsWith(".json")),
  ...listFiles("release", (file) => file.endsWith(".json"))
];

for (const file of jsonFiles) {
  JSON.parse(fs.readFileSync(path.join(repoRoot, file), "utf8"));
}

const shellFiles = listFiles("release", (file) => file.endsWith(".sh"));
for (const file of shellFiles) {
  const content = fs.readFileSync(path.join(repoRoot, file), "utf8");
  if (!content.startsWith("#!")) {
    throw new Error(`${file} is missing a shebang`);
  }
}

process.stdout.write(`Format validation passed for ${jsonFiles.length} JSON file(s) and ${shellFiles.length} shell script(s).\n`);
