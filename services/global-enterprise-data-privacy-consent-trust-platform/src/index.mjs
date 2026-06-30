import { createGlobalPrivacyServer } from "./api/server.mjs";
import { createGlobalPrivacyService } from "./application/privacy-service.mjs";
import { loadGlobalPrivacyConfig } from "./infrastructure/config.mjs";
import {
  createPostgresGlobalPrivacyRepository,
  runPostgresMigrations
} from "./infrastructure/postgres-repository.mjs";

async function main() {
  const config = loadGlobalPrivacyConfig();
  if (process.argv.includes("--migrate")) {
    await runPostgresMigrations({ connectionString: config.databaseUrl });
    return;
  }

  const { repository, pool } = await createPostgresGlobalPrivacyRepository({
    connectionString: config.databaseUrl
  });
  const service = createGlobalPrivacyService({ repository });
  const server = createGlobalPrivacyServer({ service });
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
