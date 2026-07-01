import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import {
  buildFoundationAuthProviderEnv,
  createFoundationAuthProviderServer,
  FoundationAuthProvider,
  loadFoundationAuthProviderConfig
} from "../../scripts/lib/foundation-auth-provider.mjs";

const secretValue = "operator-test-password";

function startAuthProvider(overrides = {}) {
  const logs = [];
  const config = loadFoundationAuthProviderConfig(buildFoundationAuthProviderEnv(overrides));
  const provider = new FoundationAuthProvider({
    config,
    logger: (entry) => logs.push(entry)
  });
  const server = createFoundationAuthProviderServer({ config, provider });
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      resolve({
        config,
        provider,
        logs,
        server,
        baseUrl: `http://127.0.0.1:${address.port}`
      });
    });
  });
}

async function close(server) {
  await new Promise((resolve) => server.close(resolve));
}

async function json(response) {
  return response.json();
}

async function login(baseUrl, body = {}) {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "operator",
      password: secretValue,
      tenantId: "default",
      ...body
    })
  });
  return { response, body: await json(response) };
}

test("Foundation auth discovery returns the required issuer and endpoints", async () => {
  const { server, baseUrl, config } = await startAuthProvider();
  try {
    const response = await fetch(`${baseUrl}/.well-known/openid-configuration`);
    const body = await json(response);
    assert.equal(response.status, 200);
    assert.equal(body.issuer, config.issuer);
    assert.equal(body.jwks_uri, `${config.baseUrl}/.well-known/jwks.json`);
    assert.equal(body.token_endpoint, `${config.baseUrl}/api/v1/auth/token`);
    assert.equal(body.userinfo_endpoint, `${config.baseUrl}/api/v1/auth/me`);
    assert.deepEqual(body.id_token_signing_alg_values_supported, ["RS256"]);
    assert.ok(body.claims_supported.includes("tenantId"));
  } finally {
    await close(server);
  }
});

test("Foundation auth JWKS exposes a public RS256 key", async () => {
  const { server, baseUrl, config } = await startAuthProvider();
  try {
    const response = await fetch(`${baseUrl}/.well-known/jwks.json`);
    const body = await json(response);
    assert.equal(response.status, 200);
    assert.equal(body.keys.length, 1);
    assert.equal(body.keys[0].kid, config.keyId);
    assert.equal(body.keys[0].alg, "RS256");
    assert.equal(body.keys[0].kty, "RSA");
  } finally {
    await close(server);
  }
});

test("Foundation auth login succeeds with bootstrap credentials and issues signed tokens", async () => {
  const { server, baseUrl, config } = await startAuthProvider();
  try {
    const result = await login(baseUrl);
    assert.equal(result.response.status, 200);
    assert.equal(result.body.tokenType, "Bearer");
    assert.equal(result.body.expiresIn, 3600);
    assert.equal(result.body.user.username, "operator");
    assert.equal(result.body.user.tenantId, "default");
    assert.ok(result.body.accessToken);
    assert.ok(result.body.refreshToken);

    const jwks = await json(await fetch(`${baseUrl}/.well-known/jwks.json`));
    assert.equal(verifyJwtWithJwk(result.body.accessToken, jwks.keys[0], config), true);
  } finally {
    await close(server);
  }
});

test("Foundation auth login fails without revealing which credential was wrong", async () => {
  const { server, baseUrl } = await startAuthProvider();
  try {
    const result = await login(baseUrl, { password: "wrong-secret" });
    assert.equal(result.response.status, 401);
    assert.equal(result.body.error, "invalid_credentials");
    assert.equal(result.body.message, "Invalid username, password, or tenant.");
  } finally {
    await close(server);
  }
});

test("Foundation auth refresh rotates refresh tokens", async () => {
  const { server, baseUrl } = await startAuthProvider();
  try {
    const signedIn = await login(baseUrl);
    const response = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: signedIn.body.refreshToken })
    });
    const body = await json(response);
    assert.equal(response.status, 200);
    assert.ok(body.accessToken);
    assert.ok(body.refreshToken);
    assert.notEqual(body.refreshToken, signedIn.body.refreshToken);

    const reused = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: signedIn.body.refreshToken })
    });
    assert.equal(reused.status, 401);
  } finally {
    await close(server);
  }
});

test("Foundation auth logout invalidates refresh token use", async () => {
  const { server, baseUrl } = await startAuthProvider();
  try {
    const signedIn = await login(baseUrl);
    const response = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: signedIn.body.refreshToken })
    });
    const body = await json(response);
    assert.equal(response.status, 200);
    assert.equal(body.loggedOut, true);

    const refresh = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: signedIn.body.refreshToken })
    });
    assert.equal(refresh.status, 401);
  } finally {
    await close(server);
  }
});

test("Foundation auth me returns authenticated user context", async () => {
  const { server, baseUrl } = await startAuthProvider();
  try {
    const signedIn = await login(baseUrl);
    const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${signedIn.body.accessToken}` }
    });
    const body = await json(response);
    assert.equal(response.status, 200);
    assert.equal(body.user.username, "operator");
    assert.equal(body.user.tenantId, "default");
    assert.deepEqual(body.user.roles, ["operator"]);
    assert.ok(body.user.permissions.includes("panacea:operate"));
  } finally {
    await close(server);
  }
});

test("Foundation auth CORS preflight allows Panacea web origin and required headers", async () => {
  const { server, baseUrl } = await startAuthProvider();
  try {
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "OPTIONS",
      headers: {
        origin: "http://localhost:5174",
        "access-control-request-method": "POST",
        "access-control-request-headers": "Authorization,Content-Type,X-Tenant-Id,X-User-Id,X-Request-Id,X-Correlation-Id"
      }
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5174");
    assert.match(response.headers.get("access-control-allow-methods") || "", /GET,POST,OPTIONS/);
    assert.match(response.headers.get("access-control-allow-headers") || "", /X-Tenant-Id/);
  } finally {
    await close(server);
  }
});

test("Foundation auth logs exclude raw secrets and issued credentials", async () => {
  const { server, baseUrl, logs } = await startAuthProvider();
  try {
    const result = await login(baseUrl);
    await fetch(`${baseUrl}/api/v1/auth/me`, {
      headers: { authorization: `Bearer ${result.body.accessToken}` }
    });
    const serialized = JSON.stringify(logs);
    assert.equal(serialized.includes(secretValue), false);
    assert.equal(serialized.includes(result.body.accessToken), false);
    assert.equal(serialized.includes(result.body.refreshToken), false);
  } finally {
    await close(server);
  }
});

function verifyJwtWithJwk(token, jwk, config) {
  const [headerPart, payloadPart, signaturePart] = token.split(".");
  const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  assert.equal(payload.iss, config.issuer);
  assert.equal(payload.aud, config.audience);
  assert.equal(payload.tenantId, "default");
  assert.deepEqual(payload.roles, ["operator"]);
  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  return crypto.createVerify("RSA-SHA256")
    .update(`${headerPart}.${payloadPart}`)
    .verify(publicKey, Buffer.from(signaturePart, "base64url"));
}
