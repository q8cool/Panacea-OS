import { createRealTimeGlobalCommandIntelligenceServer } from "./api/server.mjs";
import { createRealTimeGlobalCommandIntelligenceService } from "./application/command-service.mjs";
import { loadConfig } from "./infrastructure/config.mjs";
import {
  createPostgresRealTimeGlobalCommandIntelligenceRepository,
  runPostgresMigrations
} from "./infrastructure/postgres-repository.mjs";

async function main() {
  const config = loadConfig();
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  if (config.runMigrations) {
    await runPostgresMigrations({ connectionString: config.databaseUrl });
  }
  const { repository } = await createPostgresRealTimeGlobalCommandIntelligenceRepository({
    connectionString: config.databaseUrl
  });
  const service = createRealTimeGlobalCommandIntelligenceService({ repository });
  const server = createRealTimeGlobalCommandIntelligenceServer({ service });
  server.listen(config.port, () => {
    process.stdout.write(`real-time-global-healthcare-command-intelligence-platform listening on ${config.port}\n`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
