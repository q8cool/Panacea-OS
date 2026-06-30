import { createAutonomousHealthcareIntelligenceServer } from "./api/server.mjs";
import { createAutonomousHealthcareIntelligenceService } from "./application/intelligence-service.mjs";
import { loadConfig } from "./infrastructure/config.mjs";
import {
  createPostgresAutonomousHealthcareIntelligenceRepository,
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
  const { repository } = await createPostgresAutonomousHealthcareIntelligenceRepository({
    connectionString: config.databaseUrl
  });
  const service = createAutonomousHealthcareIntelligenceService({ repository });
  const server = createAutonomousHealthcareIntelligenceServer({ service });
  server.listen(config.port, () => {
    process.stdout.write(`autonomous-healthcare-intelligence-foundation listening on ${config.port}\n`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  });
}
