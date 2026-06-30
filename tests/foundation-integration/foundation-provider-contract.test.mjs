import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFoundationProviderEnv,
  FoundationProviderCircuitOpenError,
  FoundationProviderClient,
  FoundationProviderRequestError,
  loadFoundationProviderConfig
} from "../../scripts/lib/foundation-provider.mjs";

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    }
  };
}

test("Foundation provider config rejects missing required settings", () => {
  assert.throws(
    () => loadFoundationProviderConfig({}),
    /PANACEA_FOUNDATION_URL is required/
  );
  assert.throws(
    () => loadFoundationProviderConfig(buildFoundationProviderEnv({ PANACEA_FOUNDATION_JWKS_URL: "", PANACEA_FOUNDATION_JWT_PUBLIC_KEY: "" })),
    /JWKS_URL or PANACEA_FOUNDATION_JWT_PUBLIC_KEY/
  );
});

test("Foundation provider config rejects invalid URL, path, timeout, retry, and circuit breaker settings", () => {
  assert.throws(
    () => loadFoundationProviderConfig(buildFoundationProviderEnv({ PANACEA_FOUNDATION_URL: "foundation" })),
    /valid absolute URL/
  );
  assert.throws(
    () => loadFoundationProviderConfig(buildFoundationProviderEnv({ PANACEA_FOUNDATION_AUDIT_APPEND_PATH: "audit/events" })),
    /must start with \//
  );
  assert.throws(
    () => loadFoundationProviderConfig(buildFoundationProviderEnv({ PANACEA_FOUNDATION_TIMEOUT_MS: "0" })),
    /positive integer/
  );
  assert.throws(
    () => loadFoundationProviderConfig(buildFoundationProviderEnv({ PANACEA_FOUNDATION_RETRY_ATTEMPTS: "-1" })),
    /positive integer/
  );
  assert.throws(
    () => loadFoundationProviderConfig(buildFoundationProviderEnv({ PANACEA_FOUNDATION_CIRCUIT_BREAKER_FAILURE_THRESHOLD: "not-a-number" })),
    /positive integer/
  );
});

test("Foundation provider config accepts successful production contract configuration", () => {
  const config = loadFoundationProviderConfig(buildFoundationProviderEnv());
  assert.equal(config.baseUrl, "https://foundation.panacea.local");
  assert.equal(config.jwtIssuer, "https://foundation.panacea.local");
  assert.equal(config.jwksUrl, "https://foundation.panacea.local/.well-known/jwks.json");
  assert.equal(config.auditAppendPath, "/api/v1/foundation/audit/events");
  assert.equal(config.policyEvaluationPath, "/api/v1/foundation/access/evaluate");
  assert.equal(config.healthPath, "/api/v1/foundation/live");
  assert.equal(config.readinessPath, "/api/v1/foundation/ready");
  assert.equal(config.metricsPath, "/api/v1/foundation/metrics");
});

test("Foundation provider client validates audit append and policy contract call shapes", async () => {
  const calls = [];
  const client = new FoundationProviderClient({
    config: loadFoundationProviderConfig(buildFoundationProviderEnv()),
    wait: async () => {},
    fetchImpl: async (url, options) => {
      calls.push({ url, options, body: options.body ? JSON.parse(options.body) : undefined });
      return response({ accepted: true });
    }
  });

  await client.appendAudit({
    tenantId: "tenant-rc-freeze",
    actorId: "release-validator",
    action: "foundation.provider.contract.validated",
    resourceType: "foundation_provider",
    resourceId: "foundation-provider-contract",
    occurredAt: "2026-06-30T12:00:00.000Z",
    metadata: { sprint: 91 }
  });
  await client.evaluatePolicy({
    tenantId: "tenant-rc-freeze",
    actorId: "release-validator",
    permission: "release.evidence.validate",
    resourceType: "release_candidate_evidence",
    action: "validate"
  });

  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "https://foundation.panacea.local/api/v1/foundation/audit/events");
  assert.equal(calls[0].body.tenantId, "tenant-rc-freeze");
  assert.equal(calls[1].url, "https://foundation.panacea.local/api/v1/foundation/access/evaluate");
  assert.equal(calls[1].body.permission, "release.evidence.validate");
});

test("Foundation provider client retries transient failures", async () => {
  let attempts = 0;
  const client = new FoundationProviderClient({
    config: loadFoundationProviderConfig(buildFoundationProviderEnv({ PANACEA_FOUNDATION_RETRY_ATTEMPTS: "2" })),
    wait: async () => {},
    fetchImpl: async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new Error("transient network failure");
      }
      return response({ status: "live" });
    }
  });

  const result = await client.health();
  assert.equal(result.status, "live");
  assert.equal(attempts, 2);
});

test("Foundation provider client reports timeout behavior", async () => {
  const client = new FoundationProviderClient({
    config: loadFoundationProviderConfig(buildFoundationProviderEnv({ PANACEA_FOUNDATION_TIMEOUT_MS: "1", PANACEA_FOUNDATION_RETRY_ATTEMPTS: "1" })),
    wait: async () => {},
    fetchImpl: async (_url, options) => {
      await new Promise((resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
      });
    }
  });

  await assert.rejects(
    () => client.health(),
    (error) => error instanceof FoundationProviderRequestError && error.message.includes("timed out")
  );
});

test("Foundation provider client opens circuit after repeated failures", async () => {
  let now = 1000;
  const client = new FoundationProviderClient({
    config: loadFoundationProviderConfig(buildFoundationProviderEnv({
      PANACEA_FOUNDATION_RETRY_ATTEMPTS: "1",
      PANACEA_FOUNDATION_CIRCUIT_BREAKER_FAILURE_THRESHOLD: "2",
      PANACEA_FOUNDATION_CIRCUIT_BREAKER_RESET_MS: "1000"
    })),
    clock: () => now,
    wait: async () => {},
    fetchImpl: async () => response({ error: "unavailable" }, 503)
  });

  await assert.rejects(() => client.health(), FoundationProviderRequestError);
  await assert.rejects(() => client.health(), FoundationProviderRequestError);
  await assert.rejects(() => client.health(), FoundationProviderCircuitOpenError);

  now = 2500;
  await assert.rejects(() => client.health(), FoundationProviderRequestError);
});
