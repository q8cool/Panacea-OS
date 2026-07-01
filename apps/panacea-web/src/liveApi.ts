import { endpointBaseUrl, type EndpointRecord, flattenEndpoints } from "./apiExplorer";
import { buildBrowserApiAllowlist, evaluateBrowserApiRequest, type BrowserApiAllowlistEntry } from "./apiAllowlist";
import type {
  AppData,
  AuthSession,
  BrowserAuditAction,
  ConnectionState,
  HttpMethod,
  LiveApiEndpointCandidate,
  LiveApiResult,
  LiveStatusState,
  PanaceaWebConfig,
  RolePageDefinition,
  RoleWorkspaceDefinition,
  RuntimeEndpointStatus
} from "./types";

const SAFE_RETRY_METHODS = new Set<HttpMethod>(["GET"]);

export function requestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function findReadOnlyEndpoint(
  data: AppData,
  workspace: RoleWorkspaceDefinition,
  page: RolePageDefinition,
  config: PanaceaWebConfig
): LiveApiEndpointCandidate {
  const allowlist = buildBrowserApiAllowlist(data, config);
  const keywords = [
    page.label,
    page.id.replace(/-/g, " "),
    page.source,
    ...workspace.docHints,
    workspace.label
  ].map((item) => item.toLowerCase());

  const serviceIds = new Set(workspace.serviceIds);
  const endpoints = flattenEndpoints(data.openApiDocuments)
    .filter((endpoint) => endpoint.method === "GET")
    .filter((endpoint) => {
      const serviceMatch = [...serviceIds].some((serviceId) => endpoint.documentId.includes(serviceId));
      const haystack = `${endpoint.documentTitle} ${endpoint.path} ${endpoint.summary} ${endpoint.operationId} ${endpoint.tags.join(" ")}`.toLowerCase();
      return serviceMatch || keywords.some((keyword) => keyword && haystack.includes(keyword));
    })
    .filter((endpoint) => {
      const url = `${baseUrlForEndpoint(endpoint, config)}${endpoint.path}`;
      return evaluateBrowserApiRequest(allowlist, endpoint.method, url, undefined).allowed;
    });

  const selected = endpoints.find((endpoint) => endpoint.path.includes("/api/")) ?? endpoints[0];
  if (!selected) {
    return {
      label: `${workspace.label} ${page.label}`,
      method: "GET",
      url: "",
      source: "No matching read-only OpenAPI endpoint",
      available: false,
      reason: "Live API unavailable. Review the OpenAPI contract; no read-only endpoint is exposed for this workspace page."
    };
  }

  return {
    label: `${selected.documentTitle}: ${selected.summary}`,
    method: selected.method,
    url: `${baseUrlForEndpoint(selected, config)}${selected.path}`,
    source: selected.documentPath,
    available: true,
    reason: "Read-only endpoint selected from the OpenAPI contract."
  };
}

export async function executeReadOnlyRequest(
  candidate: LiveApiEndpointCandidate,
  session: AuthSession,
  config: PanaceaWebConfig,
  allowlist: BrowserApiAllowlistEntry[],
  fetchImpl: typeof fetch = fetch
): Promise<{ result: LiveApiResult; auditAction: BrowserAuditAction }> {
  if (!candidate.available || !candidate.url) {
    const result = unavailableResult(candidate);
    return { result, auditAction: auditFromResult(result, session, "live") };
  }

  const result = await apiRequest(candidate.method, candidate.url, session, config, undefined, fetchImpl, allowlist);
  return { result, auditAction: auditFromResult(result, session, "live") };
}

export async function apiRequest(
  method: HttpMethod,
  url: string,
  session: AuthSession,
  config: PanaceaWebConfig,
  body?: unknown,
  fetchImpl: typeof fetch = fetch,
  allowlist: BrowserApiAllowlistEntry[] = []
): Promise<LiveApiResult> {
  const started = performance.now();
  const id = requestId();
  const decision = evaluateBrowserApiRequest(allowlist, method, url, session);
  if (!decision.allowed) {
    return {
      requestId: id,
      method,
      url,
      state: "unavailable",
      detail: "Browser API request blocked by allowlist.",
      checkedAt: new Date().toISOString(),
      blockedReason: decision.reason,
      allowlistClassification: decision.classification
    };
  }
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), config.PANACEA_REQUEST_TIMEOUT_MS);
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${session.token}`,
    "X-Tenant-Id": session.tenantId,
    "X-User-Id": session.subject,
    "X-Actor-Id": session.subject,
    "X-Request-Id": id,
    "X-Correlation-Id": id
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  try {
    const response = await fetchWithSafeRetry(fetchImpl, url, {
      method,
      mode: "cors",
      cache: "no-store",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });
    window.clearTimeout(timeout);
    const durationMs = Math.round(performance.now() - started);
    const text = await response.text();
    return {
      requestId: id,
      method,
      url,
      state: stateFromStatus(response.status),
      httpStatus: response.status,
      detail: detailFromStatus(response.status),
      checkedAt: new Date().toISOString(),
      durationMs,
      bodyPreview: previewBody(text)
    };
  } catch (error) {
    window.clearTimeout(timeout);
    return {
      requestId: id,
      method,
      url,
      state: "unavailable",
      detail: error instanceof Error ? error.message : "Live API unavailable",
      checkedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - started)
    };
  }
}

export async function pollRuntimeStatus(
  data: AppData,
  config: PanaceaWebConfig,
  session: AuthSession | undefined,
  fetchImpl: typeof fetch = fetch
): Promise<LiveStatusState> {
  const foundationTargets = [
    { label: "Foundation Health", url: config.FOUNDATION_HEALTH_URL },
    { label: "Foundation Readiness", url: config.FOUNDATION_READY_URL },
    { label: "Foundation Metrics", url: config.FOUNDATION_METRICS_URL },
    { label: "Foundation JWKS", url: config.FOUNDATION_JWKS_URL }
  ];
  const serviceTargets = data.services.flatMap((service) => [
    { label: `${service.title} health`, url: service.healthUrl },
    { label: `${service.title} readiness`, url: service.readinessUrl },
    { label: `${service.title} OpenAPI`, url: service.openApiUrl }
  ]);

  const headers = session
    ? { Authorization: `Bearer ${session.token}`, "X-Tenant-Id": session.tenantId }
    : undefined;

  const [foundation, services] = await Promise.all([
    Promise.all(foundationTargets.map((target) => probeEndpoint(target.label, target.url, config.PANACEA_REQUEST_TIMEOUT_MS, headers, fetchImpl))),
    Promise.all(serviceTargets.map((target) => probeEndpoint(target.label, target.url, config.PANACEA_REQUEST_TIMEOUT_MS, headers, fetchImpl)))
  ]);

  return { foundation, services, checkedAt: new Date().toISOString() };
}

export async function appendOperatorAuditTest(
  session: AuthSession,
  config: PanaceaWebConfig,
  allowlist: BrowserApiAllowlistEntry[],
  fetchImpl: typeof fetch = fetch
): Promise<LiveApiResult> {
  const event = {
    testOnly: true,
    source: "panacea-web-live-mode",
    actor: session.subject,
    role: session.role,
    tenantId: session.tenantId,
    action: "browser.readiness.audit-test",
    occurredAt: new Date().toISOString()
  };
  return apiRequest("POST", config.FOUNDATION_AUDIT_APPEND_URL, session, config, event, fetchImpl, allowlist);
}

async function probeEndpoint(
  label: string,
  url: string,
  timeoutMs: number,
  headers: Record<string, string> | undefined,
  fetchImpl: typeof fetch
): Promise<RuntimeEndpointStatus> {
  const started = performance.now();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      headers,
      signal: controller.signal
    });
    window.clearTimeout(timeout);
    return {
      label,
      url,
      state: stateFromStatus(response.status),
      httpStatus: response.status,
      detail: detailFromStatus(response.status),
      checkedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - started)
    };
  } catch (error) {
    window.clearTimeout(timeout);
    return {
      label,
      url,
      state: "unavailable",
      detail: error instanceof Error ? error.message : "Endpoint unavailable from browser",
      checkedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - started)
    };
  }
}

async function fetchWithSafeRetry(fetchImpl: typeof fetch, url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetchImpl(url, init);
  } catch (error) {
    if (!SAFE_RETRY_METHODS.has((init.method ?? "GET") as HttpMethod)) throw error;
    return fetchImpl(url, init);
  }
}

function unavailableResult(candidate: LiveApiEndpointCandidate): LiveApiResult {
  return {
    requestId: requestId(),
    method: candidate.method,
    url: candidate.url || candidate.label,
    state: "unavailable",
    detail: candidate.reason,
    checkedAt: new Date().toISOString()
  };
}

function auditFromResult(result: LiveApiResult, session: AuthSession, mode: "live"): BrowserAuditAction {
  return {
    user: session.displayName,
    role: session.role,
    tenant: session.tenantId,
    requestId: result.requestId,
    timestamp: result.checkedAt,
    endpoint: result.url,
    method: result.method,
    status: result.httpStatus ? `HTTP ${result.httpStatus}` : result.state,
    mode
  };
}

function baseUrlForEndpoint(endpoint: EndpointRecord, config: PanaceaWebConfig): string {
  if (config.PANACEA_API_BASE_URL && config.PANACEA_API_BASE_URL !== "http://localhost") {
    return config.PANACEA_API_BASE_URL;
  }
  return endpointBaseUrl(endpoint);
}

function stateFromStatus(status: number): ConnectionState {
  if (status === 401) return "unauthorized";
  if (status === 403) return "unauthorized";
  if (status === 404) return "unavailable";
  if (status >= 200 && status < 300) return "online";
  if (status >= 500) return "offline";
  return "degraded";
}

function detailFromStatus(status: number): string {
  if (status === 401) return "Unauthorized. Check token and issuer.";
  if (status === 403) return "Forbidden. Check role, tenant, or permission claims.";
  if (status === 404) return "Endpoint not found.";
  if (status >= 200 && status < 300) return "Request completed.";
  if (status >= 500) return "Service error.";
  return `HTTP ${status}`;
}

function previewBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return "";
  return trimmed.length > 800 ? `${trimmed.slice(0, 800)}...` : trimmed;
}
