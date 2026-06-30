import path from "node:path";
import { readJson, repoRoot, run, serviceDirectories } from "./lib/workspace.mjs";

const [scriptName, separator, ...forwardedArgs] = process.argv.slice(2);

if (!scriptName) {
  throw new Error("Usage: node scripts/run-service-script.mjs <script> [-- forwarded args]");
}

const argsToForward = separator === "--" ? forwardedArgs : [separator, ...forwardedArgs].filter(Boolean);

for (const servicePath of serviceDirectories()) {
  const packageJson = readJson(path.join(servicePath, "package.json"));
  if (!packageJson.scripts?.[scriptName]) {
    continue;
  }
  process.stdout.write(`\n== ${servicePath}: npm run ${scriptName} ==\n`);
  run("npm", ["--prefix", path.join(repoRoot, servicePath), "run", scriptName, ...argsToForward]);
}
