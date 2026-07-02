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
  "docs/user-guides/Domain_And_DNS_Setup_Guide.md",
  "docs/user-guides/Pilot_Database_Setup_Guide.md",
  "docs/user-guides/Pilot_Backup_Restore_Runbook.md",
  "docs/user-guides/Security_Boundary_Validation_Guide.md",
  "docs/user-guides/Pilot_Security_Deployment_Checklist.md",
  "docs/user-guides/Operator_Production_Readiness_Guide.md",
  "docs/roadmap/Sprint_116_Production_Hardening_Final_Release_Report.md"
]);

const deploymentDocuments = Object.freeze([
  "docs/user-guides/External_Server_Deployment_Runbook.md",
  "docs/user-guides/External_Server_Prerequisite_Checklist.md",
  "docs/user-guides/Pilot_Go_Live_Checklist.md",
  "docs/operations/External_Pilot_Route_Verification_Template.md",
  "docs/user-guides/Pilot_Rollback_And_Recovery_Runbook.md",
  "docs/roadmap/Sprint_118_External_Server_Deployment_Go_Live_Report.md",
  "docs/user-guides/Real_Server_Deployment_Execution_Checklist.md",
  "docs/operations/Real_Server_Deployment_Evidence_Template.md",
  "docs/operations/External_Health_Verification_Commands.md",
  "docs/user-guides/Pilot_Operator_Acceptance_Checklist.md",
  "docs/user-guides/Clinical_And_Legal_Boundary_Statement.md",
  "docs/roadmap/Sprint_119_Real_Server_Deployment_Execution_Report.md"
]);

const utbeDocuments = Object.freeze([
  "docs/user-guides/UTBE_Domain_DNS_Setup_Guide.md",
  "docs/user-guides/UTBE_HTTPS_Certificate_Runbook.md",
  "docs/operations/UTBE_External_API_Route_Matrix.md",
  "docs/roadmap/Final_UTBE_Domain_Deployment_Readiness_Report.md"
]);

const pilotArtifacts = Object.freeze([
  ".env.example",
  ".env.local.example",
  ".env.pilot.example",
  ".env.production.example",
  "infra/docker-compose/pilot/docker-compose.yml",
  "infra/docker-compose/pilot/README.md",
  "infra/reverse-proxy/README.md",
  "infra/reverse-proxy/nginx.panacea.example.conf",
  "infra/reverse-proxy/nginx.utbe.panacea.conf",
  "docs/operations/Pilot_Service_Health_Matrix.json"
]);

const utbeArtifacts = Object.freeze([
  ".env.utbe.pilot.example",
  "infra/reverse-proxy/nginx.utbe.panacea.conf"
]);

const utbeWebUrl = "https://panacea.utbe.ai";
const utbeApiUrl = "https://api.panacea.utbe.ai";

const requiredEnvironmentVariables = Object.freeze([
  "PANACEA_RUNTIME_MODE",
  "PANACEA_PUBLIC_WEB_URL",
  "PANACEA_API_PUBLIC_BASE_URL",
  "PANACEA_CORS_ALLOWED_ORIGINS",
  "PANACEA_JWT_ISSUER",
  "PANACEA_JWT_AUDIENCE",
  "POSTGRES_HOST",
  "POSTGRES_PORT",
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "PANACEA_BACKUP_DIR",
  "PANACEA_LOG_LEVEL",
  "PANACEA_SERVICE_AUTONOMOUS_HEALTHCARE_INTELLIGENCE_URL",
  "PANACEA_SERVICE_GLOBAL_COMMAND_INTELLIGENCE_URL",
  "PANACEA_SERVICE_GLOBAL_WORKFORCE_URL",
  "PANACEA_SERVICE_GLOBAL_LEGAL_GOVERNANCE_URL",
  "PANACEA_SERVICE_GLOBAL_CUSTOMER_SUCCESS_URL",
  "PANACEA_SERVICE_GLOBAL_PRODUCT_MANAGEMENT_URL",
  "PANACEA_SERVICE_GLOBAL_COMPLIANCE_URL",
  "PANACEA_SERVICE_GLOBAL_AI_ASSURANCE_URL",
  "PANACEA_SERVICE_GLOBAL_PRIVACY_URL"
]);

const unsafeTemplateValues = Object.freeze(new Set([
  "",
  "CHANGE_ME_NON_SECRET_PLACEHOLDER",
  "REPLACE_WITH_REAL_VALUE_OUTSIDE_GIT",
  "EXAMPLE_ONLY_NOT_A_SECRET"
]));

const envTemplateFiles = Object.freeze([".env.example", ".env.local.example", ".env.pilot.example", ".env.production.example", ".env.utbe.pilot.example"]);

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

function readEnvironmentTemplate(filePath) {
  const values = new Map();
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#") || !line.includes("=")) {
      continue;
    }
    const [key, ...valueParts] = line.split("=");
    values.set(key.trim(), valueParts.join("=").trim());
  }
  return values;
}

function assertRequiredArtifacts() {
  for (const artifact of [...pilotArtifacts, ...pilotDocuments, ...deploymentDocuments]) {
    if (!fs.existsSync(artifact)) {
      throw new Error(`Missing required pilot artifact: ${artifact}`);
    }
  }
}

function assertUtbeArtifacts() {
  for (const artifact of [...utbeDocuments, ...utbeArtifacts]) {
    if (!fs.existsSync(artifact)) {
      throw new Error(`Missing required UTBE artifact: ${artifact}`);
    }
  }
}

function readTrackedFiles() {
  return execFileSync("git", ["ls-files"], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
}

function assertEnvironmentTemplates() {
  for (const template of envTemplateFiles) {
    const values = readEnvironmentTemplate(template);
    for (const variable of requiredEnvironmentVariables) {
      if (!values.has(variable)) {
        throw new Error(`${template} is missing required variable ${variable}`);
      }
    }
  }
}

function assertNoCommittedRealEnvFiles() {
  const tracked = readTrackedFiles();
  const allowed = new Set(envTemplateFiles);
  const committedEnvFiles = tracked.filter((file) => (file === ".env" || file.startsWith(".env.")) && !allowed.has(file));
  if (committedEnvFiles.length > 0) {
    throw new Error(`Committed environment files are not allowed: ${committedEnvFiles.join(", ")}`);
  }
}

function assertFileContains(filePath, requiredValues) {
  const text = fs.readFileSync(filePath, "utf8");
  for (const value of requiredValues) {
    if (!text.includes(value)) {
      throw new Error(`${filePath} is missing required value: ${value}`);
    }
  }
  return text;
}

function utbeEndpointUrls() {
  const suffixes = ["/live", "/ready", "/metrics", "/docs/openapi.json"];
  return runtimeServices.flatMap((service) => suffixes.map((suffix) => `${utbeApiUrl}${service.basePath}${suffix}`));
}

function assertSafeEnvironmentTemplatePatterns() {
  const riskyPatterns = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bghp_[A-Za-z0-9_]{20,}\b/,
    /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
    /\bsk-[A-Za-z0-9]{20,}\b/,
    /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{10,}\b/,
    /\bBearer\s+[A-Za-z0-9._~+/=-]{20,}\b/
  ];
  for (const template of envTemplateFiles) {
    const text = fs.readFileSync(template, "utf8");
    for (const pattern of riskyPatterns) {
      if (pattern.test(text)) {
        throw new Error(`${template} contains a realistic secret-like sample matching ${pattern}`);
      }
    }
  }
}

function assertPilotEnvironmentIfActive() {
  const mode = process.env.PANACEA_RUNTIME_MODE;
  if (!mode) {
    return;
  }
  if (unsafeTemplateValues.has(mode) || !["local", "pilot", "production"].includes(mode)) {
    throw new Error(`PANACEA_RUNTIME_MODE must be local, pilot, or production; received ${mode}`);
  }
  if (!["pilot", "production"].includes(mode)) {
    return;
  }
  for (const variable of requiredEnvironmentVariables) {
    const value = process.env[variable]?.trim() ?? "";
    if (unsafeTemplateValues.has(value)) {
      throw new Error(`${variable} must be set to a real operator-provided value outside Git for ${mode} mode`);
    }
  }
}

function assertHealthMatrix() {
  const matrix = JSON.parse(fs.readFileSync("docs/operations/Pilot_Service_Health_Matrix.json", "utf8"));
  if (!Array.isArray(matrix.services) || matrix.services.length !== runtimeServices.length) {
    throw new Error(`Pilot health matrix must include ${runtimeServices.length} services`);
  }
  for (const service of runtimeServices) {
    const entry = matrix.services.find((candidate) => candidate.serviceName === service.name);
    if (!entry) {
      throw new Error(`Pilot health matrix missing ${service.name}`);
    }
    if (entry.localPort !== service.hostPort) {
      throw new Error(`${service.name} health matrix port mismatch: expected ${service.hostPort}`);
    }
    for (const [key, suffix] of Object.entries({
      livePath: "/live",
      readyPath: "/ready",
      metricsPath: "/metrics",
      openapiPath: "/docs/openapi.json"
    })) {
      const expected = `${service.basePath}${suffix}`;
      if (entry[key] !== expected) {
        throw new Error(`${service.name} health matrix ${key} mismatch: expected ${expected}`);
      }
      if (!entry[key].startsWith("/api/v")) {
        throw new Error(`${service.name} health matrix ${key} is not versioned`);
      }
    }
  }
}

function assertLoopbackPortBindings() {
  const runtimeCompose = fs.readFileSync("infra/docker-compose/runtime/docker-compose.yml", "utf8");
  const loopbackRuntimePorts = ["55433", ...runtimeServices.map((service) => String(service.hostPort))];
  for (const port of loopbackRuntimePorts) {
    if (!runtimeCompose.includes(`"127.0.0.1:${port}:`)) {
      throw new Error(`runtime Docker Compose must bind host port ${port} to 127.0.0.1`);
    }
    for (const unsafeBinding of [`"${port}:`, `"0.0.0.0:${port}:`, `":${port}:`]) {
      if (runtimeCompose.includes(unsafeBinding)) {
        throw new Error(`runtime Docker Compose exposes unsafe host port binding: ${unsafeBinding}`);
      }
    }
  }

  const pilotCompose = fs.readFileSync("infra/docker-compose/pilot/docker-compose.yml", "utf8");
  const requiredPilotBindings = [
    "127.0.0.1:${POSTGRES_PORT:-5432}:5432",
    "127.0.0.1:${PANACEA_PORT_AUTONOMOUS_HEALTHCARE_INTELLIGENCE:-18094}:8094",
    "127.0.0.1:${PANACEA_PORT_GLOBAL_COMMAND_INTELLIGENCE:-18095}:8095",
    "127.0.0.1:${PANACEA_PORT_GLOBAL_WORKFORCE:-18141}:8141",
    "127.0.0.1:${PANACEA_PORT_GLOBAL_LEGAL_GOVERNANCE:-18142}:8142",
    "127.0.0.1:${PANACEA_PORT_GLOBAL_CUSTOMER_SUCCESS:-18143}:8143",
    "127.0.0.1:${PANACEA_PORT_GLOBAL_PRODUCT_MANAGEMENT:-18144}:8144",
    "127.0.0.1:${PANACEA_PORT_GLOBAL_COMPLIANCE:-18145}:8145",
    "127.0.0.1:${PANACEA_PORT_GLOBAL_AI_ASSURANCE:-18146}:8146",
    "127.0.0.1:${PANACEA_PORT_GLOBAL_PRIVACY:-18147}:8147"
  ];
  for (const binding of requiredPilotBindings) {
    if (!pilotCompose.includes(binding)) {
      throw new Error(`pilot Docker Compose must bind through loopback only: ${binding}`);
    }
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
  write("panacea.pilot.config compose=infra/docker-compose/pilot/docker-compose.yml reverseProxy=infra/reverse-proxy/nginx.utbe.panacea.conf healthMatrix=docs/operations/Pilot_Service_Health_Matrix.json");
  for (const service of runtimeServices) {
    write(`panacea.pilot.config service=${service.name} port=${service.hostPort} live=${service.basePath}/live ready=${service.basePath}/ready metrics=${service.basePath}/metrics openapi=${service.basePath}/docs/openapi.json`);
  }
  write("panacea.pilot.config identity=external-foundation-provider-required liveMode=requires-foundation-issued-token");
}

function checkPilotReadiness() {
  assertRequiredArtifacts();
  assertEnvironmentTemplates();
  assertPilotEnvironmentIfActive();
  assertHealthMatrix();
  assertLoopbackPortBindings();
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  for (const script of [
    "panacea:start",
    "panacea:stop",
    "panacea:restart",
    "panacea:status",
    "panacea:health",
    "panacea:pilot:check",
    "panacea:pilot:config",
    "panacea:pilot:health"
  ]) {
    if (!packageJson.scripts?.[script]) {
      throw new Error(`Missing required pilot script: ${script}`);
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

function verifyDeploymentReadiness() {
  assertRequiredArtifacts();
  assertEnvironmentTemplates();
  assertSafeEnvironmentTemplatePatterns();
  assertNoCommittedRealEnvFiles();
  assertHealthMatrix();
  assertLoopbackPortBindings();
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  for (const script of [
    "runtime:orchestration",
    "runtime:disaster-recovery",
    "panacea:start",
    "panacea:stop",
    "panacea:restart",
    "panacea:status",
    "panacea:health",
    "panacea:pilot:check",
    "panacea:pilot:config",
    "panacea:pilot:health",
    "panacea:deployment:verify"
  ]) {
    if (!packageJson.scripts?.[script]) {
      throw new Error(`Missing required deployment script: ${script}`);
    }
  }
  write(`panacea.deployment.verify result=pass services=${runtimeServices.length} docs=${pilotDocuments.length + deploymentDocuments.length} envTemplates=${envTemplateFiles.length}`);
}

function verifyUtbeReadiness() {
  assertRequiredArtifacts();
  assertUtbeArtifacts();
  assertEnvironmentTemplates();
  assertSafeEnvironmentTemplatePatterns();
  assertNoCommittedRealEnvFiles();
  assertHealthMatrix();
  assertLoopbackPortBindings();

  const tracked = readTrackedFiles();
  if (tracked.includes(".env.utbe.pilot")) {
    throw new Error(".env.utbe.pilot must never be committed");
  }

  const utbeEnv = readEnvironmentTemplate(".env.utbe.pilot.example");
  for (const [key, expected] of [
    ["PANACEA_RUNTIME_MODE", "pilot"],
    ["PANACEA_PUBLIC_WEB_URL", utbeWebUrl],
    ["PANACEA_API_PUBLIC_BASE_URL", utbeApiUrl],
    ["PANACEA_CORS_ALLOWED_ORIGINS", utbeWebUrl]
  ]) {
    if (utbeEnv.get(key) !== expected) {
      throw new Error(`.env.utbe.pilot.example ${key} must equal ${expected}`);
    }
  }

  const routeMatrix = assertFileContains("docs/operations/UTBE_External_API_Route_Matrix.md", [utbeWebUrl, utbeApiUrl, ...utbeEndpointUrls()]);
  if ((routeMatrix.match(/Expected status/g) ?? []).length === 0) {
    throw new Error("UTBE route matrix must document expected status");
  }

  assertFileContains("infra/reverse-proxy/nginx.utbe.panacea.conf", [
    "server_name panacea.utbe.ai",
    "server_name api.panacea.utbe.ai",
    "/etc/letsencrypt/live/panacea.utbe.ai/fullchain.pem",
    "/etc/letsencrypt/live/api.panacea.utbe.ai/fullchain.pem",
    'Access-Control-Allow-Origin "https://panacea.utbe.ai"'
  ]);
  assertFileContains("docs/user-guides/Clinical_And_Legal_Boundary_Statement.md", [
    "not approved for real clinical production use",
    "does not autonomously diagnose",
    "does not autonomously prescribe",
    "Human approval is required"
  ]);

  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  for (const script of ["panacea:utbe:verify", "panacea:utbe:external-health"]) {
    if (!packageJson.scripts?.[script]) {
      throw new Error(`Missing required UTBE script: ${script}`);
    }
  }

  write(`panacea.utbe.verify result=pass web=${utbeWebUrl} api=${utbeApiUrl} routes=${utbeEndpointUrls().length}`);
}

async function checkUtbeExternalHealth() {
  const timeoutMs = Number(process.env.PANACEA_UTBE_EXTERNAL_TIMEOUT_MS ?? 5000);
  for (const url of utbeEndpointUrls()) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      write(`panacea.utbe.external-health url=${url} status=${response.status}`);
    } catch (error) {
      throw new Error(`UTBE external health failed for ${url}: ${error.message}. Confirm DNS, HTTPS, Nginx, and the pilot stack before rerunning.`);
    } finally {
      clearTimeout(timeout);
    }
  }
  write(`panacea.utbe.external-health result=pass routes=${utbeEndpointUrls().length}`);
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
  if (action === "pilot-health") {
    await checkHealth();
    write("panacea.pilot.health result=pass");
    return;
  }
  if (action === "deployment-verify") {
    verifyDeploymentReadiness();
    return;
  }
  if (action === "utbe-verify") {
    verifyUtbeReadiness();
    return;
  }
  if (action === "utbe-external-health") {
    await checkUtbeExternalHealth();
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
