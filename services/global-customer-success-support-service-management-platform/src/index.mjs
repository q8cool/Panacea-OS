import { createGlobalCustomerSuccessServer } from "./api/server.mjs";
import { createGlobalCustomerSuccessService } from "./application/customer-success-service.mjs";
import { loadGlobalCustomerSuccessConfig } from "./infrastructure/config.mjs";
import {
  createPostgresGlobalCustomerSuccessRepository,
  runPostgresMigrations
} from "./infrastructure/postgres-repository.mjs";

async function main() {
  const config = loadGlobalCustomerSuccessConfig();
  if (process.argv.includes("--migrate")) {
    await runPostgresMigrations({ connectionString: config.databaseUrl });
    return;
  }

  const { repository, pool } = await createPostgresGlobalCustomerSuccessRepository({
    connectionString: config.databaseUrl
  });
  const service = createGlobalCustomerSuccessService({ repository });
  const server = createGlobalCustomerSuccessServer({ service });
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
