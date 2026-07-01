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
const GLOBAL_COMMAND_API_BASE = "/api/v4/global-command-intelligence";

const roleReadModelPaths: Record<string, Record<string, string>> = {
  doctor: {
    dashboard: `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients`,
    "patient-search": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients`,
    "patient-profile": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}`,
    "clinical-timeline": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/timeline`,
    encounters: `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/encounters`,
    allergies: `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/allergies`,
    conditions: `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/conditions`,
    medications: `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/medications`,
    "vital-signs": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/vitals`,
    "clinical-notes": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/notes`,
    "orders-overview": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/orders`,
    "lab-results": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/labs`,
    "radiology-reports": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/radiology`,
    "pharmacy-review": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/pharmacy-review`,
    "ai-recommendations": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/summary`,
    "clinical-alerts": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/alerts`,
    "task-list": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/tasks`,
    "care-team": `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/{patientId}/care-team`
  },
  patient: {
    dashboard: `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me`,
    profile: `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me`,
    appointments: `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/appointments`,
    "visit-history": `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/visits`,
    medications: `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/medications`,
    allergies: `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/allergies`,
    "lab-results": `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/labs`,
    "radiology-reports": `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/radiology`,
    "clinical-documents": `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/documents`,
    "secure-messages": `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/messages`,
    telemedicine: `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/messages`,
    "invoices-payments": `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/invoices`,
    notifications: `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/messages`,
    "care-instructions": `${GLOBAL_COMMAND_API_BASE}/read-models/patient-portal/me/care-instructions`
  },
  laboratory: {
    dashboard: `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/dashboard`,
    "lab-orders": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/orders`,
    "specimen-tracking": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/specimens`,
    "specimen-collection": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/specimens`,
    "specimen-receiving": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/specimens`,
    "result-entry": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/results`,
    "result-validation": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/results`,
    "result-approval": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/results`,
    "critical-results": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/critical-results`,
    "quality-control": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/quality-control`,
    "lab-analytics": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/dashboard`,
    "lab-reports": `${GLOBAL_COMMAND_API_BASE}/read-models/laboratory/reports`
  },
  radiology: {
    dashboard: `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/dashboard`,
    "imaging-orders": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/orders`,
    "study-list": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/studies`,
    "dicom-metadata": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/studies/{studyId}/dicom-metadata`,
    "pacs-status": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/pacs/status`,
    "reporting-worklist": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/reporting-worklist`,
    "report-editor": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/reports`,
    "report-approval": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/reports`,
    "critical-findings": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/critical-findings`,
    "imaging-timeline": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/timeline`,
    "radiology-analytics": `${GLOBAL_COMMAND_API_BASE}/read-models/radiology/dashboard`
  },
  pharmacy: {
    dashboard: `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/dashboard`,
    "medication-catalog": `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/medications`,
    "prescription-queue": `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/prescriptions`,
    "prescription-review": `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/prescriptions`,
    dispensing: `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/dispensing`,
    "med-admin-overview": `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/dispensing`,
    inventory: `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/inventory`,
    "batch-lot-tracking": `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/batches`,
    "expiration-tracking": `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/expiration-warnings`,
    "drug-safety-alerts": `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/safety-alerts`,
    "controlled-medications": `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/controlled-medications`,
    "pharmacy-reports": `${GLOBAL_COMMAND_API_BASE}/read-models/pharmacy/dashboard`
  },
  administrator: {
    dashboard: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/system-health`,
    users: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/users`,
    roles: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/roles`,
    permissions: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/permissions`,
    tenants: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/tenants`,
    organizations: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/organizations`,
    facilities: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/facilities`,
    departments: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/departments`,
    configuration: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/configuration`,
    "audit-logs": `${GLOBAL_COMMAND_API_BASE}/read-models/admin/audit-logs`,
    security: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/security`,
    privacy: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/privacy`,
    compliance: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/compliance`,
    "release-evidence": `${GLOBAL_COMMAND_API_BASE}/read-models/admin/release-evidence`,
    "system-health": `${GLOBAL_COMMAND_API_BASE}/read-models/admin/system-health`,
    "api-explorer": `${GLOBAL_COMMAND_API_BASE}/read-models/admin/system-health`,
    documentation: `${GLOBAL_COMMAND_API_BASE}/read-models/admin/release-evidence`
  }
};

const roleWriteWorkflowPaths: Record<string, Record<string, string>> = {
  doctor: {
    dashboard: `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients`,
    "patient-search": `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients`,
    "patient-profile": `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients/{patientId}`,
    encounters: `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients/{patientId}/encounters`,
    "clinical-notes": `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients/{patientId}/notes`,
    allergies: `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients/{patientId}/allergies`,
    conditions: `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients/{patientId}/conditions`,
    medications: `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients/{patientId}/medications`,
    "vital-signs": `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients/{patientId}/vitals`,
    "care-team": `${GLOBAL_COMMAND_API_BASE}/write-workflows/clinical/patients/{patientId}/care-team`,
    "orders-overview": `${GLOBAL_COMMAND_API_BASE}/write-workflows/scheduling/appointments`
  },
  patient: {
    appointments: `${GLOBAL_COMMAND_API_BASE}/write-workflows/patient-portal/appointment-requests`,
    "secure-messages": `${GLOBAL_COMMAND_API_BASE}/write-workflows/patient-portal/messages`,
    medications: `${GLOBAL_COMMAND_API_BASE}/write-workflows/patient-portal/refill-requests`,
    "clinical-documents": `${GLOBAL_COMMAND_API_BASE}/write-workflows/patient-portal/medical-report-requests`,
    notifications: `${GLOBAL_COMMAND_API_BASE}/write-workflows/patient-portal/preferences`,
    profile: `${GLOBAL_COMMAND_API_BASE}/write-workflows/patient-portal/preferences`
  },
  laboratory: {
    "lab-orders": `${GLOBAL_COMMAND_API_BASE}/write-workflows/laboratory/orders`,
    "specimen-collection": `${GLOBAL_COMMAND_API_BASE}/write-workflows/laboratory/specimens/{specimenId}/collect`,
    "specimen-receiving": `${GLOBAL_COMMAND_API_BASE}/write-workflows/laboratory/specimens/{specimenId}/receive`,
    "result-entry": `${GLOBAL_COMMAND_API_BASE}/write-workflows/laboratory/results`,
    "result-validation": `${GLOBAL_COMMAND_API_BASE}/write-workflows/laboratory/results/{resultId}/validate`,
    "result-approval": `${GLOBAL_COMMAND_API_BASE}/write-workflows/laboratory/results/{resultId}/approve`,
    "critical-results": `${GLOBAL_COMMAND_API_BASE}/write-workflows/laboratory/results/{resultId}/critical`
  },
  radiology: {
    "imaging-orders": `${GLOBAL_COMMAND_API_BASE}/write-workflows/radiology/orders`,
    "study-list": `${GLOBAL_COMMAND_API_BASE}/write-workflows/radiology/studies/{studyId}/start`,
    "reporting-worklist": `${GLOBAL_COMMAND_API_BASE}/write-workflows/radiology/studies/{studyId}/complete`,
    "report-editor": `${GLOBAL_COMMAND_API_BASE}/write-workflows/radiology/reports`,
    "report-approval": `${GLOBAL_COMMAND_API_BASE}/write-workflows/radiology/reports/{reportId}/approve`,
    "critical-findings": `${GLOBAL_COMMAND_API_BASE}/write-workflows/radiology/reports/{reportId}/critical-findings`
  },
  pharmacy: {
    "prescription-queue": `${GLOBAL_COMMAND_API_BASE}/write-workflows/pharmacy/prescriptions`,
    "prescription-review": `${GLOBAL_COMMAND_API_BASE}/write-workflows/pharmacy/prescriptions/{prescriptionId}/review`,
    "drug-safety-alerts": `${GLOBAL_COMMAND_API_BASE}/write-workflows/pharmacy/safety-alerts`,
    dispensing: `${GLOBAL_COMMAND_API_BASE}/write-workflows/pharmacy/prescriptions/{prescriptionId}/dispense`,
    inventory: `${GLOBAL_COMMAND_API_BASE}/write-workflows/pharmacy/inventory`,
    "med-admin-overview": `${GLOBAL_COMMAND_API_BASE}/write-workflows/pharmacy/prescriptions/{prescriptionId}/validate`
  },
  administrator: {
    users: `${GLOBAL_COMMAND_API_BASE}/write-workflows/admin/users`,
    roles: `${GLOBAL_COMMAND_API_BASE}/write-workflows/admin/roles`,
    tenants: `${GLOBAL_COMMAND_API_BASE}/write-workflows/admin/tenants`,
    organizations: `${GLOBAL_COMMAND_API_BASE}/write-workflows/admin/organizations`,
    departments: `${GLOBAL_COMMAND_API_BASE}/write-workflows/admin/departments`,
    configuration: `${GLOBAL_COMMAND_API_BASE}/write-workflows/admin/configuration`
  }
};

export function requestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function findReadOnlyEndpoint(
  data: AppData,
  workspace: RoleWorkspaceDefinition,
  page: RolePageDefinition,
  config: PanaceaWebConfig,
  route = page.route
): LiveApiEndpointCandidate {
  const allowlist = buildBrowserApiAllowlist(data, config);
  const readModelPath = readModelPathForWorkspacePage(workspace.id, page.id);
  if (readModelPath) {
    const selected = flattenEndpoints(data.openApiDocuments).find((endpoint) => endpoint.method === "GET" && endpoint.path === readModelPath);
    if (!selected) {
      return {
        label: `${workspace.label} ${page.label}`,
        method: "GET",
        url: "",
        source: "No matching live read-model OpenAPI endpoint",
        available: false,
        reason: "Live API unavailable. The role workspace is mapped to a backend read model, but the OpenAPI contract is missing that endpoint."
      };
    }
    const resolvedPath = resolveReadModelPath(readModelPath, route);
    const url = `${baseUrlForEndpoint(selected, config)}${resolvedPath}`;
    return {
      label: `${selected.documentTitle}: ${selected.summary}`,
      method: selected.method,
      url,
      source: selected.documentPath,
      available: evaluateBrowserApiRequest(allowlist, selected.method, url, undefined).allowed,
      reason: "Live backend read-model endpoint selected from the OpenAPI contract."
    };
  }
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

export function findWriteWorkflowEndpoint(
  data: AppData,
  workspace: RoleWorkspaceDefinition,
  page: RolePageDefinition,
  config: PanaceaWebConfig,
  route = page.route
): LiveApiEndpointCandidate {
  const allowlist = buildBrowserApiAllowlist(data, config);
  const writeWorkflowPath = writeWorkflowPathForWorkspacePage(workspace.id, page.id);
  if (!writeWorkflowPath) {
    return {
      label: `${workspace.label} ${page.label}`,
      method: "POST",
      url: "",
      source: "No approved Sprint 113 write workflow for this page",
      available: false,
      reason: "This workspace page remains read-only. Sprint 113 exposes writes only for explicitly approved transactional workflows."
    };
  }
  const selected = flattenEndpoints(data.openApiDocuments).find((endpoint) => endpoint.method === "POST" && endpoint.path === writeWorkflowPath);
  if (!selected) {
    return {
      label: `${workspace.label} ${page.label}`,
      method: "POST",
      url: "",
      source: "No matching live write workflow OpenAPI endpoint",
      available: false,
      reason: "Live write workflow unavailable. The role workspace is mapped to an approved write path, but OpenAPI does not expose it yet."
    };
  }
  const resolvedPath = resolveWorkflowPath(writeWorkflowPath, route);
  const url = `${baseUrlForEndpoint(selected, config)}${resolvedPath}`;
  return {
    label: `${selected.documentTitle}: ${selected.summary}`,
    method: selected.method,
    url,
    source: selected.documentPath,
    available: evaluateBrowserApiRequest(allowlist, selected.method, url, undefined).classification === "ALLOWED_LIVE_WRITE",
    reason: "Approved live transactional write workflow selected from the OpenAPI contract."
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

export async function executeWriteWorkflowRequest(
  candidate: LiveApiEndpointCandidate,
  session: AuthSession,
  config: PanaceaWebConfig,
  allowlist: BrowserApiAllowlistEntry[],
  body: unknown,
  fetchImpl: typeof fetch = fetch
): Promise<{ result: LiveApiResult; auditAction: BrowserAuditAction }> {
  if (!candidate.available || !candidate.url) {
    const result = unavailableResult(candidate);
    return { result, auditAction: auditFromResult(result, session, "live") };
  }

  const result = await apiRequest(candidate.method, candidate.url, session, config, body, fetchImpl, allowlist);
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
      "X-Roles": session.roles.join(","),
      "X-Permissions": session.permissions.join(","),
      "X-Country-Codes": "KW",
      "X-Region-Codes": "GCC",
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
    const jsonBody = parseJsonBody(text);
    return {
      requestId: id,
      method,
      url,
      state: stateFromStatus(response.status),
      httpStatus: response.status,
      detail: detailFromStatus(response.status),
      checkedAt: new Date().toISOString(),
      durationMs,
      bodyPreview: previewBody(text),
      jsonBody
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

function readModelPathForWorkspacePage(workspaceId: string, pageId: string): string | undefined {
  return roleReadModelPaths[workspaceId]?.[pageId];
}

function resolveReadModelPath(templatePath: string, route: string): string {
  return resolveWorkflowPath(templatePath, route);
}

function writeWorkflowPathForWorkspacePage(workspaceId: string, pageId: string): string | undefined {
  return roleWriteWorkflowPaths[workspaceId]?.[pageId];
}

function resolveWorkflowPath(templatePath: string, route: string): string {
  const routeSubject = route.split("/")[4];
  return templatePath
    .replaceAll("{patientId}", encodeURIComponent(routeSubject || "current-patient"))
    .replaceAll("{studyId}", encodeURIComponent(routeSubject || "current-study"))
    .replaceAll("{specimenId}", encodeURIComponent(routeSubject || "current-specimen"))
    .replaceAll("{prescriptionId}", encodeURIComponent(routeSubject || "current-prescription"))
    .replaceAll("{resultId}", encodeURIComponent(routeSubject || "current-result"))
    .replaceAll("{reportId}", encodeURIComponent(routeSubject || "current-report"))
    .replaceAll("{appointmentId}", encodeURIComponent(routeSubject || "current-appointment"))
    .replaceAll("{userId}", encodeURIComponent(routeSubject || "current-user"));
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

function parseJsonBody(body: string): unknown {
  const trimmed = body.trim();
  if (!trimmed) return undefined;
  try {
    return JSON.parse(trimmed);
  } catch {
    return undefined;
  }
}
