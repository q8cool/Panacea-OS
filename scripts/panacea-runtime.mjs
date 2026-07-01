import { execFileSync } from "node:child_process";
import {
  compose,
  execFile,
  postgresContainer,
  runtimeServices,
  waitForHttpJson
} from "./lib/runtime-validation.mjs";

const action = process.argv[2];

function write(message) {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function inspectContainer(container) {
  const result = execFile("docker", [
    "inspect",
    "-f",
    "{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}",
    container
  ], { allowFailure: true });
  if (result.status !== 0) {
    return { exists: false, status: "missing", health: "missing" };
  }
  const [status, health] = result.stdout.trim().split(/\s+/);
  return { exists: true, status, health };
}

function assertDockerAvailable() {
  const result = execFile("docker", ["version", "--format", "{{.Server.Version}}"], { allowFailure: true });
  if (result.status !== 0) {
    fail(`Docker is not available or not running.\n${result.stderr.trim()}`);
  }
}

async function startRuntime() {
  assertDockerAvailable();
  compose(["up", "-d", "--build"], { stdio: "inherit" });
  write("panacea.runtime action=start result=started");
}

function stopRuntime() {
  assertDockerAvailable();
  compose(["down", "--remove-orphans"], { stdio: "inherit" });
  write("panacea.runtime action=stop result=stopped volumes=preserved");
}

function showStatus() {
  assertDockerAvailable();
  compose(["ps"], { stdio: "inherit" });
  const postgres = inspectContainer(postgresContainer);
  write(`panacea.status service=postgres container=${postgresContainer} state=${postgres.status} health=${postgres.health}`);
  for (const service of runtimeServices) {
    const state = inspectContainer(service.container);
    write(`panacea.status service=${service.name} container=${service.container} state=${state.status} health=${state.health}`);
  }
}

async function checkService(service) {
  const state = inspectContainer(service.container);
  if (!state.exists || state.status !== "running") {
    throw new Error(`${service.name} container is ${state.status}; run npm run panacea:start first`);
  }
  if (state.health !== "healthy" && state.health !== "no-healthcheck") {
    throw new Error(`${service.name} container health is ${state.health}`);
  }

  const endpoints = {
    live: `${service.basePath}/live`,
    ready: `${service.basePath}/ready`,
    metrics: `${service.basePath}/metrics`,
    openapi: `${service.basePath}/docs/openapi.json`
  };
  const statuses = {};
  for (const [name, endpoint] of Object.entries(endpoints)) {
    const url = `http://127.0.0.1:${service.hostPort}${endpoint}`;
    const result = await waitForHttpJson(url, { attempts: 5 });
    statuses[name] = result.response.status;
    if (!result.response.ok) {
      throw new Error(`${service.name} ${name} returned HTTP ${result.response.status}`);
    }
  }
  write(`panacea.health service=${service.name} container=${state.health} live=${statuses.live} ready=${statuses.ready} metrics=${statuses.metrics} openapi=${statuses.openapi}`);
}

async function checkHealth() {
  assertDockerAvailable();
  const postgres = inspectContainer(postgresContainer);
  if (!postgres.exists || postgres.status !== "running") {
    throw new Error(`PostgreSQL container is ${postgres.status}; run npm run panacea:start first`);
  }
  const pgReady = execFile("docker", ["exec", postgresContainer, "pg_isready", "-U", "panacea", "-d", "panacea_runtime"], {
    allowFailure: true
  });
  if (pgReady.status !== 0) {
    throw new Error(`PostgreSQL readiness failed: ${pgReady.stderr.trim() || pgReady.stdout.trim()}`);
  }
  write(`panacea.health service=postgres container=${postgres.health} ready=0`);
  for (const service of runtimeServices) {
    await checkService(service);
  }
  write("panacea.health result=pass");
}

async function main() {
  if (action === "start") {
    await startRuntime();
    return;
  }
  if (action === "stop") {
    stopRuntime();
    return;
  }
  if (action === "restart") {
    stopRuntime();
    await startRuntime();
    return;
  }
  if (action === "status") {
    showStatus();
    return;
  }
  if (action === "health") {
    await checkHealth();
    return;
  }
  const script = execFileSync("node", ["-e", "const p=require('./package.json'); console.log(Object.keys(p.scripts).filter((s)=>s.startsWith('panacea:')).join('\\n'))"], {
    encoding: "utf8"
  }).trim();
  fail(`Unknown panacea runtime action: ${action ?? "(missing)"}\nAvailable npm scripts:\n${script}`);
}

main().catch((error) => {
  fail(error.stack ?? error.message);
});
