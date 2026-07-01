import { marked } from "marked";
import type { BrowserApiClassification } from "./apiAllowlist";
import { activeServiceModules, allModules, clinicalModules, enterpriseDocModules, innovationModules, navSections, searchNav } from "./catalog";
import type { ProviderLoginDiscoveryResult } from "./foundationLoginDiscovery";
import { buildCurl, filterEndpoints, flattenEndpoints, summarizeOpenApi, type EndpointRecord } from "./apiExplorer";
import { isRoleRoute, renderRoleWorkspace, rolePageTitle } from "./roleRender";
import { roleFromRoute, roleSwitcherOptions } from "./roleWorkspaces";
import { isSessionExpired, tokenSecondsRemaining } from "./auth";
import { buildWebConfig, missingLiveConfig } from "./webConfig";
import type {
  AppData,
  AuthSession,
  BrowserAuditAction,
  LiveApiResult,
  LiveStatusState,
  LiveWorkspaceState,
  MarkdownDocument,
  ModuleVisibility,
  PanaceaWebConfig,
  ReleaseEvidence,
  RoleId,
  ServiceRecord,
  TokenValidationResult
} from "./types";
import type { FoundationProbeResult } from "./foundation";

marked.use({ gfm: true, async: false });

export interface RenderState {
  globalSearch: string;
  apiQuery: string;
  apiMethod: string;
  apiDocumentId: string;
  selectedEndpointKey: string;
  selectedDocumentId: string;
  foundationProbe?: FoundationProbeResult;
  theme: "light" | "dark";
  language: "en" | "ar";
  selectedRole: RoleId;
  webConfig?: PanaceaWebConfig;
  authSession?: AuthSession;
  authError?: string;
  authValidation?: TokenValidationResult;
  liveStatus?: LiveStatusState;
  liveWorkspaceState?: LiveWorkspaceState;
  auditAppendResult?: LiveApiResult;
  lastAuditAction?: BrowserAuditAction;
  providerLoginDiscovery?: ProviderLoginDiscoveryResult;
  apiAllowlistSummary?: Record<BrowserApiClassification, number>;
  providerAuthStatus?: string;
}

export const initialState: RenderState = {
  globalSearch: "",
  apiQuery: "",
  apiMethod: "ALL",
  apiDocumentId: "ALL",
  selectedEndpointKey: "",
  selectedDocumentId: "",
  theme: "light",
  language: "en",
  selectedRole: "operator"
};

export function renderApp(data: AppData, route: string, state: RenderState): string {
  return `
    <div class="app-shell" data-theme="${state.theme}" dir="${state.language === "ar" ? "rtl" : "ltr"}">
      ${renderSidebar(route)}
      <main class="main-panel">
        ${renderTopbar(data, route, state)}
        <section id="page-root" class="page-root" aria-live="polite">
          ${renderRoute(data, route, state)}
        </section>
      </main>
    </div>
  `;
}

export function renderRoute(data: AppData, route: string, state: RenderState = initialState): string {
  if (route === "/auth/login") return renderAuthPage(data, state);
  if (route === "/command/live-status") return renderLiveStatusPage(data, state);
  if (isRoleRoute(route)) return renderRoleWorkspace(data, route, {
    mode: state.authSession ? "live" : "demo",
    session: state.authSession,
    workspaceState: state.liveWorkspaceState
  });
  if (route === "/command/system-health") return renderSystemHealth(data);
  if (route === "/command/global-command") return renderModuleDetailPage(data, "real-time-global-healthcare-command-intelligence-platform");
  if (route === "/command/foundation-provider") return renderFoundationProvider(data, state.foundationProbe);
  if (route === "/clinical/modules") return renderModuleGroupPage("Clinical Modules", "Care platform coverage is shown honestly: active web visibility, active APIs, or documentation-backed legacy coverage.", clinicalModules, data);
  if (route === "/clinical/patient-experience") return renderFilteredDocsPage(data, "Patient Experience", ["Patient_Experience", "Patient Portal", "Caregiver", "patient"]);
  if (route === "/clinical/education") return renderFilteredDocsPage(data, "Education & Training", ["Education", "Training", "Certification", "CME"]);
  if (route === "/enterprise/modules") return renderModuleGroupPage("Enterprise Modules", "Enterprise v4.0 combines active governance APIs with documentation-backed operational platforms.", [...activeServiceModules.filter((module) => module.category === "Enterprise" || module.category === "Compliance" || module.category === "Security and Privacy"), ...enterpriseDocModules], data);
  if (route === "/enterprise/workforce") return renderModuleDetailPage(data, "global-workforce-hr-credentialing-staff-experience-platform");
  if (route === "/enterprise/legal-governance") return renderModuleDetailPage(data, "global-legal-contracting-risk-governance-platform");
  if (route === "/enterprise/compliance-privacy") return renderModuleGroupPage("Compliance & Privacy", "Regulatory, privacy, consent, trust, audit, and policy controls available through active APIs.", activeServiceModules.filter((module) => ["Compliance", "Security and Privacy"].includes(module.category)), data);
  if (route === "/enterprise/customer-success") return renderModuleDetailPage(data, "global-customer-success-support-service-management-platform");
  if (route === "/enterprise/product-management") return renderModuleDetailPage(data, "global-product-management-roadmap-innovation-portfolio-platform");
  if (route === "/intelligence/ai-governance") return renderModuleDetailPage(data, "global-ai-assurance-safety-model-risk-management-platform");
  if (route === "/intelligence/autonomous-foundation") return renderModuleDetailPage(data, "autonomous-healthcare-intelligence-foundation");
  if (route === "/intelligence/innovations") return renderInnovationPage(data);
  if (route === "/developer/api-explorer") return renderApiExplorer(data, state);
  if (route === "/developer/documentation") return renderDocumentationCenter(data, state);
  if (route === "/developer/demo-mode") return renderDemoMode(data);
  if (route === "/evidence/release") return renderReleaseEvidence(data);
  if (route === "/evidence/legacy-coverage") return renderDocumentView(findDoc(data, "docs/user-guides/Legacy_Feature_Coverage_Matrix.md"), "Legacy Coverage");
  if (route === "/evidence/user-journeys") return renderDocumentView(findDoc(data, "docs/user-guides/User_Journey_Map.md"), "User Journeys");
  return renderExecutiveOverview(data);
}

function renderSidebar(route: string): string {
  return `
    <aside class="sidebar">
      <div class="brand-block">
        <div class="brand-mark">P</div>
        <div>
          <strong>Panacea OS</strong>
          <span>Enterprise v4.0</span>
        </div>
      </div>
      <nav class="nav" aria-label="Primary">
        ${navSections.map((section) => `
          <section class="nav-section">
            <h2>${escapeHtml(section.title)}</h2>
            ${section.items.map((item) => `
              <a class="nav-link ${route === item.route ? "active" : ""}" href="#${item.route}">
                <i data-lucide="${item.icon}"></i>
                <span>${escapeHtml(item.label)}</span>
              </a>
            `).join("")}
          </section>
        `).join("")}
      </nav>
    </aside>
  `;
}

function renderTopbar(data: AppData, route: string, state: RenderState): string {
  const matches = searchNav(state.globalSearch).slice(0, 5);
  const activeRole = roleFromRoute(route) ?? state.selectedRole;
  const sessionExpired = state.authSession ? isSessionExpired(state.authSession) : false;
  const liveMode = Boolean(state.authSession && !sessionExpired);
  const secondsRemaining = state.authSession ? tokenSecondsRemaining(state.authSession) : 0;
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">${escapeHtml(data.repository.branch)} · ${escapeHtml(shortCommit(data.repository.commit))}</p>
        <h1>${escapeHtml(pageTitle(route))}</h1>
      </div>
      <div class="topbar-actions">
        <a class="mode-pill ${liveMode ? "live" : "demo"}" href="#/auth/login">
          <i data-lucide="${liveMode ? "ShieldCheck" : "MonitorPlay"}"></i>
          <span>${liveMode ? "Live Mode" : "Demo Mode"}</span>
        </a>
        ${state.authSession ? `
          <div class="session-chip" title="Authenticated live session">
            <strong>${escapeHtml(state.authSession.displayName)}</strong>
            <span>${escapeHtml(state.authSession.role)} · ${escapeHtml(state.authSession.tenantId)} · ${secondsRemaining}s</span>
          </div>
        ` : ""}
        <label class="search-box">
          <i data-lucide="Search"></i>
          <input id="global-search" type="search" value="${escapeAttribute(state.globalSearch)}" autocomplete="off" aria-label="Search pages, services, docs" />
        </label>
        <label class="role-switcher">
          <span>${liveMode ? "Role From Token" : "Demo Role Switcher"}</span>
          <select id="demo-role-switcher" aria-label="Demo Role Switcher" ${liveMode ? "disabled" : ""}>
            ${roleSwitcherOptions.map((option) => `<option value="${option.id}" ${option.id === activeRole ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
          </select>
        </label>
        ${liveMode ? `<button class="icon-button" id="logout-button" title="Logout" aria-label="Logout"><i data-lucide="LogOut"></i></button>` : `<a class="icon-button" href="#/auth/login" title="Login" aria-label="Login"><i data-lucide="LogIn"></i></a>`}
        <button class="icon-button" id="language-toggle" title="Toggle language direction" aria-label="Toggle language direction"><i data-lucide="Languages"></i></button>
        <button class="icon-button" id="theme-toggle" title="Toggle theme" aria-label="Toggle theme"><i data-lucide="${state.theme === "light" ? "Moon" : "Sun"}"></i></button>
        <button class="icon-button" title="Notifications" aria-label="Notifications"><i data-lucide="Bell"></i><span class="dot"></span></button>
      </div>
      ${state.globalSearch ? `
        <div class="search-results">
          ${matches.length ? matches.map((item) => `
            <a href="#${item.route}">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.section)}</span>
            </a>
          `).join("") : `<p>No navigation match</p>`}
        </div>
      ` : ""}
    </header>
  `;
}

function renderExecutiveOverview(data: AppData): string {
  const apiSummary = summarizeOpenApi(data.openApiDocuments);
  return `
    <div class="page-grid">
      ${renderPageHeader("Executive Overview", "A professional operator console for Panacea OS v4.0 release visibility, runtime status, APIs, documentation, and evidence.", "OFFICIALLY RELEASED", "ShieldCheck")}
      <section class="metric-grid">
        ${metric("Release", data.release.status, "v4.0.0", "ShieldCheck", "success")}
        ${metric("Runtime readiness", `${data.release.readinessScore}%`, "Evidence-backed", "Gauge", "success")}
        ${metric("Active services", String(data.services.length), "Docker, K8s, PostgreSQL", "ServerCog", "info")}
        ${metric("OpenAPI docs", String(apiSummary.documents), `${apiSummary.endpointCount} endpoints`, "Braces", "info")}
        ${metric("Tests", data.validation.tests.replace("PASS, ", ""), "Latest quality evidence", "TestTube2", "success")}
        ${metric("Foundation", data.release.foundationProvider, data.foundation.baseUrl, "KeyRound", "success")}
      </section>
      <section class="band two-column">
        <div>
          <h2>What You Can Use Now</h2>
          <p>Panacea OS is now visible through this web platform, active service APIs, OpenAPI contracts, runtime validation scripts, and final release evidence. The UI is read-only and operator-oriented; it does not execute clinical workflows.</p>
          <div class="quick-actions">
            <a class="button primary" href="#/developer/api-explorer"><i data-lucide="Braces"></i> Explore APIs</a>
            <a class="button" href="#/command/system-health"><i data-lucide="Activity"></i> Check runtime</a>
            <a class="button" href="#/evidence/release"><i data-lucide="FileCheck2"></i> Release evidence</a>
          </div>
        </div>
        <div class="release-stack">
          ${releaseFact("Latest remote CI", data.validation.latestRemoteCi, "PASS")}
          ${releaseFact("Runtime orchestration", data.release.runtimeStatus, "PASS")}
          ${releaseFact("Disaster recovery", data.release.disasterRecoveryStatus, "PASS")}
          ${releaseFact("Security scan", data.release.securityScanStatus, "PASS")}
        </div>
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>Active Runtime Services</h2>
            <p>These are the services with Dockerfiles, Kubernetes manifests, PostgreSQL migrations, OpenAPI contracts, and tests.</p>
          </div>
          <a class="button compact" href="#/command/system-health"><i data-lucide="ExternalLink"></i> Full inventory</a>
        </div>
        ${renderServiceTable(data.services)}
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>Visible Capability Map</h2>
            <p>UI visibility separates active APIs from documentation-backed platform areas.</p>
          </div>
        </div>
        ${renderModuleTiles(activeServiceModules.slice(0, 6), data)}
      </section>
    </div>
  `;
}

function renderSystemHealth(data: AppData): string {
  return `
    <div class="page-grid">
      ${renderPageHeader("System Health", "Local runtime endpoints, Docker/Kubernetes support, OpenAPI exposure, migrations, and tests for active services.", "Runtime evidence", "Activity")}
      <section class="metric-grid">
        ${metric("Services", String(data.services.length), "Active runtime packages", "Server", "info")}
        ${metric("Docker support", `${data.services.filter((service) => service.hasDocker).length}/${data.services.length}`, "Dockerfiles present", "Container", "success")}
        ${metric("Kubernetes", `${data.services.filter((service) => service.hasKubernetes).length}/${data.services.length}`, "Manifests present", "Boxes", "success")}
        ${metric("Migrations", `${data.services.filter((service) => service.hasMigration).length}/${data.services.length}`, "PostgreSQL-backed", "Database", "success")}
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>Runtime Service Matrix</h2>
            <p>Start Docker Compose to make the health, readiness, metrics, and OpenAPI URLs respond locally.</p>
          </div>
          <code>docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d</code>
        </div>
        ${renderServiceTable(data.services)}
      </section>
      <section class="band">
        <h2>Health URLs</h2>
        <div class="endpoint-grid">
          ${data.services.map((service) => `
            <article class="endpoint-card">
              <h3>${escapeHtml(service.title)}</h3>
              ${linkLine("Live", service.healthUrl)}
              ${linkLine("Ready", service.readinessUrl)}
              ${linkLine("Metrics", service.metricsUrl)}
              ${linkLine("OpenAPI", service.openApiUrl)}
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderFoundationProvider(data: AppData, probe?: FoundationProbeResult): string {
  const checks = probe?.checks ?? [];
  return `
    <div class="page-grid">
      ${renderPageHeader("Foundation Provider", "Live external provider for health, readiness, metrics, JWKS, audit append, and policy evaluation validation.", data.foundation.documentedStatus, "ShieldCheck")}
      <section class="metric-grid">
        ${metric("Base URL", data.foundation.baseUrl, "External provider", "Globe", "info")}
        ${metric("Documented status", data.foundation.documentedStatus, "Release closure evidence", "FileCheck2", "success")}
        ${metric("Browser probe", probe ? probe.overall.toUpperCase() : "Not run", probe?.checkedAt ? new Date(probe.checkedAt).toLocaleString() : "Use Probe Foundation", "Wifi", probe?.overall === "pass" ? "success" : "warn")}
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>Endpoint Contract</h2>
            <p>These URLs are validation endpoints only; no PHI or clinical execution is sent by this UI.</p>
          </div>
          <button class="button primary" id="probe-foundation"><i data-lucide="RefreshCw"></i> Probe Foundation</button>
        </div>
        <div class="endpoint-grid">
          ${foundationEndpointCard("Health", data.foundation.healthUrl, requiredLabel(true), checks)}
          ${foundationEndpointCard("Readiness", data.foundation.readinessUrl, requiredLabel(true), checks)}
          ${foundationEndpointCard("Metrics", data.foundation.metricsUrl, requiredLabel(false), checks)}
          ${foundationEndpointCard("JWKS", data.foundation.jwksUrl, requiredLabel(true), checks)}
          ${foundationEndpointCard("Audit Append", data.foundation.auditAppendUrl, "POST · credentials required", checks)}
          ${foundationEndpointCard("Policy Evaluate", data.foundation.policyUrl, "POST · credentials required", checks)}
        </div>
      </section>
      ${renderDocumentView(findDoc(data, "docs/releases/v4.0.0/Foundation_Live_Provider_Final_Report.md"), "Foundation Release Evidence")}
    </div>
  `;
}

function renderAuthPage(data: AppData, state: RenderState): string {
  const config = state.webConfig ?? buildWebConfig(data);
  const missing = missingLiveConfig(config);
  const session = state.authSession;
  const validation = state.authValidation;
  const discovery = state.providerLoginDiscovery;
  const allowlist = state.apiAllowlistSummary;
  const authMode = session?.authMode === "provider-login" ? "Provider Login" : session?.authMode === "operator-jwt" ? "Operator JWT" : "Demo";
  const providerReady = discovery?.providerHostedLoginAvailable;
  return `
    <div class="page-grid">
      ${renderPageHeader("Foundation Login", "Authenticate the web workspaces with Foundation provider login or a Foundation-issued JWT. Demo mode remains available when live APIs or credentials are unavailable.", session ? "LIVE SESSION" : "AUTH READY", "KeyRound")}
      <section class="metric-grid">
        ${metric("Auth mode", authMode, session ? "Live session active" : "No authenticated session", "ShieldCheck", session ? "success" : "warn")}
        ${metric("Foundation", config.FOUNDATION_BASE_URL, "Configured provider", "Globe", "info")}
        ${metric("Provider login", providerReady ? "YES" : "NO", discovery ? discovery.recommendation : "Run login discovery", "LogIn", providerReady ? "success" : "warn")}
        ${metric("JWKS", validation?.ok ? "Validated" : "Required", validation?.ok ? "JWT validated against JWKS" : "Token validation has not completed", "KeyRound", validation?.ok ? "success" : "warn")}
        ${metric("Tenant", session?.tenantId ?? config.PANACEA_DEFAULT_TENANT, session ? "From JWT claim" : "Default/demo only", "Building2", session ? "success" : "warn")}
        ${metric("Role", session?.role ?? state.selectedRole, session ? "From JWT claim" : "Demo switcher only", "UserRoundCheck", session ? "success" : "warn")}
      </section>
      <section class="band two-column">
        <div>
          <h2>Provider Login</h2>
          <p>Use real Foundation credentials only when the provider exposes login/token endpoints. Credentials are sent directly to Foundation and are not stored by the browser UI.</p>
          <form id="provider-login-form" class="auth-form">
            <label>
              <span>Username</span>
              <input id="provider-username" type="text" autocomplete="username" aria-label="Foundation username" />
            </label>
            <label>
              <span>Password</span>
              <input id="provider-password" type="password" autocomplete="current-password" aria-label="Foundation password" />
            </label>
            <label>
              <span>Tenant ID</span>
              <input id="provider-tenant" type="text" value="${escapeAttribute(config.PANACEA_DEFAULT_TENANT === "demo-tenant" ? "default" : config.PANACEA_DEFAULT_TENANT)}" autocomplete="organization" aria-label="Foundation tenant ID" />
            </label>
            <button class="button primary" type="submit"><i data-lucide="LogIn"></i> Sign In With Foundation</button>
          </form>
          ${state.providerAuthStatus ? `<div class="alert success"><strong>Provider auth</strong><p>${escapeHtml(state.providerAuthStatus)}</p></div>` : ""}
          ${state.authError ? `<div class="alert danger"><strong>Authentication error</strong><p>${escapeHtml(state.authError)}</p></div>` : ""}
        </div>
        <div>
          <h2>Operator Token Mode</h2>
          <p>Panacea OS does not invent authentication. Paste a test JWT issued by the Foundation Provider. The browser validates expiry, issuer, tenant, role claims, JWKS discovery, and signature where the published key supports browser verification.</p>
          <form id="auth-token-form" class="auth-form">
            <label>
              <span>Foundation JWT</span>
              <textarea id="operator-jwt-token" rows="7" autocomplete="off" spellcheck="false" aria-label="Paste Foundation-issued JWT"></textarea>
            </label>
            <button class="button primary" type="submit"><i data-lucide="ShieldCheck"></i> Validate Token</button>
          </form>
          ${validation?.warnings.length ? `<div class="alert warn"><strong>Validation note</strong><p>${escapeHtml(validation.warnings.join(" "))}</p></div>` : ""}
        </div>
      </section>
      <section class="band two-column">
        <div>
          <h2>Current Session</h2>
          ${session ? `
            <div class="session-detail">
              ${releaseFact("Auth mode", authMode, "SESSION")}
              ${releaseFact("User", session.displayName, "AUTHENTICATED")}
              ${releaseFact("Subject", session.subject, "CLAIM")}
              ${releaseFact("Issuer", session.issuer, "CLAIM")}
              ${releaseFact("Tenant", session.tenantId, "CLAIM")}
              ${releaseFact("Role", session.role, "CLAIM")}
              ${releaseFact("Permissions", session.permissions.length ? session.permissions.join(", ") : "No permission claim", "CLAIM")}
              ${releaseFact("Expires", session.expiresAt, tokenSecondsRemaining(session) > 0 ? "ACTIVE" : "EXPIRED")}
            </div>
            <div class="quick-actions">
              <a class="button primary" href="#/workspace/${session.role === "operator" ? "administrator" : session.role}/dashboard"><i data-lucide="LayoutDashboard"></i> Open role workspace</a>
              ${session.authMode === "provider-login" ? `<button class="button" id="refresh-provider-session"><i data-lucide="RefreshCw"></i> Refresh Session</button>` : ""}
              <button class="button" id="logout-button"><i data-lucide="LogOut"></i> Logout</button>
            </div>
          ` : `
            <div class="empty-state">
              <i data-lucide="LockKeyhole"></i>
              <h3>No live session</h3>
              <p>Use Demo Mode for visual review, or provide a real Foundation JWT for Live Mode. Demo role selection never grants production access.</p>
            </div>
          `}
        </div>
        <div>
          <div class="section-title">
            <div>
              <h2>Provider Login Discovery</h2>
              <p>Production login redirect is enabled only when Foundation exposes login or OAuth/OIDC endpoints. No login is simulated.</p>
            </div>
            <button class="button primary" id="discover-foundation-login"><i data-lucide="SearchCheck"></i> Discover Login</button>
          </div>
          ${discovery ? `
            <div class="alert ${discovery.providerHostedLoginAvailable ? "success" : "warn"}">
              <strong>${discovery.providerHostedLoginAvailable ? "Provider login available" : "Operator action required"}</strong>
              <p>${escapeHtml(discovery.recommendation)}</p>
            </div>
            ${providerDiscoveryList(discovery)}
          ` : `
            <div class="empty-state compact">
              <i data-lucide="Search"></i>
              <p>Login discovery has not been run in this browser session.</p>
            </div>
          `}
        </div>
        <div>
          <h2>Browser API Allowlist</h2>
          <p>Unknown browser API calls and dangerous writes are blocked by default. Allowed reads come from existing OpenAPI runtime endpoints.</p>
          ${allowlist ? allowlistSummaryGrid(allowlist) : `<div class="empty-state compact"><i data-lucide="ListChecks"></i><p>Run login discovery or open a live workspace to calculate allowlist status.</p></div>`}
          <div class="alert warn">
            <strong>CORS readiness</strong>
            <p>Browser calls require allowed origin <code>http://localhost:5174</code>, Authorization, tenant, user, request ID, and correlation headers.</p>
          </div>
        </div>
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>Runtime Configuration</h2>
            <p>These values can be provided through <code>window.PANACEA_WEB_CONFIG</code> or Vite-compatible environment variables.</p>
          </div>
          <a class="button compact" href="#/command/live-status"><i data-lucide="Activity"></i> Live status</a>
        </div>
        ${missing.length ? `<div class="alert danger"><strong>Missing required live configuration</strong><p>${escapeHtml(missing.join(", "))}</p></div>` : ""}
        <div class="config-grid">
          ${configLine("FOUNDATION_BASE_URL", config.FOUNDATION_BASE_URL)}
          ${configLine("FOUNDATION_HEALTH_URL", config.FOUNDATION_HEALTH_URL)}
          ${configLine("FOUNDATION_READY_URL", config.FOUNDATION_READY_URL)}
          ${configLine("FOUNDATION_JWKS_URL", config.FOUNDATION_JWKS_URL)}
          ${configLine("FOUNDATION_AUDIT_APPEND_URL", config.FOUNDATION_AUDIT_APPEND_URL)}
          ${configLine("FOUNDATION_POLICY_URL", config.FOUNDATION_POLICY_URL)}
          ${configLine("PANACEA_API_BASE_URL", config.PANACEA_API_BASE_URL)}
          ${configLine("PANACEA_ENABLE_DEMO_MODE", String(config.PANACEA_ENABLE_DEMO_MODE))}
        </div>
      </section>
    </div>
  `;
}

function renderLiveStatusPage(data: AppData, state: RenderState): string {
  const status = state.liveStatus;
  const foundationOnline = status?.foundation.filter((item) => item.state === "online").length ?? 0;
  const serviceOnline = status?.services.filter((item) => item.state === "online").length ?? 0;
  const session = state.authSession;
  return `
    <div class="page-grid">
      ${renderPageHeader("Live API Status", "Browser-visible Foundation and service endpoint polling for authenticated read-only mode.", status?.checkedAt ? "POLLED" : "NOT POLLED", "Activity")}
      <section class="metric-grid">
        ${metric("Foundation endpoints", `${foundationOnline}/${status?.foundation.length ?? 4}`, "Health, readiness, metrics, JWKS", "ShieldCheck", foundationOnline > 0 ? "success" : "warn")}
        ${metric("Service endpoints", `${serviceOnline}/${status?.services.length ?? data.services.length * 3}`, "Health, readiness, OpenAPI", "Server", serviceOnline > 0 ? "success" : "warn")}
        ${metric("Auth", session ? "Authenticated" : "Not authenticated", session ? `${session.role} · ${session.tenantId}` : "Demo fallback", "KeyRound", session ? "success" : "warn")}
        ${metric("Last poll", status?.checkedAt ? new Date(status.checkedAt).toLocaleString() : "Not run", "Use Refresh Live Status", "RefreshCw", status?.checkedAt ? "success" : "warn")}
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>Live Polling</h2>
            <p>Polling uses CORS from the browser and does not weaken backend security. Unauthorized and unavailable states are displayed explicitly.</p>
          </div>
          <button class="button primary" id="refresh-live-status"><i data-lucide="RefreshCw"></i> Refresh Live Status</button>
        </div>
      </section>
      <section class="band two-column">
        <div>
          <h2>Foundation Provider</h2>
          ${statusList(status?.foundation)}
        </div>
        <div>
          <h2>Service Runtime Endpoints</h2>
          ${statusList(status?.services?.slice(0, 18), "No service status has been polled yet.")}
        </div>
      </section>
      ${state.auditAppendResult ? `
        <section class="band">
          <h2>Audit Append Test Result</h2>
          ${liveResultCard(state.auditAppendResult)}
        </section>
      ` : ""}
      ${session?.role === "operator" ? `
        <section class="band">
          <div class="section-title">
            <div>
              <h2>Operator Audit Test</h2>
              <p>Sends a safe <code>testOnly: true</code> audit event to Foundation. No PHI is sent.</p>
            </div>
            <button class="button" id="append-test-audit"><i data-lucide="FileCheck2"></i> Send test audit append</button>
          </div>
        </section>
      ` : ""}
    </div>
  `;
}

function renderModuleGroupPage(title: string, description: string, modules: ModuleVisibility[], data: AppData): string {
  return `
    <div class="page-grid">
      ${renderPageHeader(title, description, `${modules.length} capabilities`, "Boxes")}
      <section class="band">
        ${renderModuleTiles(modules, data)}
      </section>
      <section class="band">
        <h2>Visibility Matrix</h2>
        ${renderModuleTable(modules, data)}
      </section>
    </div>
  `;
}

function renderModuleDetailPage(data: AppData, serviceId: string): string {
  const module = allModules.find((item) => item.serviceId === serviceId || item.id === serviceId);
  const service = data.services.find((item) => item.id === serviceId);
  if (!module || !service) return renderModuleGroupPage("Module", "No matching runtime service found.", [], data);
  const docs = relatedDocs(data, module);
  const apiDoc = data.openApiDocuments.find((document) => document.relativePath === `services/${service.id}/docs/openapi.json`);
  return `
    <div class="page-grid">
      ${renderPageHeader(module.title, module.summary, module.status, "Workflow")}
      <section class="metric-grid">
        ${metric("API paths", String(service.pathCount), `${service.endpointCount} operations`, "Braces", "info")}
        ${metric("Database", service.hasMigration ? "Migration present" : "No migration", service.migrations.join(", "), "Database", service.hasMigration ? "success" : "warn")}
        ${metric("Runtime", service.runtimeStatus, `Port ${service.localPort}`, "ServerCog", "success")}
        ${metric("Tests", `${service.testFiles} files`, "Unit, integration, contract", "TestTube2", "success")}
      </section>
      <section class="band two-column">
        <div>
          <h2>How To Use</h2>
          <p>Start the runtime profile, then open the health, readiness, metrics, and OpenAPI endpoints below. POST operations require valid Foundation authentication and tenant headers in real use.</p>
          <div class="link-list">
            ${linkLine("Health", service.healthUrl)}
            ${linkLine("Readiness", service.readinessUrl)}
            ${linkLine("Metrics", service.metricsUrl)}
            ${linkLine("OpenAPI", service.openApiUrl)}
          </div>
        </div>
        <div>
          <h2>Safety Boundary</h2>
          <p>This UI exposes service contracts and release evidence only. It does not perform diagnosis, treatment, autonomous clinical actions, or AI reasoning expansion.</p>
          <ul class="check-list">
            <li><i data-lucide="CheckCircle2"></i> Tenant-aware API contracts</li>
            <li><i data-lucide="CheckCircle2"></i> Audit and event evidence</li>
            <li><i data-lucide="CheckCircle2"></i> Human governance preserved</li>
          </ul>
        </div>
      </section>
      ${apiDoc ? renderEndpointPreview(apiDoc.endpoints.slice(0, 8)) : ""}
      <section class="band">
        <h2>Related Documentation</h2>
        ${renderDocList(docs.slice(0, 8))}
      </section>
    </div>
  `;
}

function renderFilteredDocsPage(data: AppData, title: string, hints: string[]): string {
  const docs = data.documents.filter((doc) => hints.some((hint) => doc.relativePath.toLowerCase().includes(hint.toLowerCase()) || doc.title.toLowerCase().includes(hint.toLowerCase()) || doc.body.toLowerCase().includes(hint.toLowerCase()))).slice(0, 24);
  return `
    <div class="page-grid">
      ${renderPageHeader(title, "Documentation-backed coverage and operator visibility for this area.", `${docs.length} docs`, "BookOpen")}
      <section class="band">${renderDocList(docs)}</section>
    </div>
  `;
}

function renderInnovationPage(data: AppData): string {
  const report = findDoc(data, "docs/user-guides/New_Innovations_Report.md");
  return `
    <div class="page-grid">
      ${renderPageHeader("New Innovations", "A visibility map of v4 capabilities that were absent or immature in the legacy workspace.", "Evidence-backed", "Sparkles")}
      <section class="band">
        ${renderModuleTiles(innovationModules, data)}
      </section>
      ${renderDocumentView(report, "Innovation Report")}
    </div>
  `;
}

function renderApiExplorer(data: AppData, state: RenderState): string {
  const endpoints = flattenEndpoints(data.openApiDocuments);
  const filtered = filterEndpoints(endpoints, {
    query: state.apiQuery,
    method: state.apiMethod,
    documentId: state.apiDocumentId
  });
  const selected = selectedEndpoint(filtered, state.selectedEndpointKey) ?? filtered[0];
  const methods = ["ALL", "GET", "POST", "PUT", "PATCH", "DELETE"];
  return `
    <div class="page-grid">
      ${renderPageHeader("API Explorer", "Search versioned OpenAPI contracts and generate safe tenant-aware demo curl requests.", `${endpoints.length} endpoints`, "Braces")}
      <section class="band api-workspace">
        <div class="api-controls">
          <label class="field">
            <span>Search</span>
            <input id="api-query" type="search" value="${escapeAttribute(state.apiQuery)}" aria-label="Search endpoint, operation, or service" />
          </label>
          <label class="field">
            <span>Method</span>
            <select id="api-method">
              ${methods.map((method) => `<option value="${method}" ${method === state.apiMethod ? "selected" : ""}>${method}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>OpenAPI document</span>
            <select id="api-document">
              <option value="ALL">All documents</option>
              ${data.openApiDocuments.map((document) => `<option value="${escapeAttribute(document.id)}" ${document.id === state.apiDocumentId ? "selected" : ""}>${escapeHtml(document.title)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="api-layout">
          <div class="endpoint-list" role="list">
            ${filtered.slice(0, 140).map((endpoint) => endpointRow(endpoint, selected)).join("")}
          </div>
          <aside class="endpoint-detail">
            ${selected ? endpointDetail(selected) : `<p>No endpoint matches the current filter.</p>`}
          </aside>
        </div>
      </section>
    </div>
  `;
}

function renderDocumentationCenter(data: AppData, state: RenderState): string {
  const documents = groupDocs(data.documents);
  const selected = state.selectedDocumentId ? data.documents.find((doc) => doc.id === state.selectedDocumentId) : findDoc(data, "docs/user-guides/How_To_Run_Panacea_OS.md");
  return `
    <div class="page-grid">
      ${renderPageHeader("Documentation Center", "Searchable release, audit, API, user, and architecture documents.", `${data.documents.length} docs`, "BookOpen")}
      <section class="band docs-workspace">
        <div class="docs-list">
          ${Object.entries(documents).map(([group, docs]) => `
            <section>
              <h3>${escapeHtml(group)}</h3>
              ${docs.slice(0, 24).map((doc) => `
                <button class="doc-link ${selected?.id === doc.id ? "active" : ""}" data-document-id="${escapeAttribute(doc.id)}">
                  <span>${escapeHtml(doc.title)}</span>
                  <small>${escapeHtml(doc.relativePath)}</small>
                </button>
              `).join("")}
            </section>
          `).join("")}
        </div>
        <article class="markdown-panel">
          ${selected ? markdown(selected.body) : "<p>Select a document.</p>"}
        </article>
      </section>
    </div>
  `;
}

function renderDemoMode(data: AppData): string {
  return `
    <div class="page-grid">
      ${renderPageHeader("Demo Mode", "The fastest safe way to see Panacea OS without adding new backend behavior.", "Operator demo", "MonitorPlay")}
      <section class="band two-column">
        <div>
          <h2>Start Local Runtime</h2>
          <pre><code>docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d</code></pre>
          <p>Then open this web app and the active service OpenAPI URLs. All demo requests should use test tenant values and non-PHI payloads.</p>
        </div>
        <div>
          <h2>Validate Current Checkout</h2>
          <pre><code>npm run check
npm run test:run
npm run openapi
npm run web:check
npm run web:build</code></pre>
        </div>
      </section>
      <section class="band">
        <h2>Open These First</h2>
        <div class="endpoint-grid">
          ${data.services.slice(0, 6).map((service) => `
            <article class="endpoint-card">
              <h3>${escapeHtml(service.title)}</h3>
              ${linkLine("OpenAPI", service.openApiUrl)}
              ${linkLine("Health", service.healthUrl)}
            </article>
          `).join("")}
        </div>
      </section>
      ${renderDocumentView(findDoc(data, "docs/user-guides/Demo_Access_Plan.md"), "Demo Access Plan")}
    </div>
  `;
}

function renderReleaseEvidence(data: AppData): string {
  return `
    <div class="page-grid">
      ${renderPageHeader("Release Evidence Center", "Official release closure, CI, validation, Foundation, tags, waivers, and final package evidence.", data.release.status, "FileCheck2")}
      <section class="metric-grid">
        ${metric("Final commit", shortCommit(data.release.finalCommit), "Current release evidence", "GitCommit", "info")}
        ${metric("Tags", String(data.release.tags.length), data.release.tags.join(", "), "Tag", "success")}
        ${metric("CI", data.release.ciStatus, data.validation.latestRemoteCi, "BadgeCheck", "success")}
        ${metric("Foundation", data.release.foundationProvider, data.foundation.baseUrl, "ShieldCheck", "success")}
      </section>
      <section class="band">
        <h2>Evidence Documents</h2>
        <div class="evidence-grid">
          ${data.releaseEvidence.map((item) => evidenceCard(item)).join("")}
        </div>
      </section>
      ${renderDocumentView(findDoc(data, "docs/releases/v4.0.0/Official_Closure_Report.md"), "Official Closure")}
    </div>
  `;
}

function renderDocumentView(document: MarkdownDocument | undefined, fallbackTitle: string): string {
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(document?.title ?? fallbackTitle)}</h2>
          <p>${escapeHtml(document?.relativePath ?? "Document not found in generated data.")}</p>
        </div>
      </div>
      <article class="markdown-panel single">
        ${document ? markdown(document.body) : "<p>The referenced document is not available in this checkout.</p>"}
      </article>
    </section>
  `;
}

function renderPageHeader(title: string, description: string, status: string, icon: string): string {
  return `
    <section class="page-header">
      <div>
        <p class="eyebrow">Panacea OS Enterprise</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(description)}</p>
      </div>
      <div class="header-status">
        <i data-lucide="${icon}"></i>
        <span>${escapeHtml(status)}</span>
      </div>
    </section>
  `;
}

function renderModuleTiles(modules: ModuleVisibility[], data: AppData): string {
  if (modules.length === 0) return "<p>No module records match this page.</p>";
  return `<div class="module-grid">
    ${modules.map((module) => {
      const service = module.serviceId ? data.services.find((item) => item.id === module.serviceId) : undefined;
      return `
        <article class="module-card">
          <div class="module-card-top">
            <span class="status-pill ${statusClass(module.status)}">${escapeHtml(module.status)}</span>
            <span>${escapeHtml(module.category)}</span>
          </div>
          <h3>${escapeHtml(module.title)}</h3>
          <p>${escapeHtml(module.summary)}</p>
          <div class="module-facts">
            <span>${module.hasUi ? "UI visible" : "No role UI"}</span>
            <span>${module.hasApi ? "API" : "Docs"}</span>
            <span>${module.hasOpenApi ? `${service?.pathCount ?? 0} paths` : "No OpenAPI"}</span>
          </div>
          <a class="button compact" href="#${module.route}"><i data-lucide="ArrowRight"></i> Open</a>
        </article>
      `;
    }).join("")}
  </div>`;
}

function renderModuleTable(modules: ModuleVisibility[], data: AppData): string {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Platform</th><th>UI</th><th>API</th><th>OpenAPI</th><th>Migration</th><th>Docker</th><th>Tests</th><th>User visible</th></tr></thead>
        <tbody>
          ${modules.map((module) => {
            const service = module.serviceId ? data.services.find((item) => item.id === module.serviceId) : undefined;
            return `<tr>
              <td><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(module.status)}</small></td>
              <td>${yesNo(module.hasUi)}</td>
              <td>${yesNo(module.hasApi)}</td>
              <td>${yesNo(module.hasOpenApi)}${service ? `<small>${service.pathCount} paths</small>` : ""}</td>
              <td>${yesNo(module.hasDatabaseMigration)}</td>
              <td>${yesNo(module.hasDockerRuntime)}</td>
              <td>${yesNo(module.hasTests)}</td>
              <td>${yesNo(module.userVisible)}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderServiceTable(services: ServiceRecord[]): string {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Service</th><th>Port</th><th>OpenAPI</th><th>Migration</th><th>Docker</th><th>Kubernetes</th><th>Tests</th></tr></thead>
        <tbody>
          ${services.map((service) => `
            <tr>
              <td><strong>${escapeHtml(service.title)}</strong><small>${escapeHtml(service.apiBase)}</small></td>
              <td>${escapeHtml(service.localPort)}</td>
              <td>${service.hasOpenApi ? `${service.pathCount} paths` : "NO"}<small>${escapeHtml(service.openApiUrl)}</small></td>
              <td>${service.hasMigration ? "YES" : "NO"}<small>${escapeHtml(service.migrations[0] ?? "")}</small></td>
              <td>${yesNo(service.hasDocker)}</td>
              <td>${yesNo(service.hasKubernetes)}</td>
              <td>${service.testFiles}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderEndpointPreview(endpoints: { method: string; path: string; summary: string }[]): string {
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>Endpoint Preview</h2>
          <p>Open the API Explorer for filtering, schemas, response codes, and curl generation.</p>
        </div>
        <a class="button compact" href="#/developer/api-explorer"><i data-lucide="Braces"></i> API Explorer</a>
      </div>
      <div class="endpoint-grid">
        ${endpoints.map((endpoint) => `
          <article class="endpoint-card">
            <span class="method ${endpoint.method.toLowerCase()}">${escapeHtml(endpoint.method)}</span>
            <h3>${escapeHtml(endpoint.path)}</h3>
            <p>${escapeHtml(endpoint.summary)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDocList(documents: MarkdownDocument[]): string {
  if (!documents.length) return "<p>No related documents found.</p>";
  return `<div class="doc-grid">
    ${documents.map((doc) => `
      <article class="doc-card">
        <h3>${escapeHtml(doc.title)}</h3>
        <p>${escapeHtml(doc.excerpt || "Documentation available in repository.")}</p>
        <code>${escapeHtml(doc.relativePath)}</code>
      </article>
    `).join("")}
  </div>`;
}

function endpointRow(endpoint: EndpointRecord, selected?: EndpointRecord): string {
  const key = endpointKey(endpoint);
  const isSelected = selected ? endpointKey(selected) === key : false;
  return `
    <button class="endpoint-row ${isSelected ? "active" : ""}" data-endpoint-key="${escapeAttribute(key)}">
      <span class="method ${endpoint.method.toLowerCase()}">${escapeHtml(endpoint.method)}</span>
      <span>
        <strong>${escapeHtml(endpoint.path)}</strong>
        <small>${escapeHtml(endpoint.documentTitle)}</small>
      </span>
    </button>
  `;
}

function endpointDetail(endpoint: EndpointRecord): string {
  return `
    <h2>${escapeHtml(endpoint.summary)}</h2>
    <p class="endpoint-path"><span class="method ${endpoint.method.toLowerCase()}">${escapeHtml(endpoint.method)}</span> ${escapeHtml(endpoint.path)}</p>
    <dl class="detail-list">
      <div><dt>Service</dt><dd>${escapeHtml(endpoint.documentTitle)}</dd></div>
      <div><dt>Version</dt><dd>${escapeHtml(endpoint.documentVersion)}</dd></div>
      <div><dt>Auth</dt><dd>${endpoint.authRequired ? "Required" : "Public runtime endpoint"}</dd></div>
      <div><dt>Responses</dt><dd>${escapeHtml(endpoint.responseCodes.join(", ") || "Not specified")}</dd></div>
    </dl>
    <h3>curl</h3>
    <pre><code>${escapeHtml(buildCurl(endpoint))}</code></pre>
    <h3>Request Schema</h3>
    <pre><code>${escapeHtml(endpoint.requestSchema || "No JSON request body for this operation.")}</code></pre>
  `;
}

function selectedEndpoint(endpoints: EndpointRecord[], key: string): EndpointRecord | undefined {
  return endpoints.find((endpoint) => endpointKey(endpoint) === key);
}

function endpointKey(endpoint: EndpointRecord): string {
  return `${endpoint.documentId}::${endpoint.method}::${endpoint.path}`;
}

function relatedDocs(data: AppData, module: ModuleVisibility): MarkdownDocument[] {
  return data.documents.filter((doc) =>
    module.docHints.some((hint) => {
      const normalized = hint.toLowerCase();
      return doc.relativePath.toLowerCase().includes(normalized) || doc.title.toLowerCase().includes(normalized) || doc.body.toLowerCase().includes(normalized);
    })
  );
}

function findDoc(data: AppData, relativePath: string): MarkdownDocument | undefined {
  return data.documents.find((doc) => doc.relativePath === relativePath);
}

function groupDocs(documents: MarkdownDocument[]): Record<string, MarkdownDocument[]> {
  return documents.reduce<Record<string, MarkdownDocument[]>>((groups, doc) => {
    groups[doc.group] ??= [];
    groups[doc.group].push(doc);
    return groups;
  }, {});
}

function evidenceCard(item: ReleaseEvidence): string {
  return `
    <article class="doc-card">
      <div class="module-card-top">
        <span class="status-pill ${item.status === "Available" ? "success" : "warn"}">${escapeHtml(item.status)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.excerpt || "Release evidence document.")}</p>
      <code>${escapeHtml(item.relativePath)}</code>
    </article>
  `;
}

function foundationEndpointCard(label: string, url: string, note: string, checks: FoundationProbeResult["checks"]): string {
  const check = checks.find((item) => item.label === label || item.url === url);
  return `
    <article class="endpoint-card">
      <div class="module-card-top">
        <span class="status-pill ${check ? statusClass(check.status) : "neutral"}">${escapeHtml(check?.status ?? "documented")}</span>
        <span>${escapeHtml(note)}</span>
      </div>
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(url)}</p>
      <small>${escapeHtml(check?.detail ?? "Release evidence records this endpoint as validated.")}</small>
    </article>
  `;
}

function releaseFact(label: string, value: string, status: string): string {
  const isUrl = value.startsWith("http");
  return `
    <div class="release-fact">
      <span>${escapeHtml(label)}</span>
      ${isUrl ? `<a href="${escapeAttribute(value)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>` : `<strong>${escapeHtml(value)}</strong>`}
      <em>${escapeHtml(status)}</em>
    </div>
  `;
}

function configLine(label: string, value: string): string {
  return `
    <article class="config-item">
      <strong>${escapeHtml(label)}</strong>
      <code>${escapeHtml(value || "not configured")}</code>
    </article>
  `;
}

function statusList(items: LiveStatusState["foundation"] | undefined, empty = "No live status has been polled yet."): string {
  if (!items?.length) return `<div class="empty-state compact"><i data-lucide="WifiOff"></i><p>${escapeHtml(empty)}</p></div>`;
  return `
    <div class="status-list">
      ${items.map((item) => `
        <article>
          <span class="status-pill ${statusClass(item.state)}">${escapeHtml(item.state)}</span>
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <a href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.url)}</a>
            <small>${escapeHtml(item.httpStatus ? `HTTP ${item.httpStatus} · ${item.detail}` : item.detail)}</small>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function providerDiscoveryList(discovery: ProviderLoginDiscoveryResult): string {
  return `
    <div class="status-list">
      ${discovery.checks.map((check) => `
        <article>
          <span class="status-pill ${check.status === "available" ? "success" : check.status === "missing" ? "warn" : "danger"}">${escapeHtml(check.status)}</span>
          <div>
            <strong>${escapeHtml(check.label)}</strong>
            <a href="${escapeAttribute(check.url)}" target="_blank" rel="noreferrer">${escapeHtml(check.url)}</a>
            <small>${escapeHtml(check.httpStatus ? `HTTP ${check.httpStatus} · ${check.detail}` : check.detail)}</small>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function allowlistSummaryGrid(summary: Record<BrowserApiClassification, number>): string {
  return `
    <div class="config-grid">
      ${Object.entries(summary).map(([label, value]) => `
        <article class="config-item">
          <strong>${escapeHtml(label)}</strong>
          <code>${escapeHtml(value)}</code>
        </article>
      `).join("")}
    </div>
  `;
}

function liveResultCard(result: LiveApiResult): string {
  return `
    <article class="live-result-card">
      <div class="module-card-top">
        <span class="status-pill ${statusClass(result.state)}">${escapeHtml(result.state)}</span>
        <span>${escapeHtml(result.httpStatus ? `HTTP ${result.httpStatus}` : "No HTTP status")}</span>
      </div>
      <h3>${escapeHtml(result.method)} ${escapeHtml(result.url)}</h3>
      <p>${escapeHtml(result.detail)}</p>
      ${result.blockedReason ? `<p><strong>Blocked reason:</strong> ${escapeHtml(result.blockedReason)}</p>` : ""}
      ${result.allowlistClassification ? `<p><strong>Allowlist:</strong> ${escapeHtml(result.allowlistClassification)}</p>` : ""}
      <code>${escapeHtml(result.requestId)}</code>
      ${result.bodyPreview ? `<pre>${escapeHtml(result.bodyPreview)}</pre>` : ""}
    </article>
  `;
}

function metric(label: string, value: string, detail: string, icon: string, tone: "success" | "warn" | "info"): string {
  return `
    <article class="metric-card ${tone}">
      <i data-lucide="${icon}"></i>
      <div>
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(detail)}</small>
      </div>
    </article>
  `;
}

function linkLine(label: string, url: string): string {
  if (!url) return `<p class="link-line"><strong>${escapeHtml(label)}</strong><span>Not available</span></p>`;
  return `<p class="link-line"><strong>${escapeHtml(label)}</strong><a href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></p>`;
}

function requiredLabel(required: boolean): string {
  return required ? "Required" : "Optional";
}

function yesNo(value: boolean): string {
  return `<span class="yes-no ${value ? "yes" : "no"}">${value ? "YES" : "NO"}</span>`;
}

function statusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("pass") || normalized.includes("active") || normalized.includes("success") || normalized.includes("online")) return "success";
  if (normalized.includes("blocked") || normalized.includes("fail") || normalized.includes("offline")) return "danger";
  if (normalized.includes("unauthorized") || normalized.includes("unavailable")) return "danger";
  if (normalized.includes("documentation") || normalized.includes("evidence") || normalized.includes("pending") || normalized.includes("degraded")) return "warn";
  return "neutral";
}

function pageTitle(route: string): string {
  const roleTitle = rolePageTitle(route);
  if (roleTitle) return roleTitle;
  const item = navSections.flatMap((section) => section.items).find((navItem) => navItem.route === route);
  return item?.label ?? "Executive Overview";
}

function markdown(body: string): string {
  return marked.parse(body, { async: false }) as string;
}

function shortCommit(commit: string): string {
  return commit.length > 12 ? commit.slice(0, 12) : commit;
}

function escapeHtml(value: string | number | undefined): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string | number | undefined): string {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
