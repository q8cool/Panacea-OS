import { createGlobalLegalServer } from "./api/server.mjs";
import { createGlobalLegalService } from "./application/legal-service.mjs";
import { loadGlobalLegalConfig } from "./infrastructure/config.mjs";
import {
  createPostgresGlobalLegalRepository,
  runPostgresMigrations
} from "./infrastructure/postgres-repository.mjs";

async function main() {
  const config = loadGlobalLegalConfig();
  if (process.argv.includes("--migrate")) {
    await runPostgresMigrations({ connectionString: config.databaseUrl });
    return;
  }

  const { repository, pool } = await createPostgresGlobalLegalRepository({
    connectionString: config.databaseUrl
  });
  const service = createGlobalLegalService({ repository });
  const server = createGlobalLegalServer({ service });
  server.listen(config.port, () => {
    process.stdout.write(`${JSON.stringify({
      level: "info",
      event: "service.started",
      service: config.serviceName,
      port: config.port
    })}\n`);
  });

  const shutdown = async (signal) => {
    server.close(async () => {
      await pool.end();
      process.stdout.write(`${JSON.stringify({
        level: "info",
        event: "service.stopped",
        service: config.serviceName,
        signal
      })}\n`);
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
