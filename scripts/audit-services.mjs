import path from "node:path";
import { repoRoot, run, serviceDirectories } from "./lib/workspace.mjs";

const forwardedArgs = process.argv.slice(2);

for (const servicePath of serviceDirectories()) {
  process.stdout.write(`\n== ${servicePath}: npm audit ${forwardedArgs.join(" ")} ==\n`);
  run("npm", ["--prefix", path.join(repoRoot, servicePath), "audit", ...forwardedArgs]);
}
