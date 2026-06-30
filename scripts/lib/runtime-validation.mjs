import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { repoRoot, serviceDirectories } from "./workspace.mjs";

export const composeFile = path.join(repoRoot, "infra/docker-compose/runtime/docker-compose.yml");
export const postgresContainer = "panacea-runtime-postgres";

export const runtimeServices = Object.freeze([
  {
    name: "autonomous-healthcare-intelligence-foundation",
    container: "panacea-runtime-autonomous-healthcare-intelligence-foundation",
    hostPort: 18094,
    basePath: "/api/v4/autonomous-healthcare-intelligence"
  },
  {
    name: "global-workforce-hr-credentialing-staff-experience-platform",
    container: "panacea-runtime-global-workforce-hr-credentialing-staff-experience-platform",
    hostPort: 18141,
    basePath: "/api/v3/global-workforce"
  },
  {
    name: "global-legal-contracting-risk-governance-platform",
    container: "panacea-runtime-global-legal-contracting-risk-governance-platform",
    hostPort: 18142,
    basePath: "/api/v3/global-legal-governance"
  },
  {
    name: "global-customer-success-support-service-management-platform",
    container: "panacea-runtime-global-customer-success-support-service-management-platform",
    hostPort: 18143,
    basePath: "/api/v3/global-customer-success"
  },
  {
    name: "global-product-management-roadmap-innovation-portfolio-platform",
    container: "panacea-runtime-global-product-management-roadmap-innovation-portfolio-platform",
    hostPort: 18144,
    basePath: "/api/v3/global-product-management"
  },
  {
    name: "global-compliance-automation-regulatory-intelligence-platform",
    container: "panacea-runtime-global-compliance-automation-regulatory-intelligence-platform",
    hostPort: 18145,
    basePath: "/api/v3/global-compliance"
  },
  {
    name: "global-ai-assurance-safety-model-risk-management-platform",
    container: "panacea-runtime-global-ai-assurance-safety-model-risk-management-platform",
    hostPort: 18146,
    basePath: "/api/v3/global-ai-assurance"
  },
  {
    name: "global-enterprise-data-privacy-consent-trust-platform",
    container: "panacea-runtime-global-enterprise-data-privacy-consent-trust-platform",
    hostPort: 18147,
    basePath: "/api/v3/global-privacy"
  },
  {
    name: "real-time-global-healthcare-command-intelligence-platform",
    container: "panacea-runtime-real-time-global-healthcare-command-intelligence-platform",
    hostPort: 18095,
    basePath: "/api/v4/global-command-intelligence"
  }
]);

export function execFile(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, ...(options.env ?? {}) },
    input: options.input,
    encoding: options.encoding ?? "utf8",
    stdio: options.stdio ?? "pipe",
    shell: false
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error([
      `${[command, ...args].join(" ")} failed with exit code ${result.status}`,
      result.stdout,
      result.stderr
    ].filter(Boolean).join("\n"));
  }
  return result;
}

export function compose(args, options = {}) {
  return execFile("docker", ["compose", "-f", composeFile, ...args], options);
}

export async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientPostgresFailure(result) {
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  return /database system is (?:starting up|shutting down)|could not connect|connection refused|server closed the connection unexpectedly|no response/i.test(output);
}

function commandFailure(command, args, result) {
  return new Error([
    `${[command, ...args].join(" ")} failed with exit code ${result.status}`,
    result.stdout,
    result.stderr
  ].filter(Boolean).join("\n"));
}

export async function dockerExecWithRetry(args, options = {}, { attempts = 30, delayMs = 1000 } = {}) {
  let lastResult;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = execFile("docker", args, { ...options, allowFailure: true });
    if (result.status === 0) {
      return result;
    }
    lastResult = result;
    if (!isTransientPostgresFailure(result) || attempt === attempts) {
      break;
    }
    await wait(delayMs);
  }
  throw commandFailure("docker", args, lastResult);
}

export async function waitForPostgres({ attempts = 60, stableChecks = 3 } = {}) {
  let stable = 0;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const ready = execFile("docker", ["exec", postgresContainer, "pg_isready", "-U", "panacea", "-d", "panacea_runtime"], {
      allowFailure: true
    });
    const sql = execFile("docker", ["exec", postgresContainer, "psql", "-U", "panacea", "-d", "panacea_runtime", "-Atc", "SELECT 1;"], {
      allowFailure: true
    });
    if (ready.status === 0 && sql.status === 0 && sql.stdout.trim() === "1") {
      stable += 1;
      if (stable >= stableChecks) {
        return;
      }
    } else {
      stable = 0;
    }
    await wait(1000);
  }
  throw new Error("PostgreSQL did not become stably ready");
}

export async function waitForHttpJson(url, { attempts = 40, options = {} } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const body = await response.text();
      let json = {};
      if (body.trim()) {
        json = JSON.parse(body);
      }
      return { response, json, body };
    } catch (error) {
      lastError = error;
      await wait(1000);
    }
  }
  throw lastError ?? new Error(`HTTP endpoint did not respond: ${url}`);
}

export function migrationFiles() {
  return serviceDirectories()
    .flatMap((servicePath) => {
      const migrationRoot = path.join(repoRoot, servicePath, "migrations");
      return fs.readdirSync(migrationRoot)
        .filter((file) => file.endsWith(".sql"))
        .sort()
        .map((file) => path.join(servicePath, "migrations", file));
    })
    .sort();
}

export async function applyMigrations(label = "forward") {
  for (const migration of migrationFiles()) {
    const sql = fs.readFileSync(path.join(repoRoot, migration), "utf8");
    await dockerExecWithRetry(["exec", "-i", postgresContainer, "psql", "-v", "ON_ERROR_STOP=1", "-U", "panacea", "-d", "panacea_runtime"], {
      input: sql
    });
    process.stdout.write(`migration.${label}: ${migration}\n`);
  }
}

export async function queryScalar(sql) {
  const result = await dockerExecWithRetry(["exec", postgresContainer, "psql", "-U", "panacea", "-d", "panacea_runtime", "-Atc", sql]);
  return result.stdout.trim();
}

export async function queryLines(sql) {
  const output = await queryScalar(sql);
  if (!output) {
    return [];
  }
  return output.split(/\r?\n/).filter(Boolean);
}

export function buildProtectedPayload({ tenantId = "tenant-runtime-orchestration" } = {}) {
  return {
    tenantId,
    status: "registered",
    title: "Runtime orchestration validation record",
    description: "Governed advisory runtime validation record for orchestration, audit, tenant, and event outbox proof",
    countryCode: "KW",
    jurisdictionCode: "KW-HEALTH-RUNTIME",
    capabilityId: "runtime-orchestration-capability",
    priority: "high",
    riskLevel: "low",
    riskScore: 12,
    safetyScore: 98,
    governanceScore: 97,
    traceabilityScore: 96,
    policyControls: {
      policyId: "runtime-orchestration-policy",
      policyVersion: "4.0.0",
      policyApproved: true,
      humanApprovalRequired: true,
      clinicianApprovalRequired: true,
      auditPolicyApplied: true,
      tenantIsolationApplied: true,
      aiGovernanceApplied: true,
      clinicalApprovalApplied: true,
      emergencyStopAuthorized: true,
      autonomousActionBlocked: true,
      approvalReference: "runtime-governance-approval",
      governingBody: "Panacea Runtime Governance",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
      advisoryOnly: true,
      noAutonomousDiagnosis: true,
      noAutonomousTreatment: true,
      clinicianApprovalEnforced: true,
      explainabilityRequired: true,
      auditRequired: true,
      tenantIsolationRequired: true,
      multiCountryGovernanceChecked: true,
      privacyConsentChecked: true,
      approvedCountries: ["KW"],
      governingAuthorityIds: ["runtime-governance-board"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      policyChecked: true,
      aiGovernanceVerified: true,
      clinicalApprovalVerified: true,
      autonomousActionPreventionEnabled: true,
      unsafeRecommendationBlockingEnabled: true,
      traceabilityEnabled: true,
      emergencyStopAvailable: true,
      capabilityOwnerAssigned: true
    },
    evidence: [
      {
        evidenceType: "runtime_validation",
        reference: "evidence://panacea/runtime-orchestration",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "runtime_validation"
      }
    ],
    metrics: {
      readinessScore: 100
    },
    metadata: {
      validation: "runtime_orchestration"
    }
  };
}

export async function postProtectedRecord({ actorId, tenantId = "tenant-runtime-orchestration", permission = "autonomous_intelligence.*" }) {
  const payload = buildProtectedPayload({ tenantId });
  const response = await fetch("http://127.0.0.1:18094/api/v4/autonomous-healthcare-intelligence/foundation/capabilities", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tenant-id": tenantId,
      "x-actor-id": actorId,
      "x-permissions": permission,
      "x-country-codes": "KW"
    },
    body: JSON.stringify(payload)
  });
  const body = await response.text();
  return {
    status: response.status,
    json: body.trim() ? JSON.parse(body) : {}
  };
}

export async function postProtectedRecordWithHeaders({ actorId, bodyTenantId, headerTenantId, permission }) {
  const payload = buildProtectedPayload({ tenantId: bodyTenantId });
  const response = await fetch("http://127.0.0.1:18094/api/v4/autonomous-healthcare-intelligence/foundation/capabilities", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tenant-id": headerTenantId,
      "x-actor-id": actorId,
      "x-permissions": permission,
      "x-country-codes": "KW"
    },
    body: JSON.stringify(payload)
  });
  const body = await response.text();
  return {
    status: response.status,
    json: body.trim() ? JSON.parse(body) : {}
  };
}

export function dockerLogs(container) {
  return execFile("docker", ["logs", container], { allowFailure: true }).stdout.trim();
}

export function assertJsonLogs(container) {
  const logs = dockerLogs(container).split(/\r?\n/).filter(Boolean);
  if (logs.length === 0) {
    throw new Error(`${container} produced no lifecycle logs`);
  }
  for (const line of logs) {
    JSON.parse(line);
  }
  return logs.length;
}

export function assertNoSensitiveLogs(container) {
  const logs = dockerLogs(container);
  if (/postgres:\/\/|POSTGRES_PASSWORD|DATABASE_URL|panacea:panacea/i.test(logs)) {
    throw new Error(`${container} leaked sensitive environment content in logs`);
  }
}

export function containerExitCode(container) {
  return execFile("docker", ["inspect", "-f", "{{.State.ExitCode}}", container]).stdout.trim();
}

export function printTable(rows) {
  for (const row of rows) {
    process.stdout.write(`${Object.entries(row).map(([key, value]) => `${key}=${value}`).join(" ")}\n`);
  }
}
