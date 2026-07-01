export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  summary: string;
  operationId: string;
  tags: string[];
  requestSchema: string;
  responseCodes: string[];
  authRequired: boolean;
}

export interface OpenApiDocument {
  id: string;
  title: string;
  version: string;
  relativePath: string;
  pathCount: number;
  endpointCount: number;
  endpoints: ApiEndpoint[];
  validationStatus: string;
  versionedEndpoints: boolean;
}

export interface ServiceRecord {
  id: string;
  name: string;
  title: string;
  description: string;
  version: string;
  apiBase: string;
  localPort: string;
  healthUrl: string;
  readinessUrl: string;
  metricsUrl: string;
  openApiUrl: string;
  pathCount: number;
  endpointCount: number;
  hasOpenApi: boolean;
  hasMigration: boolean;
  migrations: string[];
  hasDocker: boolean;
  hasKubernetes: boolean;
  testFiles: number;
  runtimeStatus: string;
  userVisible: string;
}

export interface MarkdownDocument {
  id: string;
  title: string;
  relativePath: string;
  group: string;
  excerpt: string;
  body: string;
}

export interface ReleaseEvidence {
  title: string;
  relativePath: string;
  status: string;
  excerpt: string;
  body: string;
}

export interface AppData {
  generatedAt: string;
  repository: {
    name: string;
    company: string;
    founder: string;
    root: string;
    branch: string;
    commit: string;
    packageVersion: string;
  };
  release: {
    version: string;
    status: string;
    foundationProvider: string;
    ciStatus: string;
    runtimeStatus: string;
    disasterRecoveryStatus: string;
    securityScanStatus: string;
    finalCommit: string;
    tags: string[];
    readinessScore: number;
  };
  validation: {
    check: string;
    openapi: string;
    tests: string;
    latestRemoteCi: string;
  };
  foundation: {
    baseUrl: string;
    healthUrl: string;
    readinessUrl: string;
    metricsUrl: string;
    jwksUrl: string;
    auditAppendUrl: string;
    policyUrl: string;
    documentedStatus: string;
  };
  services: ServiceRecord[];
  openApiDocuments: OpenApiDocument[];
  documents: MarkdownDocument[];
  releaseEvidence: ReleaseEvidence[];
}

export interface ModuleVisibility {
  id: string;
  title: string;
  category: string;
  status: "Active API" | "Evidence-backed" | "Documentation-backed" | "Not active runtime";
  summary: string;
  route: string;
  serviceId?: string;
  docHints: string[];
  hasUi: boolean;
  hasApi: boolean;
  hasOpenApi: boolean;
  hasDatabaseMigration: boolean;
  hasDockerRuntime: boolean;
  hasTests: boolean;
  userVisible: boolean;
}

export interface NavItem {
  label: string;
  route: string;
  icon: string;
  keywords: string[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export type RoleId = "operator" | "doctor" | "patient" | "laboratory" | "radiology" | "pharmacy" | "administrator";

export type DataMode = "demo" | "live";

export type AuthMode = "provider-login" | "operator-jwt";

export type ConnectionState = "online" | "degraded" | "offline" | "unauthorized" | "unavailable";

export interface PanaceaWebConfig {
  FOUNDATION_BASE_URL: string;
  FOUNDATION_HEALTH_URL: string;
  FOUNDATION_READY_URL: string;
  FOUNDATION_METRICS_URL: string;
  FOUNDATION_JWKS_URL: string;
  FOUNDATION_JWT_ISSUER: string;
  FOUNDATION_AUDIT_APPEND_URL: string;
  FOUNDATION_POLICY_URL: string;
  PANACEA_API_BASE_URL: string;
  PANACEA_WEB_MODE: DataMode;
  PANACEA_DEFAULT_TENANT: string;
  PANACEA_ENABLE_DEMO_MODE: boolean;
  PANACEA_REQUEST_TIMEOUT_MS: number;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  tokenType?: "Bearer";
  authMode?: AuthMode;
  subject: string;
  displayName: string;
  issuer: string;
  tenantId: string;
  role: RoleId;
  roles: string[];
  permissions: string[];
  expiresAt: string;
  issuedAt?: string;
  authenticatedAt: string;
  tokenHeader: {
    alg: string;
    kid?: string;
  };
}

export interface TokenValidationResult {
  ok: boolean;
  session?: AuthSession;
  error?: string;
  warnings: string[];
}

export interface RuntimeEndpointStatus {
  label: string;
  url: string;
  state: ConnectionState;
  httpStatus?: number;
  detail: string;
  checkedAt: string;
  durationMs?: number;
}

export interface BrowserAuditAction {
  user: string;
  role: RoleId;
  tenant: string;
  requestId: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: string;
  mode: DataMode;
}

export interface LiveApiResult {
  requestId: string;
  method: HttpMethod;
  url: string;
  state: ConnectionState;
  httpStatus?: number;
  detail: string;
  checkedAt: string;
  durationMs?: number;
  bodyPreview?: string;
  jsonBody?: unknown;
  blockedReason?: string;
  allowlistClassification?: string;
}

export interface LiveApiEndpointCandidate {
  label: string;
  method: HttpMethod;
  url: string;
  source: string;
  available: boolean;
  reason: string;
}

export interface LiveWorkspaceState {
  endpoint: LiveApiEndpointCandidate;
  result?: LiveApiResult;
  auditAction?: BrowserAuditAction;
}

export interface LiveStatusState {
  foundation: RuntimeEndpointStatus[];
  services: RuntimeEndpointStatus[];
  checkedAt?: string;
}

export interface RoleMetric {
  label: string;
  value: string;
  detail: string;
  tone: "success" | "warn" | "info";
}

export interface RoleTable {
  columns: string[];
  rows: string[][];
}

export interface RolePanel {
  title: string;
  detail: string;
  status: "Available" | "Documentation-backed" | "Live data unavailable" | "Action required";
}

export interface RolePageDefinition {
  id: string;
  label: string;
  icon: string;
  description: string;
  route: string;
  source: string;
  metrics: RoleMetric[];
  workflow: string[];
  table: RoleTable;
  panels: RolePanel[];
  chart: RoleMetric[];
  safetyNote: string;
}

export interface RoleWorkspaceDefinition {
  id: RoleId;
  label: string;
  title: string;
  icon: string;
  route: string;
  audience: string;
  summary: string;
  boundary: string;
  dataMode: string;
  serviceIds: string[];
  docHints: string[];
  pages: RolePageDefinition[];
}
