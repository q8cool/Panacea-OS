import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildFoundationAuthProviderEnv,
  createFoundationAuthProviderServer,
  FoundationAuthProvider,
  hashFoundationUserPassword,
  loadFoundationAuthProviderConfig,
  verifyFoundationAccessToken,
  verifyFoundationUserPassword
} from "../../scripts/lib/foundation-auth-provider.mjs";

const secretValue = "operator-test-password";

function startAuthProvider(overrides = {}) {
  return buildFoundationAuthProviderEnv(overrides).then((env) => startAuthProviderWithEnv(env));
}

function startAuthProviderWithEnv(env) {
  const logs = [];
  const config = loadFoundationAuthProviderConfig(env);
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
      tenantId: "utbe-health-system",
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
    assert.equal(body.login_endpoint, `${config.baseUrl}/api/v1/auth/login`);
    assert.equal(body.userinfo_endpoint, `${config.baseUrl}/api/v1/auth/me`);
    assert.equal(body.revocation_endpoint, `${config.baseUrl}/api/v1/auth/logout`);
    assert.equal(body.authorization_endpoint, null);
    assert.deepEqual(body.id_token_signing_alg_values_supported, ["RS256"]);
    assert.deepEqual(body.grant_types_supported, ["password", "refresh_token"]);
    assert.ok(body.claims_supported.includes("tenantId"));
    assert.ok(body.claims_supported.includes("jti"));
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

test("Foundation auth read endpoints support HEAD for proxy and browser validation", async () => {
  const { server, baseUrl } = await startAuthProvider();
  try {
    for (const path of ["/health", "/ready", "/metrics", "/.well-known/jwks.json"]) {
      const response = await fetch(`${baseUrl}${path}`, { method: "HEAD" });
      assert.equal(response.status, 200, `${path} should support HEAD`);
      assert.equal(await response.text(), "");
    }
  } finally {
    await close(server);
  }
});

test("Foundation auth password hashing creates and verifies argon2id values", async () => {
  const hash = await hashFoundationUserPassword("safe-password", {
    salt: "panacea-password-test",
    memory: 8192,
    passes: 2
  });
  assert.equal(hash.startsWith("argon2id$"), true);
  assert.equal(await verifyFoundationUserPassword("safe-password", hash), true);
  assert.equal(await verifyFoundationUserPassword("wrong-password", hash), false);
});

test("Foundation auth rejects example sentinel password hash values", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "panacea-foundation-invalid-hash-"));
  const usersFile = path.join(directory, "foundation-users.json");
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
  fs.writeFileSync(usersFile, JSON.stringify({
    users: [
      {
        userId: "project-owner",
        username: "project-owner",
        displayName: "Project Owner",
        tenantId: "utbe-health-system",
        passwordHash: "REPLACE_WITH_ARGON2ID_HASH_GENERATED_OUTSIDE_GIT",
        roles: ["operator"],
        permissions: ["panacea:operate"]
      }
    ]
  }));
  try {
    assert.throws(() => loadFoundationAuthProviderConfig({
      PANACEA_FOUNDATION_URL: "https://foundation.utbe.ai",
      PANACEA_FOUNDATION_JWT_ISSUER: "https://foundation.utbe.ai",
      PANACEA_FOUNDATION_AUTH_AUDIENCE: "panacea-os",
      PANACEA_FOUNDATION_AUTH_PRIVATE_KEY_PEM: keyPair.privateKey,
      PANACEA_FOUNDATION_AUTH_PUBLIC_KEY_PEM: keyPair.publicKey,
      PANACEA_FOUNDATION_USERS_FILE: usersFile
    }), /argon2id/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
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
    assert.equal(result.body.user.tenantId, "utbe-health-system");
    assert.equal(result.body.user.displayName, "Foundation Operator");
    assert.ok(result.body.user.permissions.includes("read"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.read_models.read"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.write_workflows.write"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.write_workflows.read"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.write_workflows.retry"));
    assert.ok(result.body.accessToken);
    assert.ok(result.body.refreshToken);

    const jwks = await json(await fetch(`${baseUrl}/.well-known/jwks.json`));
    const payload = verifyJwtWithJwk(result.body.accessToken, jwks.keys[0], config);
    assert.equal(payload.aud, "panacea-os");
    assert.equal(payload.tenantId, "utbe-health-system");
    assert.ok(payload.jti);
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

test("Foundation auth login rejects invalid tenant", async () => {
  const { server, baseUrl } = await startAuthProvider();
  try {
    const result = await login(baseUrl, { tenantId: "wrong-tenant" });
    assert.equal(result.response.status, 401);
    assert.equal(result.body.error, "invalid_credentials");
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
    assert.equal(body.user.tenantId, "utbe-health-system");
    assert.deepEqual(body.user.roles, ["operator"]);
    assert.ok(body.user.permissions.includes("panacea:operate"));
    assert.ok(body.user.permissions.includes("global_command_intelligence.read_models.read"));
    assert.ok(body.user.permissions.includes("global_command_intelligence.write_workflows.write"));
  } finally {
    await close(server);
  }
});

test("Foundation auth CORS preflight allows Panacea web origin and required headers", async () => {
  const { server, baseUrl } = await startAuthProvider({
    PANACEA_FOUNDATION_AUTH_CORS_ORIGIN: "http://localhost:5174"
  });
  try {
    for (const path of ["/api/v1/auth/login", "/api/v1/audit-records", "/api/v1/policy/evaluate"]) {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "OPTIONS",
        headers: {
          origin: "http://localhost:5174",
          "access-control-request-method": "POST",
          "access-control-request-headers": "Authorization,Content-Type,X-Tenant-Id,X-User-Id,X-Request-Id,X-Correlation-Id"
        }
      });
      assert.equal(response.status, 204, `${path} should support OPTIONS`);
      assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5174");
      assert.match(response.headers.get("access-control-allow-methods") || "", /GET,POST,OPTIONS/);
      assert.match(response.headers.get("access-control-allow-headers") || "", /X-Tenant-ID/);
    }
  } finally {
    await close(server);
  }
});

test("Foundation auth CORS preflight allows the UTBE production web origin", async () => {
  const { server, baseUrl } = await startAuthProvider({
    PANACEA_FOUNDATION_AUTH_CORS_ORIGIN: "https://panacea.utbe.ai"
  });
  try {
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "OPTIONS",
      headers: {
        origin: "https://panacea.utbe.ai",
        "access-control-request-method": "POST",
        "access-control-request-headers": "Authorization,Content-Type,X-Tenant-ID,X-Request-ID,X-Correlation-ID"
      }
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://panacea.utbe.ai");
  } finally {
    await close(server);
  }
});

test("Foundation auth supports external users file with administrator security user", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "panacea-foundation-users-"));
  const usersFile = path.join(directory, "foundation-users.json");
  const adminHash = await hashFoundationUserPassword("security-password", {
    salt: "panacea-security-user",
    memory: 8192,
    passes: 2
  });
  fs.writeFileSync(usersFile, JSON.stringify({
    users: [
      {
        userId: "security-admin",
        username: "security-admin",
        displayName: "Security Administrator",
        tenantId: "utbe-health-system",
        passwordHash: adminHash,
        roles: ["administrator"],
        permissions: ["panacea:admin", "panacea:read", "panacea:write"]
      }
    ]
  }));
  const { server, baseUrl } = await startAuthProvider({
    PANACEA_FOUNDATION_USERS_FILE: usersFile
  });
  try {
    const result = await login(baseUrl, {
      username: "security-admin",
      password: "security-password"
    });
    assert.equal(result.response.status, 200);
    assert.deepEqual(result.body.user.roles, ["administrator"]);
    assert.ok(result.body.user.permissions.includes("panacea:admin"));
    assert.ok(result.body.user.permissions.includes("read"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.read_models.read"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.write_workflows.write"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.write_workflows.retry"));
  } finally {
    await close(server);
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("Foundation auth users file does not require fallback operator settings", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "panacea-foundation-users-only-"));
  const usersFile = path.join(directory, "foundation-users.json");
  fs.writeFileSync(usersFile, JSON.stringify({
    users: [
      {
        userId: "project-owner",
        username: "project-owner",
        displayName: "Project Owner",
        tenantId: "utbe-health-system",
        passwordHash: await hashFoundationUserPassword("owner-password", {
          salt: "panacea-project-owner",
          memory: 8192,
          passes: 2
        }),
        roles: ["operator"],
        permissions: ["panacea:operate", "panacea:read", "panacea:write"]
      }
    ]
  }));
  const env = await buildFoundationAuthProviderEnv({
    PANACEA_FOUNDATION_USERS_FILE: usersFile
  });
  for (const key of [
    "PANACEA_FOUNDATION_OPERATOR_USERNAME",
    "PANACEA_FOUNDATION_OPERATOR_PASSWORD_HASH",
    "PANACEA_FOUNDATION_OPERATOR_PASSWORD",
    "PANACEA_FOUNDATION_OPERATOR_USER_ID",
    "PANACEA_FOUNDATION_OPERATOR_DISPLAY_NAME",
    "PANACEA_FOUNDATION_OPERATOR_TENANT_ID",
    "PANACEA_FOUNDATION_OPERATOR_ROLES",
    "PANACEA_FOUNDATION_OPERATOR_PERMISSIONS"
  ]) {
    delete env[key];
  }
  const { server, baseUrl } = await startAuthProviderWithEnv(env);
  try {
    const result = await login(baseUrl, {
      username: "project-owner",
      password: "owner-password"
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.user.username, "project-owner");
    assert.deepEqual(result.body.user.roles, ["operator"]);
    assert.ok(result.body.user.permissions.includes("read"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.read_models.read"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.write_workflows.write"));
    assert.ok(result.body.user.permissions.includes("global_command_intelligence.write_workflows.read"));
  } finally {
    await close(server);
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("Foundation auth rejects expired, wrong issuer, and wrong audience tokens", async () => {
  const { server, config } = await startAuthProvider();
  try {
    const user = {
      userId: "foundation-operator",
      username: "operator",
      tenantId: "utbe-health-system",
      roles: ["operator"],
      permissions: ["panacea:operate"]
    };
    const expired = makeJwt(config, user, { exp: Math.floor(Date.now() / 1000) - 5 });
    const wrongIssuer = makeJwt({ ...config, issuer: "https://wrong.example.invalid" }, user);
    const wrongAudience = makeJwt({ ...config, audience: "wrong-audience" }, user);

    assert.throws(() => verifyFoundationAccessToken(expired, config), /expired/);
    assert.throws(() => verifyFoundationAccessToken(wrongIssuer, config), /issuer/);
    assert.throws(() => verifyFoundationAccessToken(wrongAudience, config), /audience/);
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
  assert.equal(payload.tenantId, "utbe-health-system");
  assert.deepEqual(payload.roles, ["operator"]);
  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  assert.equal(crypto.createVerify("RSA-SHA256")
    .update(`${headerPart}.${payloadPart}`)
    .verify(publicKey, Buffer.from(signaturePart, "base64url")), true);
  return payload;
}

function makeJwt(config, user, overrides = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT", kid: config.keyId };
  const payload = {
    iss: config.issuer,
    sub: user.userId,
    aud: config.audience,
    exp: now + 3600,
    iat: now,
    jti: crypto.randomUUID(),
    tenantId: user.tenantId,
    roles: user.roles,
    permissions: user.permissions,
    username: user.username,
    userId: user.userId,
    ...overrides
  };
  const signingInput = `${Buffer.from(JSON.stringify(header)).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
  const signature = crypto.createSign("RSA-SHA256").update(signingInput).sign(config.privateKeyPem).toString("base64url");
  return `${signingInput}.${signature}`;
}
