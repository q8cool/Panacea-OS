import { run } from "./lib/workspace.mjs";

const gates = [
  ["npm", ["run", "typecheck"]],
  ["npm", ["run", "build"]],
  ["npm", ["run", "check"]],
  ["npm", ["run", "test:run"]],
  ["npm", ["run", "openapi"]],
  ["npm", ["run", "audit"]],
  ["node", ["scripts/validate-migrations.mjs"]],
  ["node", ["scripts/validate-docker.mjs"]],
  ["node", ["scripts/validate-kubernetes.mjs"]]
];

for (const [command, args] of gates) {
  process.stdout.write(`\n== ${command} ${args.join(" ")} ==\n`);
  run(command, args);
}

process.stdout.write("Panacea quality gate passed.\n");
