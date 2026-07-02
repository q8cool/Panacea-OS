import { endpointBaseUrl, type EndpointRecord, flattenEndpoints } from "./apiExplorer";
import type { AppData, AuthSession, HttpMethod, PanaceaWebConfig, RoleId } from "./types";

export type BrowserApiClassification =
  | "ALLOWED_READ"
  | "ALLOWED_LIVE_WRITE"
  | "ALLOWED_OPERATOR_TEST"
  | "ALLOWED_OPERATOR_ACTION"
  | "BLOCKED_WRITE"
  | "BLOCKED_CLINICAL_ACTION"
  | "BLOCKED_ADMIN_DANGEROUS"
  | "SERVER_ONLY"
  | "UNKNOWN";

export interface BrowserApiAllowlistEntry {
  key: string;
  method: HttpMethod;
  path: string;
  url: string;
  documentId: string;
  documentTitle: string;
  summary: string;
  classification: BrowserApiClassification;
  workspaceScopes: RoleId[];
  reason: string;
}

export interface BrowserApiAllowlistDecision {
  allowed: boolean;
  classification: BrowserApiClassification;
  reason: string;
  entry?: BrowserApiAllowlistEntry;
}

const READ_ONLY_RUNTIME_PATHS = ["/live", "/ready", "/metrics", "/docs/openapi.json"];
const CLINICAL_TERMS = [
  "clinical",
  "patient",
  "recommendation",
  "diagnosis",
  "treatment",
  "medication",
  "safety",
  "approval",
  "override",
  "emergency"
];
const ADMIN_DANGEROUS_TERMS = [
  "users",
  "roles",
  "permissions",
  "tenants",
  "configuration",
  "policy",
  "governance",
  "release",
  "patch",
  "hotfix",
  "delete",
  "remove"
];

export function buildBrowserApiAllowlist(data: AppData, config: PanaceaWebConfig): BrowserApiAllowlistEntry[] {
  const openApiEntries = flattenEndpoints(data.openApiDocuments).map((endpoint) => classifyEndpoint(endpoint, config));
  return [
    ...openApiEntries,
    {
      key: "foundation-audit-append-operator-test",
      method: "POST",
      path: "/api/v1/audit-records",
      url: config.FOUNDATION_AUDIT_APPEND_URL,
      documentId: "foundation-provider-runtime-contract",
      documentTitle: "Foundation Provider Runtime Contract",
      summary: "Operator test audit append endpoint",
      classification: "ALLOWED_OPERATOR_TEST",
      workspaceScopes: ["operator"],
      reason: "Allowed only for operator mode with a safe testOnly audit payload and no PHI."
    }
  ];
}

export function evaluateBrowserApiRequest(
  allowlist: BrowserApiAllowlistEntry[],
  method: HttpMethod,
  url: string,
  session: AuthSession | undefined
): BrowserApiAllowlistDecision {
  const normalizedUrl = normalizeUrl(url);
  const entry = allowlist.find((item) => item.method === method && (
    normalizeUrl(item.url) === normalizedUrl ||
    templateUrlMatches(item.url, url)
  ));

  if (!entry) {
    return {
      allowed: false,
      classification: "UNKNOWN",
      reason: "Browser API request is not present in the generated OpenAPI-based allowlist."
    };
  }

  if (entry.classification === "ALLOWED_READ" && method === "GET") {
    return { allowed: true, classification: entry.classification, reason: entry.reason, entry };
  }

  if (entry.classification === "ALLOWED_LIVE_WRITE" && method === "POST") {
    const hasLiveSession = Boolean(session?.token && session.tenantId && session.roles.length > 0);
    return {
      allowed: hasLiveSession,
      classification: entry.classification,
      reason: hasLiveSession ? entry.reason : "Approved live write workflow requires an authenticated Live Mode session with tenant and role claims.",
      entry
    };
  }

  if (entry.classification === "ALLOWED_OPERATOR_TEST") {
    const isOperator = session?.role === "operator";
    return {
      allowed: isOperator,
      classification: entry.classification,
      reason: isOperator ? entry.reason : "Operator-only test endpoint requires an operator role claim.",
      entry
    };
  }

  if (entry.classification === "ALLOWED_OPERATOR_ACTION") {
    const isOperatorOrAdmin = session?.role === "operator" || session?.role === "administrator";
    return {
      allowed: Boolean(isOperatorOrAdmin),
      classification: entry.classification,
      reason: isOperatorOrAdmin ? entry.reason : "Operator/admin-only action requires an operator or administrator role claim.",
      entry
    };
  }

  return {
    allowed: false,
    classification: entry.classification,
    reason: entry.reason,
    entry
  };
}

export function allowlistSummary(entries: BrowserApiAllowlistEntry[]): Record<BrowserApiClassification, number> {
  return entries.reduce<Record<BrowserApiClassification, number>>((summary, entry) => {
    summary[entry.classification] += 1;
    return summary;
  }, {
    ALLOWED_READ: 0,
    ALLOWED_LIVE_WRITE: 0,
    ALLOWED_OPERATOR_TEST: 0,
    ALLOWED_OPERATOR_ACTION: 0,
    BLOCKED_WRITE: 0,
    BLOCKED_CLINICAL_ACTION: 0,
    BLOCKED_ADMIN_DANGEROUS: 0,
    SERVER_ONLY: 0,
    UNKNOWN: 0
  });
}

function classifyEndpoint(endpoint: EndpointRecord, config: PanaceaWebConfig): BrowserApiAllowlistEntry {
  const path = endpoint.path;
  const text = `${endpoint.path} ${endpoint.summary} ${endpoint.operationId} ${endpoint.tags.join(" ")}`.toLowerCase();
  const url = `${baseUrlForEndpoint(endpoint, config)}${path}`;
  const method = endpoint.method;
  const workspaceScopes = workspaceScopesForEndpoint(endpoint);

  if (method === "GET" && READ_ONLY_RUNTIME_PATHS.some((suffix) => path.endsWith(suffix))) {
    return entry(endpoint, url, "ALLOWED_READ", workspaceScopes, "Governed runtime or OpenAPI endpoint generated from the existing OpenAPI contract.");
  }

  if (method === "GET" && path.includes("/read-models/")) {
    return entry(endpoint, url, "ALLOWED_READ", workspaceScopes, "Authenticated browser Live Mode may call versioned backend read-model endpoints only. Responses must be tenant scoped and governed.");
  }

  if (method === "GET" && (path.endsWith("/write-workflows/events") || path.includes("/write-workflows/projections"))) {
    return entry(endpoint, url, "ALLOWED_READ", ["operator", "administrator"], "Authenticated operator/admin Live Mode may review tenant-scoped write events and projection status.");
  }

  if (method === "POST" && path.includes("/write-workflows/projections/") && path.endsWith("/retry")) {
    return entry(endpoint, url, "ALLOWED_OPERATOR_ACTION", ["operator", "administrator"], "Operator/admin Live Mode may retry failed projection tracking records through the backend-safe replay endpoint.");
  }

  if (method === "POST" && path.includes("/write-workflows/")) {
    return entry(endpoint, url, "ALLOWED_LIVE_WRITE", workspaceScopes, "Authenticated browser Live Mode may submit approved Sprint 113 transactional write workflows only. Requests require tenant, role, audit, and workflow control claims.");
  }

  if (method !== "GET" && CLINICAL_TERMS.some((term) => text.includes(term))) {
    return entry(endpoint, url, "BLOCKED_CLINICAL_ACTION", workspaceScopes, "Clinical, safety, recommendation, approval, or patient-affecting action endpoints are blocked in browser Live Mode.");
  }

  if (method !== "GET" && ADMIN_DANGEROUS_TERMS.some((term) => text.includes(term))) {
    return entry(endpoint, url, "BLOCKED_ADMIN_DANGEROUS", workspaceScopes, "Administrative, policy, governance, release, or destructive action endpoints require server-side workflows.");
  }

  if (method !== "GET") {
    return entry(endpoint, url, "BLOCKED_WRITE", workspaceScopes, "Browser Live Mode permits governed actions only; non-GET endpoints are blocked unless explicitly allowlisted.");
  }

  if (text.includes("metrics")) {
    return entry(endpoint, url, "SERVER_ONLY", workspaceScopes, "Metrics may be browser-visible only when deployment policy confirms safe exposure.");
  }

  return entry(endpoint, url, "UNKNOWN", workspaceScopes, "Endpoint did not match a browser-safe governed allowlist rule.");
}

function entry(
  endpoint: EndpointRecord,
  url: string,
  classification: BrowserApiClassification,
  workspaceScopes: RoleId[],
  reason: string
): BrowserApiAllowlistEntry {
  return {
    key: `${endpoint.documentId}:${endpoint.method}:${endpoint.path}`,
    method: endpoint.method,
    path: endpoint.path,
    url,
    documentId: endpoint.documentId,
    documentTitle: endpoint.documentTitle,
    summary: endpoint.summary,
    classification,
    workspaceScopes,
    reason
  };
}

function workspaceScopesForEndpoint(endpoint: EndpointRecord): RoleId[] {
  const text = `${endpoint.documentId} ${endpoint.documentTitle} ${endpoint.path} ${endpoint.summary}`.toLowerCase();
  const scopes = new Set<RoleId>();
  if (text.includes("workforce") || text.includes("command")) scopes.add("administrator");
  if (text.includes("privacy") || text.includes("consent")) scopes.add("patient");
  if (text.includes("clinical") || text.includes("intelligence")) scopes.add("doctor");
  if (text.includes("legal") || text.includes("compliance") || text.includes("product") || text.includes("customer")) scopes.add("operator");
  if (text.includes("assurance") || text.includes("ai")) scopes.add("operator");
  if (scopes.size === 0) scopes.add("operator");
  return [...scopes];
}

function baseUrlForEndpoint(endpoint: EndpointRecord, config: PanaceaWebConfig): string {
  return config.PANACEA_API_BASE_URL || config.PANACEA_API_PUBLIC_BASE_URL || endpointBaseUrl(endpoint);
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return url.trim().split("?")[0].replace(/\/+$/, "");
  }
}

function templateUrlMatches(templateUrl: string, actualUrl: string): boolean {
  let template;
  let actual;
  try {
    template = new URL(templateUrl);
    actual = new URL(actualUrl);
  } catch {
    return false;
  }
  if (template.origin !== actual.origin) return false;
  const templateSegments = template.pathname.split("/").filter(Boolean).map((segment) => decodeURIComponent(segment));
  const actualSegments = actual.pathname.split("/").filter(Boolean);
  if (templateSegments.length !== actualSegments.length) return false;
  return templateSegments.every((segment, index) => (
    /^\{[^}]+\}$/.test(segment) || segment === actualSegments[index]
  ));
}
