import { createGlobalWorkforceServer } from "./api/server.mjs";
import { createGlobalWorkforceService } from "./application/workforce-service.mjs";
import { loadGlobalWorkforceConfig } from "./infrastructure/config.mjs";
import {
  createPostgresGlobalWorkforceRepository,
  runPostgresMigrations
} from "./infrastructure/postgres-repository.mjs";

async function main() {
  const config = loadGlobalWorkforceConfig();
  if (process.argv.includes("--migrate")) {
    await runPostgresMigrations({ connectionString: config.databaseUrl });
    return;
  }

  const { repository, pool } = await createPostgresGlobalWorkforceRepository({
    connectionString: config.databaseUrl
  });
  const service = createGlobalWorkforceService({ repository });
  const server = createGlobalWorkforceServer({ service });
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
