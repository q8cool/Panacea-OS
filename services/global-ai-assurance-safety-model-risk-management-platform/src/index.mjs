import { createGlobalAiAssuranceServer } from "./api/server.mjs";
import { createGlobalAiAssuranceService } from "./application/ai-assurance-service.mjs";
import { loadGlobalAiAssuranceConfig } from "./infrastructure/config.mjs";
import {
  createPostgresGlobalAiAssuranceRepository,
  runPostgresMigrations
} from "./infrastructure/postgres-repository.mjs";

async function main() {
  const config = loadGlobalAiAssuranceConfig();
  if (process.argv.includes("--migrate")) {
    await runPostgresMigrations({ connectionString: config.databaseUrl });
    return;
  }

  const { repository, pool } = await createPostgresGlobalAiAssuranceRepository({
    connectionString: config.databaseUrl
  });
  const service = createGlobalAiAssuranceService({ repository });
  const server = createGlobalAiAssuranceServer({ service });
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
