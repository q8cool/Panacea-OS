import {
  applyMigrations,
  assertJsonLogs,
  assertNoSensitiveLogs,
  compose,
  containerExitCode,
  postProtectedRecord,
  postProtectedRecordWithHeaders,
  printTable,
  queryScalar,
  runtimeServices,
  waitForHttpJson,
  waitForPostgres
} from "./lib/runtime-validation.mjs";

const serviceNames = runtimeServices.map((service) => service.name);
const keep = process.argv.includes("--keep");
const rows = [];

function addRow(row) {
  rows.push(row);
  process.stdout.write(`runtime.validation ${Object.entries(row).map(([key, value]) => `${key}=${value}`).join(" ")}\n`);
}

async function main() {
  try {
    compose(["down", "-v", "--remove-orphans"], { allowFailure: true });
    compose(["config", "--quiet"]);
    compose(["build"]);
    compose(["up", "-d", "postgres"]);
    await waitForPostgres();

    await applyMigrations("forward");
    await applyMigrations("idempotency");

    compose(["up", "-d", ...serviceNames]);

    for (const service of runtimeServices) {
      const live = await waitForHttpJson(`http://127.0.0.1:${service.hostPort}${service.basePath}/live`);
      const ready = await waitForHttpJson(`http://127.0.0.1:${service.hostPort}${service.basePath}/ready`);
      const metrics = await waitForHttpJson(`http://127.0.0.1:${service.hostPort}${service.basePath}/metrics`);
      const openApi = await waitForHttpJson(`http://127.0.0.1:${service.hostPort}${service.basePath}/docs/openapi.json`);
      if (!live.response.ok || !ready.response.ok || !metrics.response.ok || !openApi.response.ok) {
        throw new Error(`${service.name} runtime endpoint validation failed`);
      }
      assertNoSensitiveLogs(service.container);
      addRow({
        service: service.name,
        live: live.response.status,
        ready: ready.response.status,
        metrics: metrics.response.status,
        openapiPaths: Object.keys(openApi.json.paths ?? {}).length
      });
    }

    const protectedWrite = await postProtectedRecord({
      actorId: "sprint89-runtime-validator"
    });
    if (protectedWrite.status !== 201 || protectedWrite.json.event?.eventType !== "intelligence.capability.registered") {
      throw new Error(`protected runtime write failed with status ${protectedWrite.status}`);
    }

    const unauthenticated = await fetch("http://127.0.0.1:18094/api/v4/autonomous-healthcare-intelligence/foundation/capabilities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({})
    });
    if (unauthenticated.status !== 401) {
      throw new Error(`unauthenticated request returned ${unauthenticated.status}, expected 401`);
    }

    const unauthorized = await postProtectedRecordWithHeaders({
      actorId: "sprint89-unauthorized-validator",
      bodyTenantId: "tenant-runtime-orchestration",
      headerTenantId: "tenant-runtime-orchestration",
      permission: "autonomous_intelligence.traceability.write"
    });
    if (unauthorized.status !== 403) {
      throw new Error(`unauthorized request returned ${unauthorized.status}, expected 403`);
    }

    const tenantMismatch = await postProtectedRecordWithHeaders({
      actorId: "sprint89-tenant-validator",
      bodyTenantId: "tenant-runtime-orchestration-b",
      headerTenantId: "tenant-runtime-orchestration-a",
      permission: "autonomous_intelligence.*"
    });
    if (tenantMismatch.status !== 403) {
      throw new Error(`tenant mismatch returned ${tenantMismatch.status}, expected 403`);
    }

    const recordCount = await queryScalar("SELECT COUNT(*) FROM autonomous_healthcare_intelligence_records WHERE created_by='sprint89-runtime-validator';");
    const eventCount = await queryScalar("SELECT COUNT(*) FROM autonomous_healthcare_intelligence_events WHERE actor_id='sprint89-runtime-validator';");
    const auditCount = await queryScalar("SELECT COUNT(*) FROM autonomous_healthcare_intelligence_audit_entries WHERE actor_id='sprint89-runtime-validator';");
    if (recordCount !== "1" || eventCount !== "1" || auditCount !== "1") {
      throw new Error(`persistence validation failed: records=${recordCount} events=${eventCount} audits=${auditCount}`);
    }
    addRow({
      integration: "protected-write",
      status: protectedWrite.status,
      records: recordCount,
      events: eventCount,
      audits: auditCount
    });
    addRow({
      security: "runtime",
      unauthenticated: unauthenticated.status,
      unauthorized: unauthorized.status,
      tenantMismatch: tenantMismatch.status
    });

    compose(["stop", ...serviceNames]);
    for (const service of runtimeServices) {
      const exitCode = containerExitCode(service.container);
      const logLines = assertJsonLogs(service.container);
      assertNoSensitiveLogs(service.container);
      if (exitCode !== "0") {
        throw new Error(`${service.name} exited with ${exitCode}`);
      }
      addRow({
        service: service.name,
        exitCode,
        jsonLogLines: logLines
      });
    }

    process.stdout.write("Runtime orchestration validation passed.\n");
    printTable(rows);
  } finally {
    if (!keep) {
      compose(["down", "-v", "--remove-orphans"], { allowFailure: true });
    }
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
