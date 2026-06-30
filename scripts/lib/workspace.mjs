import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function serviceDirectories() {
  const servicesRoot = path.join(repoRoot, "services");
  return fs.readdirSync(servicesRoot)
    .map((name) => path.join("services", name))
    .filter((servicePath) => fs.existsSync(path.join(repoRoot, servicePath, "package.json")))
    .sort();
}

export function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    stdio: options.stdio ?? "inherit",
    env: { ...process.env, ...(options.env ?? {}) },
    shell: false
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const printable = [command, ...args].join(" ");
    throw new Error(`${printable} failed with exit code ${result.status}`);
  }
  return result;
}

export function listFiles(start, predicate = () => true) {
  const absoluteStart = path.join(repoRoot, start);
  if (!fs.existsSync(absoluteStart)) {
    return [];
  }
  const output = [];
  const visit = (absolutePath) => {
    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(absolutePath)) {
        if (entry === "node_modules" || entry === ".git") {
          continue;
        }
        visit(path.join(absolutePath, entry));
      }
      return;
    }
    const relativePath = path.relative(repoRoot, absolutePath);
    if (predicate(relativePath)) {
      output.push(relativePath);
    }
  };
  visit(absoluteStart);
  return output.sort();
}

export function ensureDir(relativePath) {
  fs.mkdirSync(path.join(repoRoot, relativePath), { recursive: true });
}

export function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}
