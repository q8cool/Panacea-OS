import assert from "node:assert/strict";
import test from "node:test";
import { createAutonomousHealthcareIntelligenceServer } from "../../services/autonomous-healthcare-intelligence-foundation/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/autonomous-healthcare-intelligence-foundation/src/domain/intelligence-domain.mjs";
import {
  IntelligenceAuthorizationError,
  validatePrincipal
} from "../../services/autonomous-healthcare-intelligence-foundation/src/domain/intelligence-validation.mjs";
import { baseRecord, createServiceWithRepository } from "../autonomous-healthcare-intelligence-foundation/fixtures.mjs";

const foundationIssuer = "https://foundation.panacea.local";
const foundationAudience = "panacea-services";
const requiredJwtClaims = [
  "iss",
  "aud",
  "sub",
  "jti",
  "tenant_id",
  "actor_id",
  "subject_type",
  "permissions",
  "roles",
  "country_codes",
  "iat",
  "exp"
];

function encodeJwtPart(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function createContractJwt(overrides = {}) {
  const claims = {
    iss: foundationIssuer,
    aud: foundationAudience,
    sub: "foundation-user-001",
    jti: "foundation-token-001",
    tenant_id: "tenant-autonomous-intelligence",
    actor_id: "foundation-contract-validator",
    subject_type: "user",
    permissions: ["autonomous_intelligence.*"],
    roles: ["foundation-contract-validator"],
    country_codes: ["KW", "SA"],
    iat: 1782811200,
    exp: 4102444800,
    ...overrides
  };
  return `${encodeJwtPart({ alg: "RS256", typ: "JWT", kid: "foundation-contract-key" })}.${encodeJwtPart(claims)}.contract-signature`;
}

function decodeContractJwt(token) {
  const parts = String(token).split(".");
  if (parts.length !== 3) {
    throw new IntelligenceAuthorizationError("request is not authenticated", { reason: "JWT must contain three segments" });
  }
  let claims;
  try {
    claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch (error) {
    throw new IntelligenceAuthorizationError("request is not authenticated", { reason: "JWT claims are not valid JSON" });
  }
  for (const claim of requiredJwtClaims) {
    if (claims[claim] === undefined || claims[claim] === null || claims[claim] === "") {
      throw new IntelligenceAuthorizationError("request is not authenticated", { reason: `${claim} claim is required` });
    }
  }
  if (claims.iss !== foundationIssuer || claims.aud !== foundationAudience) {
    throw new IntelligenceAuthorizationError("request is not authenticated", { reason: "JWT issuer or audience is outside contract" });
  }
  if (!Array.isArray(claims.permissions) || claims.permissions.length === 0) {
    throw new IntelligenceAuthorizationError("request is not authenticated", { reason: "permissions claim is required" });
  }
  return claims;
}

function claimsToPrincipal(claims) {
  return validatePrincipal({
    tenantId: claims.tenant_id,
    actorId: claims.actor_id,
    subjectType: claims.subject_type,
    permissions: claims.permissions,
    roles: claims.roles,
    countryCodes: claims.country_codes
  });
}

class ExternalFoundationContractAuthenticator {
  authenticate(request) {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new IntelligenceAuthorizationError("request is not authenticated", { reason: "Bearer JWT is required" });
    }
    return claimsToPrincipal(decodeContractJwt(authorization.slice("Bearer ".length)));
  }
}

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createAutonomousHealthcareIntelligenceServer({
    service,
    authenticator: new ExternalFoundationContractAuthenticator()
  });
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      resolve({ server, repository, baseUrl: `http://127.0.0.1:${address.port}${API_BASE_PATH}` });
    });
  });
}

async function postWithJwt(baseUrl, token, body = baseRecord({ status: "registered" })) {
  const response = await fetch(`${baseUrl}/foundation/capabilities`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

test("Foundation contract harness accepts a valid JWT and propagates the tenant claim", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const { response, json } = await postWithJwt(baseUrl, createContractJwt());
    assert.equal(response.status, 201);
    assert.equal(json.data.tenantId, "tenant-autonomous-intelligence");
    assert.equal(json.data.createdBy, "foundation-contract-validator");
    assert.equal(repository.records.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Foundation contract harness rejects missing JWT, invalid JWT, and missing tenant claims", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const missing = await postWithJwt(baseUrl, "");
    assert.equal(missing.response.status, 401);
    assert.equal(missing.json.error, "authorization_error");

    const invalid = await postWithJwt(baseUrl, "invalid-jwt");
    assert.equal(invalid.response.status, 401);
    assert.equal(invalid.json.error, "authorization_error");

    const tenantMissing = await postWithJwt(baseUrl, createContractJwt({ tenant_id: "" }));
    assert.equal(tenantMissing.response.status, 401);
    assert.equal(tenantMissing.json.error, "authorization_error");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Foundation contract harness returns expected RBAC and ABAC denials", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const rbacDenied = await postWithJwt(baseUrl, createContractJwt({ permissions: ["autonomous_intelligence.read"] }));
    assert.equal(rbacDenied.response.status, 403);
    assert.equal(rbacDenied.json.error, "authorization_error");

    const abacDenied = await postWithJwt(
      baseUrl,
      createContractJwt({ country_codes: ["KW"] }),
      baseRecord({ status: "registered", countryCode: "SA" })
    );
    assert.equal(abacDenied.response.status, 403);
    assert.equal(abacDenied.json.error, "authorization_error");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Foundation contract harness validates audit append and event outbox payload shapes", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const { response } = await postWithJwt(baseUrl, createContractJwt());
    assert.equal(response.status, 201);
    assert.equal(repository.events.length, 1);
    assert.equal(repository.audits.length, 1);

    const [event] = repository.events;
    assert.equal(event.tenantId, "tenant-autonomous-intelligence");
    assert.equal(event.actorId, "foundation-contract-validator");
    assert.equal(event.schemaVersion, "4.0.0");
    assert.equal(event.payload.advisoryOnly, true);
    assert.equal(event.payload.clinicianApprovalEnforced, true);

    const [audit] = repository.audits;
    assert.equal(audit.tenantId, "tenant-autonomous-intelligence");
    assert.equal(audit.actorId, "foundation-contract-validator");
    assert.match(audit.action, /^autonomous_intelligence\./);
    assert.equal(audit.countryCode, "KW");
    assert.equal(audit.metadata.eventType, "intelligence.capability.registered");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Foundation contract harness verifies health, readiness, metrics, and OpenAPI availability", async () => {
  const { server, baseUrl } = await startServer();
  try {
    for (const endpoint of ["/live", "/ready", "/metrics", "/docs/openapi.json"]) {
      const response = await fetch(`${baseUrl}${endpoint}`);
      assert.equal(response.status, 200, `${endpoint} did not return 200`);
      const body = await response.json();
      assert.ok(body);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
