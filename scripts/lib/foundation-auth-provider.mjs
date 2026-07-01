import crypto from "node:crypto";
import http from "node:http";

const DEFAULT_ISSUER = "https://foundation.utbe.ai";
const DEFAULT_AUDIENCE = "panacea-web";
const DEFAULT_CORS_ORIGIN = "http://localhost:5174";
const JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const SAFE_HEADERS = [
  "Authorization",
  "Content-Type",
  "X-Tenant-Id",
  "X-User-Id",
  "X-Request-Id",
  "X-Correlation-Id"
];

export class FoundationAuthConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "FoundationAuthConfigurationError";
  }
}

export class FoundationAuthError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "FoundationAuthError";
    this.status = status;
    this.code = code;
  }
}

export function generateFoundationAuthKeyPair() {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });
}

export function hashFoundationOperatorPassword(password, { salt = crypto.randomBytes(16).toString("base64url"), iterations = 210000 } = {}) {
  if (!password) {
    throw new FoundationAuthConfigurationError("operator password value is required before deriving a hash");
  }
  const digest = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("base64url");
  return `pbkdf2_sha256$${iterations}$${salt}$${digest}`;
}

export function buildFoundationAuthProviderEnv(overrides = {}) {
  const keyPair = generateFoundationAuthKeyPair();
  return {
    PANACEA_FOUNDATION_URL: DEFAULT_ISSUER,
    PANACEA_FOUNDATION_JWT_ISSUER: DEFAULT_ISSUER,
    PANACEA_FOUNDATION_AUTH_AUDIENCE: DEFAULT_AUDIENCE,
    PANACEA_FOUNDATION_AUTH_PRIVATE_KEY_PEM: keyPair.privateKey,
    PANACEA_FOUNDATION_AUTH_PUBLIC_KEY_PEM: keyPair.publicKey,
    PANACEA_FOUNDATION_AUTH_KEY_ID: "foundation-auth-test-key",
    PANACEA_FOUNDATION_OPERATOR_USERNAME: "operator",
    PANACEA_FOUNDATION_OPERATOR_PASSWORD_HASH: hashFoundationOperatorPassword("operator-test-password", {
      salt: "panacea-auth-test-salt",
      iterations: 120000
    }),
    PANACEA_FOUNDATION_OPERATOR_USER_ID: "foundation-operator",
    PANACEA_FOUNDATION_OPERATOR_TENANT_ID: "default",
    PANACEA_FOUNDATION_OPERATOR_ROLES: "operator",
    PANACEA_FOUNDATION_OPERATOR_PERMISSIONS: "foundation:read,foundation:audit:append,foundation:policy:evaluate,panacea:operate",
    PANACEA_FOUNDATION_AUTH_ACCESS_TOKEN_TTL_SECONDS: "3600",
    PANACEA_FOUNDATION_AUTH_REFRESH_TOKEN_TTL_SECONDS: "86400",
    PANACEA_FOUNDATION_AUTH_RATE_LIMIT_ATTEMPTS: "5",
    PANACEA_FOUNDATION_AUTH_RATE_LIMIT_WINDOW_MS: "60000",
    PANACEA_FOUNDATION_AUTH_CORS_ORIGIN: DEFAULT_CORS_ORIGIN,
    ...overrides
  };
}

export function loadFoundationAuthProviderConfig(env = process.env) {
  const baseUrl = cleanUrl(readRequired(env, "PANACEA_FOUNDATION_URL"));
  const issuer = cleanUrl(env.PANACEA_FOUNDATION_JWT_ISSUER?.trim() || baseUrl);
  if (issuer !== DEFAULT_ISSUER && baseUrl === DEFAULT_ISSUER) {
    throw new FoundationAuthConfigurationError("Foundation issuer must match https://foundation.utbe.ai for live provider validation");
  }
  const privateKeyPem = normalizePem(readRequired(env, "PANACEA_FOUNDATION_AUTH_PRIVATE_KEY_PEM"));
  const publicKeyPem = normalizePem(env.PANACEA_FOUNDATION_AUTH_PUBLIC_KEY_PEM?.trim() || derivePublicKeyPem(privateKeyPem));
  const operatorPassword = env.PANACEA_FOUNDATION_OPERATOR_PASSWORD?.trim();
  const operatorPasswordHash = env.PANACEA_FOUNDATION_OPERATOR_PASSWORD_HASH?.trim();
  if (!operatorPassword && !operatorPasswordHash) {
    throw new FoundationAuthConfigurationError(
      "PANACEA_FOUNDATION_OPERATOR_PASSWORD_HASH or PANACEA_FOUNDATION_OPERATOR_PASSWORD is required"
    );
  }

  return {
    baseUrl,
    issuer,
    audience: env.PANACEA_FOUNDATION_AUTH_AUDIENCE?.trim() || DEFAULT_AUDIENCE,
    privateKeyPem,
    publicKeyPem,
    keyId: env.PANACEA_FOUNDATION_AUTH_KEY_ID?.trim() || "foundation-auth-key",
    operator: {
      username: readRequired(env, "PANACEA_FOUNDATION_OPERATOR_USERNAME"),
      password: operatorPassword,
      passwordHash: operatorPasswordHash,
      userId: env.PANACEA_FOUNDATION_OPERATOR_USER_ID?.trim() || "foundation-operator",
      tenantId: env.PANACEA_FOUNDATION_OPERATOR_TENANT_ID?.trim() || "default",
      roles: splitCsv(env.PANACEA_FOUNDATION_OPERATOR_ROLES || "operator"),
      permissions: splitCsv(env.PANACEA_FOUNDATION_OPERATOR_PERMISSIONS || "foundation:read,panacea:operate")
    },
    accessTokenTtlSeconds: positiveInteger(env.PANACEA_FOUNDATION_AUTH_ACCESS_TOKEN_TTL_SECONDS, 3600),
    refreshTokenTtlSeconds: positiveInteger(env.PANACEA_FOUNDATION_AUTH_REFRESH_TOKEN_TTL_SECONDS, 86400),
    rateLimitAttempts: positiveInteger(env.PANACEA_FOUNDATION_AUTH_RATE_LIMIT_ATTEMPTS, 5),
    rateLimitWindowMs: positiveInteger(env.PANACEA_FOUNDATION_AUTH_RATE_LIMIT_WINDOW_MS, 60000),
    corsOrigin: env.PANACEA_FOUNDATION_AUTH_CORS_ORIGIN?.trim() || DEFAULT_CORS_ORIGIN
  };
}

export function createFoundationAccessToken({ config, user, nowSeconds = Math.floor(Date.now() / 1000) }) {
  const claims = {
    iss: config.issuer,
    sub: user.userId,
    aud: config.audience,
    exp: nowSeconds + config.accessTokenTtlSeconds,
    iat: nowSeconds,
    tenantId: user.tenantId,
    tenant_id: user.tenantId,
    roles: user.roles,
    permissions: user.permissions,
    userId: user.userId,
    username: user.username,
    name: user.username
  };
  return signJwt({ claims, privateKeyPem: config.privateKeyPem, keyId: config.keyId });
}

export function verifyFoundationAccessToken(token, config, nowSeconds = Math.floor(Date.now() / 1000)) {
  const decoded = decodeJwt(token);
  if (decoded.header.alg !== "RS256") {
    throw new FoundationAuthError(401, "invalid_token", "Bearer token uses an unsupported signing algorithm.");
  }
  const verified = crypto.createVerify("RSA-SHA256")
    .update(decoded.signingInput)
    .verify(config.publicKeyPem, Buffer.from(decoded.signature, "base64url"));
  if (!verified) {
    throw new FoundationAuthError(401, "invalid_token", "Bearer token signature validation failed.");
  }
  const claims = decoded.claims;
  if (claims.iss !== config.issuer || claims.aud !== config.audience) {
    throw new FoundationAuthError(401, "invalid_token", "Bearer token issuer or audience is invalid.");
  }
  if (!claims.exp || claims.exp <= nowSeconds) {
    throw new FoundationAuthError(401, "invalid_token", "Bearer token is expired.");
  }
  return claims;
}

export class FoundationAuthProvider {
  constructor({ config, clock = () => Date.now(), logger = (entry) => process.stdout.write(`${JSON.stringify(entry)}\n`) }) {
    this.config = config;
    this.clock = clock;
    this.logger = logger;
    this.refreshSessions = new Map();
    this.loginAttempts = new Map();
    this.auditEvents = [];
  }

  discovery() {
    return {
      issuer: this.config.issuer,
      jwks_uri: `${this.config.baseUrl}/.well-known/jwks.json`,
      token_endpoint: `${this.config.baseUrl}/api/v1/auth/token`,
      userinfo_endpoint: `${this.config.baseUrl}/api/v1/auth/me`,
      login_endpoint: `${this.config.baseUrl}/api/v1/auth/login`,
      end_session_endpoint: `${this.config.baseUrl}/api/v1/auth/logout`,
      response_types_supported: ["token"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      claims_supported: ["iss", "sub", "aud", "exp", "iat", "tenantId", "roles", "permissions", "userId", "username"],
      grant_types_supported: ["password", "refresh_token"]
    };
  }

  jwks() {
    const jwk = crypto.createPublicKey(this.config.publicKeyPem).export({ format: "jwk" });
    return {
      keys: [
        {
          ...jwk,
          kid: this.config.keyId,
          use: "sig",
          alg: "RS256"
        }
      ]
    };
  }

  login({ username, password, tenantId, ipAddress = "unknown" }) {
    const normalizedUsername = String(username || "").trim();
    const requestedTenant = String(tenantId || "").trim();
    this.assertLoginAllowed(normalizedUsername, ipAddress);

    if (
      normalizedUsername !== this.config.operator.username ||
      requestedTenant !== this.config.operator.tenantId ||
      !this.verifyPassword(String(password || ""))
    ) {
      this.recordLoginFailure(normalizedUsername, ipAddress, requestedTenant);
      throw new FoundationAuthError(401, "invalid_credentials", "Invalid username, password, or tenant.");
    }

    this.resetLoginAttempts(normalizedUsername, ipAddress);
    const user = this.operatorUser();
    const response = this.issueSession(user);
    this.audit("auth.login.success", user, { tenantId: user.tenantId });
    return response;
  }

  token(input, context = {}) {
    const grantType = input.grantType || input.grant_type;
    if (grantType === "password") {
      return this.login({ ...input, ipAddress: context.ipAddress });
    }
    if (grantType === "refresh_token") {
      return this.refresh({ refreshToken: input.refreshToken || input.refresh_token });
    }
    throw new FoundationAuthError(400, "unsupported_grant_type", "Supported grant types are password and refresh_token.");
  }

  refresh({ refreshToken }) {
    const session = this.consumeRefreshToken(refreshToken);
    const response = this.issueSession(session.user);
    this.audit("auth.token.refresh", session.user, { tenantId: session.user.tenantId });
    return response;
  }

  logout({ refreshToken }) {
    const session = this.revokeRefreshToken(refreshToken);
    if (session) {
      this.audit("auth.logout", session.user, { tenantId: session.user.tenantId });
    }
    return { status: "ok", loggedOut: Boolean(session) };
  }

  me(authorizationHeader) {
    const token = bearerToken(authorizationHeader);
    const claims = verifyFoundationAccessToken(token, this.config, Math.floor(this.clock() / 1000));
    const user = userFromClaims(claims);
    this.audit("auth.me.accessed", user, { tenantId: user.tenantId });
    return { user };
  }

  appendAudit(entry) {
    const safeEntry = {
      testOnly: Boolean(entry?.testOnly),
      tenantId: entry?.tenantId || "default",
      actor: entry?.actor || entry?.actorId || "unknown",
      action: entry?.action || "foundation.audit.append",
      occurredAt: entry?.occurredAt || new Date(this.clock()).toISOString()
    };
    this.auditEvents.push(safeEntry);
    this.log("audit.append.accepted", { tenantId: safeEntry.tenantId, action: safeEntry.action, testOnly: safeEntry.testOnly });
    return { accepted: true, testOnly: safeEntry.testOnly };
  }

  evaluatePolicy(input) {
    const tenantId = input?.tenantId || "default";
    const permission = input?.permission || "";
    const allowed = Boolean(tenantId && permission);
    this.log("policy.evaluate.completed", { tenantId, allowed });
    return {
      allowed,
      decision: allowed ? "allow" : "deny",
      reason: allowed ? "Validation policy accepted the tenant-aware request." : "Tenant and permission are required."
    };
  }

  operatorUser() {
    return {
      userId: this.config.operator.userId,
      username: this.config.operator.username,
      tenantId: this.config.operator.tenantId,
      roles: this.config.operator.roles,
      permissions: this.config.operator.permissions
    };
  }

  issueSession(user) {
    const nowSeconds = Math.floor(this.clock() / 1000);
    const accessToken = createFoundationAccessToken({ config: this.config, user, nowSeconds });
    const refreshToken = crypto.randomBytes(32).toString("base64url");
    this.refreshSessions.set(refreshToken, {
      user,
      expiresAt: this.clock() + this.config.refreshTokenTtlSeconds * 1000
    });
    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenTtlSeconds,
      tokenType: "Bearer",
      user
    };
  }

  verifyPassword(candidatePassword) {
    if (this.config.operator.passwordHash) {
      return verifyPasswordHash(candidatePassword, this.config.operator.passwordHash);
    }
    return timingSafeStringEqual(sha256(candidatePassword), sha256(this.config.operator.password));
  }

  assertLoginAllowed(username, ipAddress) {
    const key = loginAttemptKey(username, ipAddress);
    const attempt = this.loginAttempts.get(key);
    if (!attempt || attempt.resetAt <= this.clock()) {
      return;
    }
    if (attempt.count >= this.config.rateLimitAttempts) {
      throw new FoundationAuthError(429, "rate_limited", "Too many login attempts. Try again later.");
    }
  }

  recordLoginFailure(username, ipAddress, tenantId) {
    const key = loginAttemptKey(username, ipAddress);
    const existing = this.loginAttempts.get(key);
    const resetAt = existing?.resetAt && existing.resetAt > this.clock()
      ? existing.resetAt
      : this.clock() + this.config.rateLimitWindowMs;
    this.loginAttempts.set(key, {
      count: (existing?.count || 0) + 1,
      resetAt
    });
    this.audit("auth.login.failure", { username: username || "unknown", tenantId: tenantId || "unknown", userId: "unknown", roles: [], permissions: [] }, { tenantId });
  }

  resetLoginAttempts(username, ipAddress) {
    this.loginAttempts.delete(loginAttemptKey(username, ipAddress));
  }

  consumeRefreshToken(refreshToken) {
    const session = this.refreshSessions.get(String(refreshToken || ""));
    if (!session) {
      throw new FoundationAuthError(401, "invalid_refresh_token", "Refresh token is invalid or expired.");
    }
    this.refreshSessions.delete(String(refreshToken));
    if (session.expiresAt <= this.clock()) {
      throw new FoundationAuthError(401, "invalid_refresh_token", "Refresh token is invalid or expired.");
    }
    return session;
  }

  revokeRefreshToken(refreshToken) {
    const key = String(refreshToken || "");
    const session = this.refreshSessions.get(key);
    this.refreshSessions.delete(key);
    return session;
  }

  audit(action, user, metadata = {}) {
    const entry = {
      action,
      tenantId: user.tenantId || metadata.tenantId || "unknown",
      actorId: user.userId || user.username || "unknown",
      username: user.username || "unknown",
      occurredAt: new Date(this.clock()).toISOString(),
      metadata: sanitizeAuditMetadata(metadata)
    };
    this.auditEvents.push(entry);
    this.log(action, { tenantId: entry.tenantId, actorId: entry.actorId, username: entry.username });
  }

  log(event, details) {
    this.logger({
      level: "info",
      service: "foundation-auth-provider",
      event,
      at: new Date(this.clock()).toISOString(),
      ...details
    });
  }
}

export function createFoundationAuthProviderServer({ config, provider = new FoundationAuthProvider({ config }), logger } = {}) {
  if (!config) {
    throw new FoundationAuthConfigurationError("Foundation auth provider config is required");
  }
  const authProvider = provider;
  return http.createServer(async (request, response) => {
    const requestId = request.headers["x-request-id"] || crypto.randomUUID();
    try {
      applyCors(response, request, config);
      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      const url = new URL(request.url || "/", config.baseUrl);
      const readMethod = request.method === "HEAD" ? "GET" : request.method;
      if (readMethod === "GET" && url.pathname === "/health") return json(response, 200, { status: "ok", service: "foundation-auth-provider" }, request.method);
      if (readMethod === "GET" && url.pathname === "/ready") return json(response, 200, { status: "ready", auth: "enabled" }, request.method);
      if (readMethod === "GET" && url.pathname === "/metrics") return text(response, 200, "foundation_auth_provider_up 1\nfoundation_auth_provider_auth_enabled 1\n", "text/plain; charset=utf-8", request.method);
      if (readMethod === "GET" && url.pathname === "/.well-known/jwks.json") return json(response, 200, authProvider.jwks(), request.method);
      if (readMethod === "GET" && url.pathname === "/.well-known/openid-configuration") return json(response, 200, authProvider.discovery(), request.method);
      if (request.method === "POST" && url.pathname === "/api/v1/audit-records") return json(response, 200, authProvider.appendAudit(await readJson(request)));
      if (request.method === "POST" && url.pathname === "/api/v1/policy/evaluate") return json(response, 200, authProvider.evaluatePolicy(await readJson(request)));
      if (request.method === "POST" && url.pathname === "/api/v1/auth/login") {
        return json(response, 200, authProvider.login({ ...(await readJson(request)), ipAddress: clientAddress(request) }));
      }
      if (request.method === "POST" && url.pathname === "/api/v1/auth/token") {
        return json(response, 200, authProvider.token(await readJson(request), { ipAddress: clientAddress(request) }));
      }
      if (request.method === "POST" && url.pathname === "/api/v1/auth/refresh") {
        return json(response, 200, authProvider.refresh(await readJson(request)));
      }
      if (request.method === "POST" && url.pathname === "/api/v1/auth/logout") {
        return json(response, 200, authProvider.logout(await readJson(request)));
      }
      if (request.method === "GET" && url.pathname === "/api/v1/auth/me") {
        return json(response, 200, authProvider.me(request.headers.authorization));
      }
      return json(response, 404, { error: "not_found", message: "Foundation endpoint was not found.", requestId });
    } catch (error) {
      const normalized = normalizeError(error);
      if (logger) {
        logger({ level: "warn", event: "foundation.auth.request.failed", requestId, status: normalized.status, code: normalized.code });
      }
      return json(response, normalized.status, { error: normalized.code, message: normalized.message, requestId });
    }
  });
}

function readRequired(env, name) {
  const value = env[name];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new FoundationAuthConfigurationError(`${name} is required`);
  }
  return value.trim();
}

function positiveInteger(value, fallback) {
  const raw = value || String(fallback);
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new FoundationAuthConfigurationError(`${raw} must be a positive integer setting`);
  }
  return parsed;
}

function cleanUrl(value) {
  return value.trim().replace(/\/$/, "");
}

function normalizePem(value) {
  return value.replace(/\\n/g, "\n");
}

function derivePublicKeyPem(privateKeyPem) {
  return crypto.createPublicKey(privateKeyPem).export({ type: "spki", format: "pem" });
}

function splitCsv(value) {
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function signJwt({ claims, privateKeyPem, keyId }) {
  const header = { alg: "RS256", typ: "JWT", kid: keyId };
  const signingInput = `${base64UrlJson(header)}.${base64UrlJson(claims)}`;
  const signature = crypto.createSign("RSA-SHA256").update(signingInput).sign(privateKeyPem).toString("base64url");
  return `${signingInput}.${signature}`;
}

function decodeJwt(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw new FoundationAuthError(401, "invalid_token", "Bearer token must contain header, payload, and signature.");
  }
  return {
    header: JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")),
    claims: JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")),
    signingInput: `${parts[0]}.${parts[1]}`,
    signature: parts[2]
  };
}

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function bearerToken(header) {
  const value = String(header || "");
  if (!value.startsWith("Bearer ")) {
    throw new FoundationAuthError(401, "missing_bearer_token", "Bearer token is required.");
  }
  return value.slice("Bearer ".length);
}

function userFromClaims(claims) {
  return {
    userId: claims.userId || claims.sub,
    username: claims.username || claims.sub,
    tenantId: claims.tenantId || claims.tenant_id,
    roles: Array.isArray(claims.roles) ? claims.roles : [],
    permissions: Array.isArray(claims.permissions) ? claims.permissions : []
  };
}

function verifyPasswordHash(password, stored) {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") {
    throw new FoundationAuthConfigurationError("operator password hash must use pbkdf2_sha256 format");
  }
  const iterations = Number.parseInt(parts[1], 10);
  const salt = parts[2];
  const expected = parts[3];
  const actual = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("base64url");
  return timingSafeStringEqual(actual, expected);
}

function timingSafeStringEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("base64url");
}

function loginAttemptKey(username, ipAddress) {
  return `${String(ipAddress || "unknown")}:${String(username || "unknown").toLowerCase()}`;
}

function sanitizeAuditMetadata(metadata) {
  const result = {};
  for (const [key, value] of Object.entries(metadata || {})) {
    if (/password|token|secret/i.test(key)) continue;
    result[key] = value;
  }
  return result;
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64 * 1024) {
      throw new FoundationAuthError(413, "payload_too_large", "Request body is too large.");
    }
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8").trim();
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new FoundationAuthError(400, "invalid_json", "Request body must be valid JSON.");
  }
}

function applyCors(response, request, config) {
  const origin = request.headers.origin;
  if (origin === config.corsOrigin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", SAFE_HEADERS.join(", "));
    response.setHeader("Access-Control-Max-Age", "600");
  }
}

function json(response, status, body, method = "GET") {
  response.writeHead(status, { "content-type": JSON_CONTENT_TYPE });
  response.end(method === "HEAD" ? undefined : JSON.stringify(body));
}

function text(response, status, body, contentType, method = "GET") {
  response.writeHead(status, { "content-type": contentType });
  response.end(method === "HEAD" ? undefined : body);
}

function normalizeError(error) {
  if (error instanceof FoundationAuthError) {
    return { status: error.status, code: error.code, message: error.message };
  }
  return { status: 500, code: "foundation_auth_error", message: "Foundation authentication request failed." };
}

function clientAddress(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return request.socket.remoteAddress || "unknown";
}
