const requiredFoundationEnv = [
  "PANACEA_FOUNDATION_URL",
  "PANACEA_FOUNDATION_JWT_ISSUER",
  "PANACEA_FOUNDATION_AUDIT_APPEND_PATH",
  "PANACEA_FOUNDATION_POLICY_EVALUATION_PATH",
  "PANACEA_FOUNDATION_HEALTH_PATH",
  "PANACEA_FOUNDATION_READY_PATH",
  "PANACEA_FOUNDATION_METRICS_PATH"
];

function requireText(env, name) {
  const value = env[name];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required for external Foundation provider wiring`);
  }
  return value.trim();
}

function parsePositiveInteger(env, name, fallback) {
  const raw = env[name] ?? String(fallback);
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function normalizePath(pathValue, name) {
  if (!pathValue.startsWith("/")) {
    throw new Error(`${name} must start with /`);
  }
  return pathValue;
}

function parseUrl(value, name) {
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch (error) {
    throw new Error(`${name} must be a valid absolute URL`);
  }
}

function resolveJwtVerifier(env) {
  const jwksUrl = env.PANACEA_FOUNDATION_JWKS_URL?.trim();
  const publicKey = env.PANACEA_FOUNDATION_JWT_PUBLIC_KEY?.trim();
  if (!jwksUrl && !publicKey) {
    throw new Error("PANACEA_FOUNDATION_JWKS_URL or PANACEA_FOUNDATION_JWT_PUBLIC_KEY is required");
  }
  if (jwksUrl) {
    parseUrl(jwksUrl, "PANACEA_FOUNDATION_JWKS_URL");
  }
  return { jwksUrl: jwksUrl || undefined, publicKey: publicKey || undefined };
}

export function loadFoundationProviderConfig(env = process.env) {
  for (const name of requiredFoundationEnv) {
    requireText(env, name);
  }
  const verifier = resolveJwtVerifier(env);
  return {
    baseUrl: parseUrl(requireText(env, "PANACEA_FOUNDATION_URL"), "PANACEA_FOUNDATION_URL"),
    jwtIssuer: requireText(env, "PANACEA_FOUNDATION_JWT_ISSUER"),
    jwksUrl: verifier.jwksUrl,
    publicKey: verifier.publicKey,
    auditAppendPath: normalizePath(requireText(env, "PANACEA_FOUNDATION_AUDIT_APPEND_PATH"), "PANACEA_FOUNDATION_AUDIT_APPEND_PATH"),
    policyEvaluationPath: normalizePath(
      requireText(env, "PANACEA_FOUNDATION_POLICY_EVALUATION_PATH"),
      "PANACEA_FOUNDATION_POLICY_EVALUATION_PATH"
    ),
    healthPath: normalizePath(requireText(env, "PANACEA_FOUNDATION_HEALTH_PATH"), "PANACEA_FOUNDATION_HEALTH_PATH"),
    readinessPath: normalizePath(requireText(env, "PANACEA_FOUNDATION_READY_PATH"), "PANACEA_FOUNDATION_READY_PATH"),
    metricsPath: normalizePath(requireText(env, "PANACEA_FOUNDATION_METRICS_PATH"), "PANACEA_FOUNDATION_METRICS_PATH"),
    timeoutMs: parsePositiveInteger(env, "PANACEA_FOUNDATION_TIMEOUT_MS", 2000),
    retryAttempts: parsePositiveInteger(env, "PANACEA_FOUNDATION_RETRY_ATTEMPTS", 2),
    retryBackoffMs: parsePositiveInteger(env, "PANACEA_FOUNDATION_RETRY_BACKOFF_MS", 100),
    circuitBreakerFailureThreshold: parsePositiveInteger(env, "PANACEA_FOUNDATION_CIRCUIT_BREAKER_FAILURE_THRESHOLD", 3),
    circuitBreakerResetMs: parsePositiveInteger(env, "PANACEA_FOUNDATION_CIRCUIT_BREAKER_RESET_MS", 30000)
  };
}

export function buildFoundationProviderEnv(overrides = {}) {
  return {
    PANACEA_FOUNDATION_URL: "https://foundation.panacea.local",
    PANACEA_FOUNDATION_JWT_ISSUER: "https://foundation.panacea.local",
    PANACEA_FOUNDATION_JWKS_URL: "https://foundation.panacea.local/.well-known/jwks.json",
    PANACEA_FOUNDATION_AUDIT_APPEND_PATH: "/api/v1/foundation/audit/events",
    PANACEA_FOUNDATION_POLICY_EVALUATION_PATH: "/api/v1/foundation/access/evaluate",
    PANACEA_FOUNDATION_HEALTH_PATH: "/api/v1/foundation/live",
    PANACEA_FOUNDATION_READY_PATH: "/api/v1/foundation/ready",
    PANACEA_FOUNDATION_METRICS_PATH: "/api/v1/foundation/metrics",
    PANACEA_FOUNDATION_TIMEOUT_MS: "2000",
    PANACEA_FOUNDATION_RETRY_ATTEMPTS: "2",
    PANACEA_FOUNDATION_RETRY_BACKOFF_MS: "1",
    PANACEA_FOUNDATION_CIRCUIT_BREAKER_FAILURE_THRESHOLD: "2",
    PANACEA_FOUNDATION_CIRCUIT_BREAKER_RESET_MS: "50",
    ...overrides
  };
}

export class FoundationProviderCircuitOpenError extends Error {
  constructor(message = "Foundation provider circuit is open") {
    super(message);
    this.name = "FoundationProviderCircuitOpenError";
  }
}

export class FoundationProviderRequestError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "FoundationProviderRequestError";
    this.details = details;
  }
}

export class FoundationProviderClient {
  constructor({ config, fetchImpl = globalThis.fetch, clock = () => Date.now(), wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) }) {
    if (!config) {
      throw new Error("Foundation provider config is required");
    }
    if (typeof fetchImpl !== "function") {
      throw new Error("Foundation provider fetch implementation is required");
    }
    this.config = config;
    this.fetchImpl = fetchImpl;
    this.clock = clock;
    this.wait = wait;
    this.failureCount = 0;
    this.openedAt = null;
  }

  async health() {
    return this.#request("GET", this.config.healthPath);
  }

  async readiness() {
    return this.#request("GET", this.config.readinessPath);
  }

  async metrics() {
    return this.#request("GET", this.config.metricsPath);
  }

  async appendAudit(entry) {
    const payload = this.#requireObject(entry, "audit entry");
    for (const field of ["tenantId", "actorId", "action", "resourceType", "resourceId", "occurredAt"]) {
      if (!payload[field]) {
        throw new Error(`audit entry ${field} is required`);
      }
    }
    return this.#request("POST", this.config.auditAppendPath, payload);
  }

  async evaluatePolicy(input) {
    const payload = this.#requireObject(input, "policy evaluation input");
    for (const field of ["tenantId", "actorId", "permission", "resourceType", "action"]) {
      if (!payload[field]) {
        throw new Error(`policy evaluation ${field} is required`);
      }
    }
    return this.#request("POST", this.config.policyEvaluationPath, payload);
  }

  #requireObject(value, label) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`${label} must be an object`);
    }
    return value;
  }

  #assertCircuitClosed() {
    if (this.openedAt === null) {
      return;
    }
    if (this.clock() - this.openedAt < this.config.circuitBreakerResetMs) {
      throw new FoundationProviderCircuitOpenError();
    }
    this.failureCount = 0;
    this.openedAt = null;
  }

  #recordSuccess() {
    this.failureCount = 0;
    this.openedAt = null;
  }

  #recordFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.config.circuitBreakerFailureThreshold) {
      this.openedAt = this.clock();
    }
  }

  async #request(method, path, body) {
    this.#assertCircuitClosed();
    let lastError;
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt += 1) {
      try {
        const result = await this.#attempt(method, path, body);
        this.#recordSuccess();
        return result;
      } catch (error) {
        lastError = error;
        this.#recordFailure();
        if (attempt < this.config.retryAttempts) {
          await this.wait(this.config.retryBackoffMs);
        }
      }
    }
    throw lastError;
  }

  async #attempt(method, path, body) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.config.baseUrl}${path}`, {
        method,
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new FoundationProviderRequestError("Foundation provider request failed", {
          status: response.status,
          path
        });
      }
      return response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new FoundationProviderRequestError("Foundation provider request timed out", { path, timeoutMs: this.config.timeoutMs });
      }
      if (error instanceof FoundationProviderRequestError) {
        throw error;
      }
      throw new FoundationProviderRequestError("Foundation provider request failed", { path, cause: error.message });
    } finally {
      clearTimeout(timeout);
    }
  }
}
