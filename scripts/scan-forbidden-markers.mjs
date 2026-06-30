import fs from "node:fs";
import path from "node:path";
import { listFiles, repoRoot } from "./lib/workspace.mjs";

const fragments = [
  ["TO", "DO"],
  ["FIX", "ME"],
  ["place", "holder"],
  ["mo", "ck"],
  ["fa", "ke"],
  ["st", "ub"],
  ["in-", "memory repository"],
  ["in_", "memory"],
  ["In", "Memory"],
  ["memory ", "repository"],
  ["Bin", "ance"],
  ["trading ", "recorder"]
];

const expressions = fragments.map(([left, right]) => new RegExp(`${left}${right}`, "i"));
const files = [
  ...listFiles("services", (file) => file.endsWith(".mjs") || file.endsWith(".json") || file.endsWith(".sql")),
  ...listFiles("tests", (file) => file.endsWith(".mjs")),
  ...listFiles("infra", (file) => file.endsWith(".yaml") || file.endsWith(".yml")),
  ...listFiles("release", (file) => file.endsWith(".yaml") || file.endsWith(".yml") || file.endsWith(".json") || file.endsWith(".sql") || file.endsWith(".sh")),
  ...listFiles("docs/contracts", (file) => file.endsWith(".md") || file.endsWith(".json")),
  ".gitignore",
  "README.md",
  "package.json"
].filter((file, index, all) => all.indexOf(file) === index);

const allowed = [
  /No production in-memory repositor/i,
  /PostgreSQL is the production persistence mechanism/i
];

const hits = [];
for (const file of files) {
  const absolutePath = path.join(repoRoot, file);
  if (!fs.existsSync(absolutePath)) {
    continue;
  }
  const content = fs.readFileSync(absolutePath, "utf8");
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (allowed.some((rule) => rule.test(line))) {
      return;
    }
    if (expressions.some((rule) => rule.test(line))) {
      hits.push(`${file}:${index + 1}:${line.trim()}`);
    }
  });
}

if (hits.length > 0) {
  for (const hit of hits) {
    process.stderr.write(`${hit}\n`);
  }
  process.exit(1);
}

process.stdout.write(`Forbidden marker scan passed across ${files.length} Panacea file(s).\n`);
