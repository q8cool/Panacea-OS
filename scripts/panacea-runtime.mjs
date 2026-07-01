import { execFileSync } from "node:child_process";
import fs from "node:fs";
import {
  compose,
  execFile,
  postgresContainer,
  runtimeServices,
  waitForHttpJson
} from "./lib/runtime-validation.mjs";

const action = process.argv[2];
const healthAttempts = Number(process.env.PANACEA_HEALTH_ATTEMPTS ?? 60);
const healthDelayMs = Number(process.env.PANACEA_HEALTH_DELAY_MS ?? 2000);

const pilotDocuments = Object.freeze([
  "docs/user-guides/Production_Like_Deployment_Runbook.md",
  "docs/user-guides/Panacea_Start_Stop_Status_Guide.md",
  "docs/user-guides/Backup_And_Restore_Guide.md",
  "docs/user-guides/Security_Boundary_Validation_Guide.md",
  "docs/user-guides/Operator_Production_Readiness_Guide.md",
  "docs/roadmap/Sprint_116_Production_Hardening_Final_Release_Report.md"
]);

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForContainerHealth(container, label) {
  let lastState = { exists: false, status: "missing", health: "missing" };
  for (let attempt = 1; attempt <= healthAttempts; attempt += 1) {
    lastState = inspectContainer(container);
    if (lastState.exists && lastState.status === "running" && (lastState.health === "healthy" || lastState.health === "no-healthcheck")) {
      return lastState;
    }
    if (lastState.exists && ["dead", "exited"].includes(lastState.status)) {
      throw new Error(`${label} container stopped unexpectedly with state=${lastState.status} health=${lastState.health}`);
    }
    if (attempt < healthAttempts) {
      await sleep(healthDelayMs);
    }
  }
  throw new Error(`${label} container did not become healthy after ${healthAttempts} attempts: state=${lastState.status} health=${lastState.health}`);
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
  const initialState = inspectContainer(service.container);
  if (!initialState.exists) {
    throw new Error(`${service.name} container is ${initialState.status}; run npm run panacea:start first`);
  }
  const state = await waitForContainerHealth(service.container, service.name);

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
  const postgresInitial = inspectContainer(postgresContainer);
  if (!postgresInitial.exists) {
    throw new Error(`PostgreSQL container is ${postgresInitial.status}; run npm run panacea:start first`);
  }
  const postgres = await waitForContainerHealth(postgresContainer, "PostgreSQL");
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

function showPilotConfig() {
  write("panacea.pilot.config mode=controlled-production-like-pilot");
  write("panacea.pilot.config database=postgres container=panacea-runtime-postgres hostPort=55433 databaseName=panacea_runtime");
  for (const service of runtimeServices) {
    write(`panacea.pilot.config service=${service.name} port=${service.hostPort} live=${service.basePath}/live ready=${service.basePath}/ready metrics=${service.basePath}/metrics openapi=${service.basePath}/docs/openapi.json`);
  }
  write("panacea.pilot.config identity=external-foundation-provider-required liveMode=requires-foundation-issued-token");
}

function checkPilotReadiness() {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  for (const script of [
    "panacea:start",
    "panacea:stop",
    "panacea:restart",
    "panacea:status",
    "panacea:health",
    "panacea:pilot:check",
    "panacea:pilot:config"
  ]) {
    if (!packageJson.scripts?.[script]) {
      throw new Error(`Missing required pilot script: ${script}`);
    }
  }
  for (const documentPath of pilotDocuments) {
    if (!fs.existsSync(documentPath)) {
      throw new Error(`Missing required pilot document: ${documentPath}`);
    }
  }
  for (const service of runtimeServices) {
    for (const endpoint of ["/live", "/ready", "/metrics", "/docs/openapi.json"]) {
      if (!`${service.basePath}${endpoint}`.startsWith("/api/v")) {
        throw new Error(`${service.name} pilot endpoint is not versioned: ${service.basePath}${endpoint}`);
      }
    }
  }
  write(`panacea.pilot.check result=pass services=${runtimeServices.length} documents=${pilotDocuments.length}`);
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
  if (action === "pilot-config") {
    showPilotConfig();
    return;
  }
  if (action === "pilot-check") {
    checkPilotReadiness();
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
