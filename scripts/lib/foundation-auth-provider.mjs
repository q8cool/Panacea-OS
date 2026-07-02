import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import argon2 from "argon2";

const DEFAULT_ISSUER = "https://foundation.utbe.ai";
const DEFAULT_AUDIENCE = "panacea-os";
const DEFAULT_CORS_ORIGIN = "https://panacea.utbe.ai";
const JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const SAFE_HEADERS = [
  "Authorization",
  "Content-Type",
  "X-Tenant-Id",
  "X-Tenant-ID",
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

export async function hashFoundationUserPassword(password, {
  salt,
  memory = 65536,
  passes = 3,
  parallelism = 1,
  tagLength = 32
} = {}) {
  if (!password) {
    throw new FoundationAuthConfigurationError("password value is required before deriving a hash");
  }
  const options = {
    type: argon2.argon2id,
    memoryCost: memory,
    timeCost: passes,
    parallelism,
    hashLength: tagLength
  };
  if (salt) {
    options.salt = Buffer.isBuffer(salt) ? salt : Buffer.from(String(salt), "base64url");
  }
  const encoded = await argon2.hash(String(password), options);
  return encoded.replace(/^\$/, "");
}

export const hashFoundationOperatorPassword = hashFoundationUserPassword;

export async function buildFoundationAuthProviderEnv(overrides = {}) {
  const keyPair = generateFoundationAuthKeyPair();
  return {
    PANACEA_FOUNDATION_URL: DEFAULT_ISSUER,
    PANACEA_FOUNDATION_JWT_ISSUER: DEFAULT_ISSUER,
    PANACEA_FOUNDATION_AUTH_AUDIENCE: DEFAULT_AUDIENCE,
    PANACEA_FOUNDATION_AUTH_PRIVATE_KEY_PEM: keyPair.privateKey,
    PANACEA_FOUNDATION_AUTH_PUBLIC_KEY_PEM: keyPair.publicKey,
    PANACEA_FOUNDATION_AUTH_KEY_ID: "foundation-auth-test-key",
    PANACEA_FOUNDATION_OPERATOR_USERNAME: "operator",
    PANACEA_FOUNDATION_OPERATOR_PASSWORD_HASH: await hashFoundationUserPassword("operator-test-password", {
      salt: "panacea-auth-test-salt",
      memory: 8192,
      passes: 2
    }),
    PANACEA_FOUNDATION_OPERATOR_USER_ID: "foundation-operator",
    PANACEA_FOUNDATION_OPERATOR_DISPLAY_NAME: "Foundation Operator",
    PANACEA_FOUNDATION_OPERATOR_TENANT_ID: "utbe-health-system",
    PANACEA_FOUNDATION_OPERATOR_ROLES: "operator",
    PANACEA_FOUNDATION_OPERATOR_PERMISSIONS: "panacea:operate,panacea:read,panacea:write,read,global_command_intelligence.read_models.read,global_command_intelligence.write_workflows.write,global_command_intelligence.write_workflows.read,global_command_intelligence.write_workflows.retry",
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
  const operatorPasswordHash = env.PANACEA_FOUNDATION_OPERATOR_PASSWORD_HASH?.trim();
  const hasUserSource = Boolean(env.PANACEA_FOUNDATION_USERS_FILE?.trim() || env.PANACEA_FOUNDATION_USERS_JSON?.trim());
  if (!hasUserSource && !operatorPasswordHash) {
    throw new FoundationAuthConfigurationError(
      "PANACEA_FOUNDATION_USERS_FILE, PANACEA_FOUNDATION_USERS_JSON, or PANACEA_FOUNDATION_OPERATOR_PASSWORD_HASH is required"
    );
  }

  const fallbackOperator = hasUserSource
    ? undefined
    : {
      username: readRequired(env, "PANACEA_FOUNDATION_OPERATOR_USERNAME"),
      passwordHash: operatorPasswordHash,
      userId: env.PANACEA_FOUNDATION_OPERATOR_USER_ID?.trim() || "foundation-operator",
      displayName: env.PANACEA_FOUNDATION_OPERATOR_DISPLAY_NAME?.trim() || env.PANACEA_FOUNDATION_OPERATOR_USERNAME?.trim() || "Foundation Operator",
      tenantId: env.PANACEA_FOUNDATION_OPERATOR_TENANT_ID?.trim() || "utbe-health-system",
      roles: splitCsv(env.PANACEA_FOUNDATION_OPERATOR_ROLES || "operator"),
      permissions: splitCsv(env.PANACEA_FOUNDATION_OPERATOR_PERMISSIONS || "panacea:operate,panacea:read")
    };

  return {
    baseUrl,
    issuer,
    audience: env.PANACEA_FOUNDATION_AUTH_AUDIENCE?.trim() || DEFAULT_AUDIENCE,
    privateKeyPem,
    publicKeyPem,
    keyId: env.PANACEA_FOUNDATION_AUTH_KEY_ID?.trim() || "foundation-auth-key",
    users: loadFoundationUsers(env, fallbackOperator),
    accessTokenTtlSeconds: positiveInteger(env.PANACEA_FOUNDATION_AUTH_ACCESS_TOKEN_TTL_SECONDS, 3600),
    refreshTokenTtlSeconds: positiveInteger(env.PANACEA_FOUNDATION_AUTH_REFRESH_TOKEN_TTL_SECONDS, 86400),
    rateLimitAttempts: positiveInteger(env.PANACEA_FOUNDATION_AUTH_RATE_LIMIT_ATTEMPTS, 5),
    rateLimitWindowMs: positiveInteger(env.PANACEA_FOUNDATION_AUTH_RATE_LIMIT_WINDOW_MS, 60000),
    corsOrigins: splitCsv(env.PANACEA_FOUNDATION_AUTH_CORS_ORIGIN || DEFAULT_CORS_ORIGIN),
    refreshTokenStoreFile: env.PANACEA_FOUNDATION_AUTH_REFRESH_TOKEN_STORE_FILE?.trim() || ""
  };
}

export function createFoundationAccessToken({ config, user, nowSeconds = Math.floor(Date.now() / 1000) }) {
  const displayName = user.displayName || user.name || user.username;
  const claims = {
    iss: config.issuer,
    sub: user.userId,
    aud: config.audience,
    exp: nowSeconds + config.accessTokenTtlSeconds,
    iat: nowSeconds,
    jti: crypto.randomUUID(),
    tenantId: user.tenantId,
    tenant_id: user.tenantId,
    roles: user.roles,
    permissions: user.permissions,
    userId: user.userId,
    username: user.username,
    name: displayName
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
  if (claims.iss !== config.issuer) {
    throw new FoundationAuthError(401, "invalid_token", "Bearer token issuer is invalid.");
  }
  if (claims.aud !== config.audience) {
    throw new FoundationAuthError(401, "invalid_token", "Bearer token audience is invalid.");
  }
  if (!claims.exp || claims.exp <= nowSeconds) {
    throw new FoundationAuthError(401, "invalid_token", "Bearer token is expired.");
  }
  if (!claims.tenantId && !claims.tenant_id) {
    throw new FoundationAuthError(401, "invalid_token", "Bearer token tenant claim is missing.");
  }
  return claims;
}

export class FoundationAuthProvider {
  constructor({ config, clock = () => Date.now(), logger = (entry) => process.stdout.write(`${JSON.stringify(entry)}\n`) }) {
    this.config = config;
    this.clock = clock;
    this.logger = logger;
    this.refreshSessions = loadRefreshSessions(config);
    this.loginAttempts = new Map();
    this.auditEvents = [];
  }

  discovery() {
    return {
      issuer: this.config.issuer,
      jwks_uri: `${this.config.baseUrl}/.well-known/jwks.json`,
      authorization_endpoint: null,
      token_endpoint: `${this.config.baseUrl}/api/v1/auth/token`,
      login_endpoint: `${this.config.baseUrl}/api/v1/auth/login`,
      userinfo_endpoint: `${this.config.baseUrl}/api/v1/auth/me`,
      revocation_endpoint: `${this.config.baseUrl}/api/v1/auth/logout`,
      end_session_endpoint: `${this.config.baseUrl}/api/v1/auth/logout`,
      response_types_supported: ["token"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      claims_supported: ["iss", "sub", "aud", "exp", "iat", "jti", "tenantId", "roles", "permissions", "userId", "username", "name"],
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
          kty: "RSA",
          use: "sig",
          alg: "RS256"
        }
      ]
    };
  }

  async login({ username, password, tenantId, ipAddress = "unknown" }) {
    const normalizedUsername = String(username || "").trim();
    const requestedTenant = String(tenantId || "").trim();
    this.assertLoginAllowed(normalizedUsername, ipAddress);

    const user = this.findUser(normalizedUsername, requestedTenant);
    if (!user || !(await this.verifyPassword(String(password || ""), user))) {
      this.recordLoginFailure(normalizedUsername, ipAddress, requestedTenant);
      throw new FoundationAuthError(401, "invalid_credentials", "Invalid username, password, or tenant.");
    }

    this.resetLoginAttempts(normalizedUsername, ipAddress);
    const response = this.issueSession(user);
    this.audit("auth.login.success", user, { tenantId: user.tenantId });
    return response;
  }

  async token(input, context = {}) {
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
      tenantId: entry?.tenantId || "utbe-health-system",
      actor: entry?.actor || entry?.actorId || "unknown",
      action: entry?.action || "foundation.audit.append",
      occurredAt: entry?.occurredAt || new Date(this.clock()).toISOString()
    };
    this.auditEvents.push(safeEntry);
    this.log("audit.append.accepted", { tenantId: safeEntry.tenantId, action: safeEntry.action, testOnly: safeEntry.testOnly });
    return { accepted: true, testOnly: safeEntry.testOnly };
  }

  evaluatePolicy(input) {
    const tenantId = input?.tenantId || "utbe-health-system";
    const permission = input?.permission || "";
    const allowed = Boolean(tenantId && permission);
    this.log("policy.evaluate.completed", { tenantId, allowed });
    return {
      allowed,
      decision: allowed ? "allow" : "deny",
      reason: allowed ? "Tenant-aware request accepted by the configured policy contract." : "Tenant and permission are required."
    };
  }

  operatorUser() {
    return this.config.users[0];
  }

  findUser(username, tenantId) {
    return this.config.users.find((user) => (
      user.username === username &&
      user.tenantId === tenantId &&
      user.enabled !== false
    ));
  }

  issueSession(user) {
    const nowSeconds = Math.floor(this.clock() / 1000);
    const accessToken = createFoundationAccessToken({ config: this.config, user, nowSeconds });
    const refreshToken = crypto.randomBytes(32).toString("base64url");
    const now = this.clock();
    const tokenHash = refreshTokenHash(refreshToken);
    this.refreshSessions.set(tokenHash, {
      tokenId: crypto.randomUUID(),
      tokenHash,
      user,
      userId: user.userId,
      tenantId: user.tenantId,
      expiresAt: now + this.config.refreshTokenTtlSeconds * 1000,
      revoked: false,
      createdAt: new Date(now).toISOString(),
      rotatedAt: undefined,
      lastUsedAt: undefined
    });
    this.persistRefreshSessions();
    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenTtlSeconds,
      tokenType: "Bearer",
      user: publicUser(user)
    };
  }

  async verifyPassword(candidatePassword, user) {
    return verifyPasswordHash(candidatePassword, user.passwordHash);
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
    const key = refreshTokenHash(refreshToken);
    const session = this.refreshSessions.get(key);
    if (!session) {
      throw new FoundationAuthError(401, "invalid_refresh_token", "Refresh token is invalid or expired.");
    }
    session.lastUsedAt = new Date(this.clock()).toISOString();
    if (session.revoked || session.expiresAt <= this.clock()) {
      session.revoked = true;
      this.persistRefreshSessions();
      throw new FoundationAuthError(401, "invalid_refresh_token", "Refresh token is invalid or expired.");
    }
    session.revoked = true;
    session.rotatedAt = new Date(this.clock()).toISOString();
    this.persistRefreshSessions();
    return session;
  }

  revokeRefreshToken(refreshToken) {
    const key = refreshTokenHash(refreshToken);
    const session = this.refreshSessions.get(key);
    if (session) {
      session.revoked = true;
      session.lastUsedAt = new Date(this.clock()).toISOString();
      this.persistRefreshSessions();
    }
    return session;
  }

  persistRefreshSessions() {
    if (!this.config.refreshTokenStoreFile) return;
    const payload = {
      version: 1,
      updatedAt: new Date(this.clock()).toISOString(),
      sessions: [...this.refreshSessions.values()]
    };
    fs.mkdirSync(directoryName(this.config.refreshTokenStoreFile), { recursive: true });
    fs.writeFileSync(this.config.refreshTokenStoreFile, `${JSON.stringify(payload, null, 2)}\n`, { mode: 0o600 });
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
        return json(response, 200, await authProvider.login({ ...(await readJson(request)), ipAddress: clientAddress(request) }));
      }
      if (request.method === "POST" && url.pathname === "/api/v1/auth/token") {
        return json(response, 200, await authProvider.token(await readJson(request), { ipAddress: clientAddress(request) }));
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

function loadRefreshSessions(config) {
  const sessions = new Map();
  if (!config.refreshTokenStoreFile || !fs.existsSync(config.refreshTokenStoreFile)) return sessions;
  try {
    const parsed = JSON.parse(fs.readFileSync(config.refreshTokenStoreFile, "utf8"));
    for (const session of parsed.sessions || []) {
      if (session.tokenHash) sessions.set(session.tokenHash, session);
    }
  } catch {
    throw new FoundationAuthConfigurationError("Refresh token store file must contain valid JSON");
  }
  return sessions;
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

function loadFoundationUsers(env, fallbackOperator) {
  const sourceFile = env.PANACEA_FOUNDATION_USERS_FILE?.trim();
  const sourceJson = env.PANACEA_FOUNDATION_USERS_JSON?.trim();
  const raw = sourceFile
    ? fs.readFileSync(sourceFile, "utf8")
    : sourceJson;
  const users = raw ? parseUsers(raw, sourceFile || "PANACEA_FOUNDATION_USERS_JSON") : [fallbackOperator];
  if (!Array.isArray(users) || users.length === 0) {
    throw new FoundationAuthConfigurationError("At least one Foundation user is required");
  }
  return users.map((user, index) => normalizeUser(user, index));
}

function parseUsers(raw, source) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.users;
  } catch {
    throw new FoundationAuthConfigurationError(`${source} must contain valid JSON`);
  }
}

function normalizeUser(user, index) {
  const label = `Foundation user at index ${index}`;
  const passwordHash = String(user?.passwordHash || "").trim();
  if (!passwordHash) throw new FoundationAuthConfigurationError(`${label} must include passwordHash`);
  if (!passwordHash.startsWith("argon2id$")) throw new FoundationAuthConfigurationError(`${label} passwordHash must use argon2id`);
  validateArgon2idHashFormat(passwordHash, label);
  const roles = Array.isArray(user?.roles) ? user.roles.map(String).map((role) => role.trim()).filter(Boolean) : splitCsv(user?.roles || "");
  const permissions = Array.isArray(user?.permissions) ? user.permissions.map(String).map((permission) => permission.trim()).filter(Boolean) : splitCsv(user?.permissions || "");
  const normalized = {
    userId: String(user?.userId || "").trim(),
    username: String(user?.username || "").trim(),
    displayName: String(user?.displayName || user?.name || user?.username || "").trim(),
    tenantId: String(user?.tenantId || "").trim(),
    passwordHash,
    roles,
    permissions: expandFoundationPermissions(permissions, roles),
    enabled: user?.enabled !== false
  };
  for (const field of ["userId", "username", "tenantId"]) {
    if (!normalized[field]) throw new FoundationAuthConfigurationError(`${label} must include ${field}`);
  }
  if (normalized.roles.length === 0) throw new FoundationAuthConfigurationError(`${label} must include at least one role`);
  if (normalized.permissions.length === 0) throw new FoundationAuthConfigurationError(`${label} must include at least one permission`);
  return normalized;
}

function expandFoundationPermissions(permissions, roles = []) {
  const expanded = new Set(permissions);
  if (expanded.has("panacea:read")) {
    expanded.add("read");
    expanded.add("global_command_intelligence.read_models.read");
  }
  if (expanded.has("panacea:write")) {
    expanded.add("global_command_intelligence.write_workflows.write");
  }
  if (expanded.has("panacea:operate")) {
    expanded.add("global_command_intelligence.write_workflows.read");
    expanded.add("global_command_intelligence.write_workflows.retry");
  }
  if (expanded.has("panacea:admin") || roles.includes("administrator")) {
    expanded.add("read");
    expanded.add("global_command_intelligence.read_models.read");
    expanded.add("global_command_intelligence.write_workflows.write");
    expanded.add("global_command_intelligence.write_workflows.read");
    expanded.add("global_command_intelligence.write_workflows.retry");
  }
  return [...expanded];
}

function validateArgon2idHashFormat(passwordHash, label) {
  const parts = passwordHash.split("$");
  if (parts.length !== 5 || parts[0] !== "argon2id" || parts[1] !== "v=19" || !parts[2] || !parts[3] || !parts[4]) {
    throw new FoundationAuthConfigurationError(`${label} passwordHash must use argon2id$v=19 format`);
  }
  const params = Object.fromEntries(parts[2].split(",").map((item) => item.split("=")));
  for (const key of ["m", "t", "p"]) {
    const parsed = Number.parseInt(params[key], 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new FoundationAuthConfigurationError(`${label} passwordHash must include valid argon2id parameters`);
    }
  }
  for (const encodedPart of [parts[3], parts[4]]) {
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encodedPart)) {
      throw new FoundationAuthConfigurationError(`${label} passwordHash must contain valid argon2 salt and hash values`);
    }
  }
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
    displayName: claims.name || claims.username || claims.sub,
    tenantId: claims.tenantId || claims.tenant_id,
    roles: Array.isArray(claims.roles) ? claims.roles : [],
    permissions: Array.isArray(claims.permissions) ? claims.permissions : []
  };
}

function publicUser(user) {
  return {
    id: user.userId,
    userId: user.userId,
    username: user.username,
    displayName: user.displayName || user.username,
    tenantId: user.tenantId,
    roles: user.roles,
    permissions: user.permissions
  };
}

export async function verifyFoundationUserPassword(password, stored) {
  return verifyPasswordHash(password, stored);
}

async function verifyPasswordHash(password, stored) {
  if (stored.startsWith("argon2id$")) {
    return verifyArgon2idPasswordHash(password, stored);
  }
  throw new FoundationAuthConfigurationError("password hash must use argon2id");
}

async function verifyArgon2idPasswordHash(password, stored) {
  const parts = stored.split("$");
  if (parts.length !== 5 || parts[0] !== "argon2id" || parts[1] !== "v=19" || !parts[2] || !parts[3] || !parts[4]) {
    throw new FoundationAuthConfigurationError("password hash must use argon2id$v=19 format");
  }
  try {
    return await argon2.verify(`$${stored}`, String(password || ""));
  } catch {
    throw new FoundationAuthConfigurationError("password hash must be a valid argon2id value");
  }
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

function refreshTokenHash(refreshToken) {
  return crypto.createHash("sha256").update(String(refreshToken || "")).digest("base64url");
}

function directoryName(filePath) {
  const normalized = String(filePath || "").trim();
  const lastSlash = Math.max(normalized.lastIndexOf("/"), normalized.lastIndexOf("\\"));
  return lastSlash > 0 ? normalized.slice(0, lastSlash) : ".";
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
  if (origin && config.corsOrigins.includes(origin)) {
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
  if (error instanceof FoundationAuthConfigurationError) {
    return { status: 500, code: "foundation_auth_configuration_error", message: "Foundation authentication provider is not configured." };
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
