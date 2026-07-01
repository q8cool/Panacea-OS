import {
  applyMigrations,
  compose,
  containerExitCode,
  dockerExecWithRetry,
  postProtectedRecord,
  queryScalar,
  runtimeServices,
  waitForHttpJson,
  waitForPostgres
} from "./lib/runtime-validation.mjs";

const keep = process.argv.includes("--keep");
const serviceName = "autonomous-healthcare-intelligence-foundation";
const service = runtimeServices.find((candidate) => candidate.name === serviceName);

async function main() {
  try {
    compose(["down", "-v", "--remove-orphans"], { allowFailure: true });
    compose(["config", "--quiet"]);
    compose(["build", serviceName]);
    compose(["up", "-d", "postgres"]);
    await waitForPostgres();
    await applyMigrations("drill-forward");
    await applyMigrations("drill-idempotency");

    compose(["up", "-d", serviceName]);
    await waitForHttpJson(`http://127.0.0.1:${service.hostPort}${service.basePath}/live`);
    await waitForHttpJson(`http://127.0.0.1:${service.hostPort}${service.basePath}/ready`);

    const write = await postProtectedRecord({
      actorId: "sprint89-dr-validator",
      tenantId: "tenant-runtime-drill"
    });
    if (write.status !== 201) {
      throw new Error(`DR protected write failed with status ${write.status}`);
    }

    const beforeRecords = await queryScalar("SELECT COUNT(*) FROM autonomous_healthcare_intelligence_records WHERE created_by='sprint89-dr-validator';");
    const beforeEvents = await queryScalar("SELECT COUNT(*) FROM autonomous_healthcare_intelligence_events WHERE actor_id='sprint89-dr-validator';");
    const beforeAudits = await queryScalar("SELECT COUNT(*) FROM autonomous_healthcare_intelligence_audit_entries WHERE actor_id='sprint89-dr-validator';");
    const beforeIndexes = await queryScalar("SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';");
    const beforeOutboxTables = await queryScalar("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%events';");

    compose(["stop", serviceName]);
    const exitCode = containerExitCode(service.container);
    if (exitCode !== "0") {
      throw new Error(`DR service shutdown exit code ${exitCode}`);
    }

    await dockerExecWithRetry(["exec", "panacea-runtime-postgres", "pg_dump", "-U", "panacea", "-d", "panacea_runtime", "-Fc", "-f", "/tmp/panacea_runtime_dr.dump"]);
    await dockerExecWithRetry([
      "exec",
      "panacea-runtime-postgres",
      "psql",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "panacea",
      "-d",
      "postgres",
      "-c",
      "DROP DATABASE panacea_runtime WITH (FORCE);",
      "-c",
      "CREATE DATABASE panacea_runtime OWNER panacea;"
    ]);
    await dockerExecWithRetry(["exec", "panacea-runtime-postgres", "pg_restore", "-U", "panacea", "-d", "panacea_runtime", "/tmp/panacea_runtime_dr.dump"]);

    const afterRecords = await queryScalar("SELECT COUNT(*) FROM autonomous_healthcare_intelligence_records WHERE created_by='sprint89-dr-validator';");
    const afterEvents = await queryScalar("SELECT COUNT(*) FROM autonomous_healthcare_intelligence_events WHERE actor_id='sprint89-dr-validator';");
    const afterAudits = await queryScalar("SELECT COUNT(*) FROM autonomous_healthcare_intelligence_audit_entries WHERE actor_id='sprint89-dr-validator';");
    const afterIndexes = await queryScalar("SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';");
    const outboxTables = await queryScalar("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%events';");

    if (beforeRecords !== afterRecords || beforeEvents !== afterEvents || beforeAudits !== afterAudits || beforeIndexes !== afterIndexes || beforeOutboxTables !== outboxTables) {
      throw new Error([
        "DR restore verification failed",
        `before records=${beforeRecords} events=${beforeEvents} audits=${beforeAudits} indexes=${beforeIndexes} eventOutboxTables=${beforeOutboxTables}`,
        `after records=${afterRecords} events=${afterEvents} audits=${afterAudits} indexes=${afterIndexes} eventOutboxTables=${outboxTables}`
      ].join("\n"));
    }
    if (Number(outboxTables) < runtimeServices.length) {
      throw new Error(`expected at least ${runtimeServices.length} event outbox tables after restore, found ${outboxTables}`);
    }

    process.stdout.write([
      "Disaster recovery mini-drill passed.",
      `records=${afterRecords}`,
      `events=${afterEvents}`,
      `audits=${afterAudits}`,
      `indexes=${afterIndexes}`,
      `eventOutboxTables=${outboxTables}`
    ].join(" ") + "\n");
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
