import { createGlobalComplianceServer } from "./api/server.mjs";
import { createGlobalComplianceService } from "./application/compliance-service.mjs";
import { loadGlobalComplianceConfig } from "./infrastructure/config.mjs";
import {
  createPostgresGlobalComplianceRepository,
  runPostgresMigrations
} from "./infrastructure/postgres-repository.mjs";

async function main() {
  const config = loadGlobalComplianceConfig();
  if (process.argv.includes("--migrate")) {
    await runPostgresMigrations({ connectionString: config.databaseUrl });
    return;
  }

  const { repository, pool } = await createPostgresGlobalComplianceRepository({
    connectionString: config.databaseUrl
  });
  const service = createGlobalComplianceService({ repository });
  const server = createGlobalComplianceServer({ service });
  server.listen(config.port, () => {
    process.stdout.write(`${config.serviceName} listening on ${config.port}\n`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exit(1);
});
