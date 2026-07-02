import {
  createFoundationAuthProviderServer,
  loadFoundationAuthProviderConfig
} from "./lib/foundation-auth-provider.mjs";

const config = loadFoundationAuthProviderConfig(process.env);
const port = Number.parseInt(process.env.PANACEA_FOUNDATION_AUTH_PORT || "8080", 10);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PANACEA_FOUNDATION_AUTH_PORT must be a positive integer");
}

const server = createFoundationAuthProviderServer({ config });

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(JSON.stringify({
    level: "info",
    service: "foundation-auth-provider",
    event: "foundation.auth.provider.started",
    port,
    issuer: config.issuer,
    corsOrigins: config.corsOrigins,
    at: new Date().toISOString()
  }));
  process.stdout.write("\n");
});

function shutdown(signal) {
  server.close(() => {
    process.stdout.write(JSON.stringify({
      level: "info",
      service: "foundation-auth-provider",
      event: "foundation.auth.provider.stopped",
      signal,
      at: new Date().toISOString()
    }));
    process.stdout.write("\n");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
