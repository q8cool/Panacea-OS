import { listFiles, run } from "./lib/workspace.mjs";

const mode = process.argv[2] ?? "all";
const allTests = listFiles("tests", (file) => file.endsWith(".test.mjs"));

const filters = {
  all: () => true,
  unit: (file) => file.endsWith("service.test.mjs"),
  integration: (file) => file.includes(".integration.test.mjs"),
  contract: (file) => file.includes("contract.test.mjs")
};

if (!filters[mode]) {
  throw new Error(`Unknown test mode ${mode}. Expected one of: ${Object.keys(filters).join(", ")}`);
}

const selectedTests = allTests.filter(filters[mode]);
if (selectedTests.length === 0) {
  throw new Error(`No ${mode} tests found`);
}

process.stdout.write(`Running ${selectedTests.length} ${mode} test file(s).\n`);
run("node", ["--test", ...selectedTests]);
