export function loadConfig(env = process.env) {
  return {
    port: Number.parseInt(env.PORT ?? "8094", 10),
    databaseUrl: env.DATABASE_URL,
    runMigrations: env.RUN_MIGRATIONS === "true"
  };
}
