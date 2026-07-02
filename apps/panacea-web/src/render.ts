import { marked } from "marked";
import type { BrowserApiClassification } from "./apiAllowlist";
import { activeServiceModules, allModules, clinicalModules, enterpriseDocModules, innovationModules, navSections, searchNav } from "./catalog";
import type { ProviderLoginDiscoveryResult } from "./foundationLoginDiscovery";
import { buildCurl, filterEndpoints, flattenEndpoints, type EndpointRecord } from "./apiExplorer";
import { isRoleRoute, renderRoleWorkspace, rolePageTitle } from "./roleRender";
import { roleFromRoute, roleSwitcherOptions } from "./roleWorkspaces";
import { isSessionExpired, tokenSecondsRemaining } from "./auth";
import { buildWebConfig, missingLiveConfig } from "./webConfig";
import { languageOptions, localeDirection, translate, type Locale } from "./locales";
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
  TransactionReviewState,
  TokenValidationResult
} from "./types";
import type { FoundationProbeResult } from "./foundation";

marked.use({ gfm: true, async: false });

let activeLocale: Locale = "en";

function setActiveLocale(locale: Locale) {
  activeLocale = locale;
}

function l(value: string | number | undefined): string {
  return translate(activeLocale, value);
}

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
  transactionReview?: TransactionReviewState;
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
  setActiveLocale(state.language);
  return `
    <div class="app-shell" data-theme="${state.theme}" data-locale="${state.language}" lang="${state.language}" dir="${localeDirection(state.language)}">
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
  setActiveLocale(state.language);
  if (route === "/auth/login") return renderAuthPage(data, state);
  if (route === "/command/live-status") return renderLiveStatusPage(data, state);
  if (route === "/command/transaction-review") return renderTransactionReviewPage(state);
  if (isRoleRoute(route)) return renderRoleWorkspace(data, route, {
    mode: state.authSession ? "live" : "demo",
    session: state.authSession,
    workspaceState: state.liveWorkspaceState,
    locale: state.language
  });
  if (route === "/command/system-health") return renderSystemHealth(data);
  if (route === "/command/global-command") return renderModuleDetailPage(data, "real-time-global-healthcare-command-intelligence-platform");
  if (route === "/command/foundation-provider") return renderFoundationProvider(data, state.foundationProbe);
  if (route === "/clinical/modules") return renderModuleGroupPage("Clinical Modules", "Care platform coverage is shown honestly through professional workspace visibility, governed backend availability, or documentation-backed legacy coverage.", clinicalModules, data);
  if (route === "/clinical/patient-experience") return renderFilteredDocsPage(data, "Patient Experience", ["Patient_Experience", "Patient Portal", "Caregiver", "patient"]);
  if (route === "/clinical/education") return renderFilteredDocsPage(data, "Education & Training", ["Education", "Training", "Certification", "CME"]);
  if (route === "/enterprise/modules") return renderModuleGroupPage("Enterprise Modules", "Enterprise v4.0 combines governed operational workspaces with documentation-backed platform areas.", [...activeServiceModules.filter((module) => module.category === "Enterprise" || module.category === "Compliance" || module.category === "Security and Privacy"), ...enterpriseDocModules], data);
  if (route === "/enterprise/workforce") return renderModuleDetailPage(data, "global-workforce-hr-credentialing-staff-experience-platform");
  if (route === "/enterprise/legal-governance") return renderModuleDetailPage(data, "global-legal-contracting-risk-governance-platform");
  if (route === "/enterprise/compliance-privacy") return renderModuleGroupPage("Compliance & Privacy", "Regulatory, privacy, consent, trust, audit, and policy controls are visible through governed platform workspaces.", activeServiceModules.filter((module) => ["Compliance", "Security and Privacy"].includes(module.category)), data);
  if (route === "/enterprise/customer-success") return renderModuleDetailPage(data, "global-customer-success-support-service-management-platform");
  if (route === "/enterprise/product-management") return renderModuleDetailPage(data, "global-product-management-roadmap-innovation-portfolio-platform");
  if (route === "/intelligence/ai-governance") return renderModuleDetailPage(data, "global-ai-assurance-safety-model-risk-management-platform");
  if (route === "/intelligence/autonomous-foundation") return renderModuleDetailPage(data, "autonomous-healthcare-intelligence-foundation");
  if (route === "/intelligence/innovations") return renderInnovationPage(data);
  if (route === "/developer/api-explorer") return renderApiExplorer(data, state);
  if (route === "/developer/documentation") return renderDocumentationCenter(data, state);
  if (route === "/developer/access-environment" || route === "/developer/demo-mode") return renderDemoMode(data);
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
          <span>${escapeHtml(l("Enterprise v4.0"))}</span>
        </div>
      </div>
      <nav class="nav" aria-label="${escapeAttribute(l("Primary"))}">
        ${navSections.map((section) => `
          <section class="nav-section">
            <h2>${escapeHtml(l(section.title))}</h2>
            ${section.items.map((item) => `
              <a class="nav-link ${route === item.route ? "active" : ""}" href="#${item.route}">
                <i data-lucide="${item.icon}"></i>
                <span>${escapeHtml(l(item.label))}</span>
              </a>
            `).join("")}
          </section>
        `).join("")}
      </nav>
    </aside>
  `;
}

function renderTopbar(_data: AppData, route: string, state: RenderState): string {
  const matches = searchNav(state.globalSearch).slice(0, 5);
  const activeRole = roleFromRoute(route) ?? state.selectedRole;
  const sessionExpired = state.authSession ? isSessionExpired(state.authSession) : false;
  const liveMode = Boolean(state.authSession && !sessionExpired);
  const secondsRemaining = state.authSession ? tokenSecondsRemaining(state.authSession) : 0;
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">${escapeHtml(l("Panacea OS Enterprise"))}</p>
        <h1>${escapeHtml(l(pageTitle(route)))}</h1>
      </div>
      <div class="topbar-actions">
        <a class="mode-pill ${liveMode ? "live" : "preview"}" href="#/auth/login">
          <i data-lucide="${liveMode ? "ShieldCheck" : "LockKeyhole"}"></i>
          <span>${escapeHtml(l(liveMode ? "Live Mode" : "Secure Preview"))}</span>
        </a>
        ${state.authSession ? `
          <div class="session-chip" title="${escapeAttribute(l("Authenticated secure session"))}">
            <strong>${escapeHtml(state.authSession.displayName)}</strong>
            <span>${escapeHtml(l("Secure Session"))} · ${escapeHtml(l(state.authSession.role))} · ${secondsRemaining}s</span>
          </div>
        ` : ""}
        <label class="search-box">
          <i data-lucide="Search"></i>
          <input id="global-search" type="search" value="${escapeAttribute(state.globalSearch)}" autocomplete="off" aria-label="${escapeAttribute(l("Search pages, services, docs"))}" />
        </label>
        <label class="role-switcher">
          <span>${escapeHtml(l(liveMode ? "Role From Token" : "Workspace View"))}</span>
          <select id="demo-role-switcher" aria-label="${escapeAttribute(l("Workspace View"))}" ${liveMode ? "disabled" : ""}>
            ${roleSwitcherOptions.map((option) => `<option value="${option.id}" ${option.id === activeRole ? "selected" : ""}>${escapeHtml(l(option.label))}</option>`).join("")}
          </select>
        </label>
        ${liveMode ? `<button class="icon-button" id="logout-button" title="${escapeAttribute(l("Logout"))}" aria-label="${escapeAttribute(l("Logout"))}"><i data-lucide="LogOut"></i></button>` : `<a class="icon-button" href="#/auth/login" title="${escapeAttribute(l("Login"))}" aria-label="${escapeAttribute(l("Login"))}"><i data-lucide="LogIn"></i></a>`}
        <label class="language-switcher">
          <span>${escapeHtml(l("Language"))}</span>
          <select id="language-toggle" aria-label="${escapeAttribute(l("Language"))}">
            ${languageOptions.map((option) => `<option value="${option.locale}" ${option.locale === state.language ? "selected" : ""}>${escapeHtml(option.locale === "ar" ? option.nativeLabel : option.label)}</option>`).join("")}
          </select>
        </label>
        <button class="icon-button" id="theme-toggle" title="${escapeAttribute(l("Theme"))}" aria-label="${escapeAttribute(l("Theme"))}"><i data-lucide="${state.theme === "light" ? "Moon" : "Sun"}"></i></button>
        <button class="icon-button" title="${escapeAttribute(l("Notifications"))}" aria-label="${escapeAttribute(l("Notifications"))}"><i data-lucide="Bell"></i><span class="dot"></span></button>
      </div>
      ${state.globalSearch ? `
        <div class="search-results">
          ${matches.length ? matches.map((item) => `
            <a href="#${item.route}">
              <strong>${escapeHtml(l(item.label))}</strong>
              <span>${escapeHtml(l(item.section))}</span>
            </a>
          `).join("") : `<p>${escapeHtml(l("No navigation match"))}</p>`}
        </div>
      ` : ""}
    </header>
  `;
}

function renderExecutiveOverview(data: AppData): string {
  return `
    <div class="page-grid">
      ${renderPageHeader("Executive Overview", "Panacea OS coordinates clinical, operational, compliance, and administrative workflows across the hospital environment.", "Enterprise Release", "ShieldCheck")}
      <section class="metric-grid">
        ${metric("Deployment", "UTBE Enterprise", "HTTPS access is active for authorized external access", "Globe2", "success")}
        ${metric("System Health", "Operational", "Runtime services are monitored through the operator center", "Activity", "success")}
        ${metric("Patient Safety", "Human Approval Required", "No autonomous diagnosis or treatment", "ShieldAlert", "success")}
        ${metric("Care Workspaces", "7 role areas", "Clinical, patient, operational, and administrative views", "LayoutDashboard", "info")}
        ${metric("Compliance Evidence", "Available", "Audit, privacy, release, and security evidence retained", "FileCheck2", "success")}
        ${metric("Data Boundary", "Protected", "Public preview does not expose real patient records", "LockKeyhole", "success")}
      </section>
      ${renderProfessionalHomeBoard(data)}
      <section class="band two-column">
        <div>
          <h2>${escapeHtml(l("Hospital Command Summary"))}</h2>
          <p>${escapeHtml(l("Panacea OS presents a hospital-grade operating layer for executive review, clinical workspace visibility, operational monitoring, compliance evidence, and governed enterprise validation."))}</p>
          <div class="quick-actions">
            <a class="button primary" href="#/workspace/doctor/dashboard"><i data-lucide="Stethoscope"></i> ${escapeHtml(l("Open Clinical Operations"))}</a>
            <a class="button" href="#/workspace/patient/dashboard"><i data-lucide="HeartHandshake"></i> ${escapeHtml(l("Open Patient Care"))}</a>
            <a class="button" href="#/command/system-health"><i data-lucide="Activity"></i> ${escapeHtml(l("Operator Evidence"))}</a>
          </div>
        </div>
        <div class="release-stack">
          ${releaseFact("Production Interface", "Real patient data requires authorized integration", "ACTIVE")}
          ${releaseFact("Human Oversight", "Clinical decisions remain with authorized clinicians", "REQUIRED")}
          ${releaseFact("Access Control", "Role-based workspaces with secure session boundaries", "ENFORCED")}
          ${releaseFact("Evidence Access", "Technical proof remains in Operator Center", "AVAILABLE")}
        </div>
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Professional Role Entry"))}</h2>
            <p>${escapeHtml(l("Choose the appropriate hospital workspace. Public preview records are separated from authenticated operational records."))}</p>
          </div>
        </div>
        ${renderRoleEntryGrid()}
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Operational Domains"))}</h2>
            <p>${escapeHtml(l("The enterprise interface groups capabilities by hospital outcome rather than by internal service implementation."))}</p>
          </div>
        </div>
        ${renderModuleTiles(activeServiceModules.slice(0, 6), data)}
      </section>
    </div>
  `;
}

function renderProfessionalHomeBoard(_data: AppData): string {
  const quickLinks = [
    ["/workspace/doctor/dashboard", "Clinical Operations", "Stethoscope", "Patient context, care team visibility, and advisory-only intelligence review."],
    ["/workspace/patient/dashboard", "Patient Care", "HeartHandshake", "Patient-facing view with clear education and privacy boundaries."],
    ["/workspace/laboratory/dashboard", "Laboratory Workflow", "TestTube2", "Orders, specimens, validation, and critical-result visibility."],
    ["/workspace/radiology/dashboard", "Imaging Workflow", "ScanLine", "Imaging worklists, reporting status, and critical-finding review."],
    ["/workspace/pharmacy/dashboard", "Medication Management", "Pill", "Medication review, dispensing visibility, and inventory awareness."],
    ["/workspace/administrator/dashboard", "Administration", "Settings", "Users, access, governance, compliance, and operational administration."]
  ];
  return `
    <section class="band operator-board professional-home-board">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("Hospital Workspace Launchpad"))}</h2>
          <p>${escapeHtml(l("A polished enterprise entry point for executive, clinical, patient, operational, and administrative review."))}</p>
        </div>
        <span class="status-pill success">${escapeHtml(l("Enterprise Interface"))}</span>
      </div>
      <div class="operator-grid">
        <div class="pilot-brief">
          <article>
            <i data-lucide="Hospital"></i>
            <strong>${escapeHtml(l("Panacea OS"))}</strong>
            <span>${escapeHtml(l("UTBE enterprise hospital operating interface"))}</span>
          </article>
          <article>
            <i data-lucide="ShieldCheck"></i>
            <strong>${escapeHtml(l("Secure Data Boundary"))}</strong>
            <span>${escapeHtml(l("No patient records are exposed in the public interface"))}</span>
          </article>
          <article>
            <i data-lucide="UserCheck"></i>
            <strong>${escapeHtml(l("Human Approval Required"))}</strong>
            <span>${escapeHtml(l("Clinical decisions remain under authorized human oversight"))}</span>
          </article>
        </div>
        <div class="workspace-quick-grid">
          ${quickLinks.map(([route, label, icon, detail]) => `
            <a class="workspace-quick-card" href="#${route}">
              <i data-lucide="${icon}"></i>
              <strong>${escapeHtml(l(label))}</strong>
              <span>${escapeHtml(l(detail))}</span>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderRoleEntryGrid(): string {
  const roles = [
    ["/workspace/doctor/dashboard", "Clinical Operations", "Patient care coordination, safety review, and advisory-only intelligence.", "Stethoscope"],
    ["/workspace/patient/dashboard", "Patient Care", "Personalized portal visibility with education and privacy boundaries.", "HeartHandshake"],
    ["/workspace/laboratory/dashboard", "Laboratory Workflow", "Specimen, result, validation, and critical-result workflow views.", "TestTube2"],
    ["/workspace/radiology/dashboard", "Imaging Workflow", "Imaging worklists, reporting, metadata, and critical-finding views.", "ScanLine"],
    ["/workspace/pharmacy/dashboard", "Medication Management", "Medication review, dispensing, inventory, and safety visibility.", "Pill"],
    ["/workspace/administrator/dashboard", "Administration", "Access, policy, compliance, and enterprise administration.", "Settings"],
    ["/command/system-health", "Operator Center", "System operations, deployment proof, API contracts, and release evidence.", "Activity"]
  ];
  return `
    <div class="role-entry-grid">
      ${roles.map(([route, title, detail, icon]) => `
        <a class="role-entry-card" href="#${route}">
          <i data-lucide="${icon}"></i>
          <strong>${escapeHtml(l(title))}</strong>
          <span>${escapeHtml(l(detail))}</span>
        </a>
      `).join("")}
    </div>
  `;
}

function renderSystemHealth(data: AppData): string {
  return `
    <div class="page-grid">
      ${renderPageHeader("System Operations", "Operator-only runtime evidence for service health, deployment support, API contracts, migrations, and validation.", "Operator evidence", "Activity")}
      <section class="metric-grid">
        ${metric("Services", String(data.services.length), "Active runtime packages", "Server", "info")}
        ${metric("Docker support", `${data.services.filter((service) => service.hasDocker).length}/${data.services.length}`, "Dockerfiles present", "Container", "success")}
        ${metric("Kubernetes", `${data.services.filter((service) => service.hasKubernetes).length}/${data.services.length}`, "Manifests present", "Boxes", "success")}
        ${metric("Migrations", `${data.services.filter((service) => service.hasMigration).length}/${data.services.length}`, "PostgreSQL-backed", "Database", "success")}
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Runtime Service Evidence"))}</h2>
            <p>${escapeHtml(l("Operator view for local runtime health, readiness, metrics, and API contract exposure."))}</p>
          </div>
          <span class="status-pill success">${escapeHtml(l("Evidence available"))}</span>
        </div>
        ${renderServiceTable(data.services)}
      </section>
      <section class="band">
        <h2>${escapeHtml(l("Service Check Details"))}</h2>
        <div class="endpoint-grid">
          ${data.services.map((service) => `
            <article class="endpoint-card">
              <h3>${escapeHtml(service.title)}</h3>
              ${runtimeCheckLinks(service)}
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
            <h2>${escapeHtml(l("Endpoint Contract"))}</h2>
            <p>These URLs are validation endpoints only; no PHI or clinical execution is sent by this UI.</p>
          </div>
          <button class="button primary" id="probe-foundation"><i data-lucide="RefreshCw"></i> ${escapeHtml(l("Probe Foundation"))}</button>
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
  const authMode = session?.authMode === "provider-login" ? "Provider Login" : session?.authMode === "operator-jwt" ? "Operator Token" : "Secure Preview";
  const providerReady = discovery?.providerHostedLoginAvailable;
  return `
    <div class="page-grid">
      ${renderPageHeader("Secure Access", "Authenticate enterprise workspaces through the approved Foundation provider. Public preview records remain separated from authenticated operational records.", session ? "LIVE SESSION" : "AUTH READY", "KeyRound")}
      <section class="metric-grid">
        ${metric("Auth mode", authMode, session ? "Live session active" : "No authenticated session", "ShieldCheck", session ? "success" : "warn")}
        ${metric("Foundation", "Configured", "Approved external identity provider", "Globe", "info")}
        ${metric("Provider login", providerReady ? "Available" : "Operator action required", discovery ? professionalAuthRecommendation(discovery.recommendation) : "Discovery not run", "LogIn", providerReady ? "success" : "warn")}
        ${metric("Secure Key Set", validation?.ok ? "Validated" : "Required", validation?.ok ? "Token validated against provider keys" : "Token validation has not completed", "KeyRound", validation?.ok ? "success" : "warn")}
        ${metric("Organization", session ? "Verified" : "Default", session ? "From secure session" : "No live organization session", "Building2", session ? "success" : "warn")}
        ${metric("Role", session?.role ?? state.selectedRole, session ? "From secure session" : "Workspace preview only", "UserRoundCheck", session ? "success" : "warn")}
      </section>
      <section class="band two-column">
        <div>
          <h2>${escapeHtml(l("Provider Login"))}</h2>
          <p>${escapeHtml(l("Use approved Foundation credentials only. Credentials are sent directly to the Foundation provider and are not stored by the browser UI."))}</p>
          <form id="provider-login-form" class="auth-form">
            <label>
              <span>${escapeHtml(l("Username"))}</span>
              <input id="provider-username" type="text" autocomplete="username" aria-label="Foundation username" />
            </label>
            <label>
              <span>${escapeHtml(l("Password"))}</span>
              <input id="provider-password" type="password" autocomplete="current-password" aria-label="Foundation password" />
            </label>
            <label>
              <span>${escapeHtml(l("Tenant ID"))}</span>
              <input id="provider-tenant" type="text" value="${escapeAttribute(config.PANACEA_DEFAULT_TENANT)}" autocomplete="organization" aria-label="${escapeAttribute(l("Foundation organization ID"))}" />
            </label>
            <button class="button primary" type="submit"><i data-lucide="LogIn"></i> ${escapeHtml(l("Sign In With Foundation"))}</button>
          </form>
          ${state.providerAuthStatus ? `<div class="alert success"><strong>${escapeHtml(l("Provider auth"))}</strong><p>${escapeHtml(l(state.providerAuthStatus))}</p></div>` : ""}
          ${state.authError ? `<div class="alert danger"><strong>${escapeHtml(l("Authentication error"))}</strong><p>${escapeHtml(l(state.authError))}</p></div>` : ""}
        </div>
        <div>
          <h2>${escapeHtml(l("Operator Token Validation"))}</h2>
          <p>${escapeHtml(l("Use a Foundation-issued test security token when provider-hosted login is unavailable. The browser validates expiry, issuer, organization, role claims, and provider key discovery where supported."))}</p>
          <form id="auth-token-form" class="auth-form">
            <label>
              <span>${escapeHtml(l("Foundation Security Token"))}</span>
              <textarea id="operator-jwt-token" rows="7" autocomplete="off" spellcheck="false" aria-label="${escapeAttribute(l("Paste Foundation-issued security token"))}"></textarea>
            </label>
            <button class="button primary" type="submit"><i data-lucide="ShieldCheck"></i> ${escapeHtml(l("Validate Token"))}</button>
          </form>
          ${validation?.warnings.length ? `<div class="alert warn"><strong>${escapeHtml(l("Validation note"))}</strong><p>${escapeHtml(l(validation.warnings.join(" ")))}</p></div>` : ""}
        </div>
      </section>
      <section class="band two-column">
        <div>
          <h2>${escapeHtml(l("Current Session"))}</h2>
          ${session ? `
            <div class="session-detail">
              ${releaseFact("Auth mode", authMode, "SESSION")}
              ${releaseFact("User", session.displayName, "AUTHENTICATED")}
              ${releaseFact("Organization", session.tenantId, "VERIFIED")}
              ${releaseFact("Role", session.role, "VERIFIED")}
              ${releaseFact("Expires", session.expiresAt, tokenSecondsRemaining(session) > 0 ? "ACTIVE" : "EXPIRED")}
            </div>
            <div class="quick-actions">
              <a class="button primary" href="#/workspace/${session.role === "operator" ? "administrator" : session.role}/dashboard"><i data-lucide="LayoutDashboard"></i> ${escapeHtml(l("Open role workspace"))}</a>
              ${session.authMode === "provider-login" ? `<button class="button" id="refresh-provider-session"><i data-lucide="RefreshCw"></i> ${escapeHtml(l("Refresh Session"))}</button>` : ""}
              <button class="button" id="logout-button"><i data-lucide="LogOut"></i> ${escapeHtml(l("Logout"))}</button>
            </div>
          ` : `
            <div class="empty-state">
              <i data-lucide="LockKeyhole"></i>
              <h3>${escapeHtml(l("No live session"))}</h3>
              <p>${escapeHtml(l("Use the secure preview for visual review, or provide approved Foundation credentials for Live Mode. Workspace selection never grants production access."))}</p>
            </div>
          `}
        </div>
        <div>
          <div class="section-title">
            <div>
              <h2>${escapeHtml(l("Provider Sign-In Availability"))}</h2>
              <p>${escapeHtml(l("Provider-hosted sign-in is enabled only when Foundation exposes approved login endpoints. No sign-in is simulated."))}</p>
            </div>
            <button class="button primary" id="discover-foundation-login"><i data-lucide="SearchCheck"></i> ${escapeHtml(l("Discover Login"))}</button>
          </div>
          ${discovery ? `
            <div class="alert ${discovery.providerHostedLoginAvailable ? "success" : "warn"}">
              <strong>${escapeHtml(l(discovery.providerHostedLoginAvailable ? "Provider login available" : "Operator action required"))}</strong>
              <p>${escapeHtml(discovery.recommendation)}</p>
            </div>
            ${providerDiscoveryList(discovery)}
          ` : `
            <div class="empty-state compact">
              <i data-lucide="Search"></i>
              <p>${escapeHtml(l("Login discovery has not been run in this browser session."))}</p>
            </div>
          `}
        </div>
        <div>
          <h2>${escapeHtml(l("Browser Access Policy"))}</h2>
          <p>${escapeHtml(l("Unknown browser service calls and unsafe write actions are blocked by default. Approved access remains role-scoped and audited."))}</p>
          ${allowlist ? allowlistSummaryGrid(allowlist) : `<div class="empty-state compact"><i data-lucide="ListChecks"></i><p>${escapeHtml(l("Run login discovery or open a live workspace to calculate allowlist status."))}</p></div>`}
          <div class="alert warn">
            <strong>${escapeHtml(l("Browser Access Policy"))}</strong>
            <p>${escapeHtml(l("Browser calls require an approved origin, secure authorization, organization scope, user identity, and request traceability headers."))}</p>
          </div>
        </div>
      </section>
      ${missing.length ? `<section class="band"><div class="alert danger"><strong>${escapeHtml(l("Secure access configuration incomplete"))}</strong><p>${escapeHtml(l("Please contact the system operator to complete Foundation provider configuration."))}</p></div></section>` : ""}
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
        ${metric("Auth", session ? "Authenticated" : "Not authenticated", session ? `${session.role} · ${session.tenantId}` : "Secure preview", "KeyRound", session ? "success" : "warn")}
        ${metric("Last poll", status?.checkedAt ? new Date(status.checkedAt).toLocaleString() : "Not run", "Use Refresh Live Status", "RefreshCw", status?.checkedAt ? "success" : "warn")}
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Live Polling"))}</h2>
            <p>Polling uses CORS from the browser and does not weaken backend security. Unauthorized and unavailable states are displayed explicitly.</p>
          </div>
          <button class="button primary" id="refresh-live-status"><i data-lucide="RefreshCw"></i> ${escapeHtml(l("Refresh Live Status"))}</button>
        </div>
      </section>
      <section class="band two-column">
        <div>
          <h2>${escapeHtml(l("Foundation Provider"))}</h2>
          ${statusList(status?.foundation)}
        </div>
        <div>
          <h2>${escapeHtml(l("Service Runtime Endpoints"))}</h2>
          ${statusList(status?.services?.slice(0, 18), "No service status has been polled yet.")}
        </div>
      </section>
      ${state.auditAppendResult ? `
        <section class="band">
          <h2>${escapeHtml(l("Audit Append Test Result"))}</h2>
          ${liveResultCard(state.auditAppendResult)}
        </section>
      ` : ""}
      ${session?.role === "operator" ? `
        <section class="band">
          <div class="section-title">
            <div>
              <h2>${escapeHtml(l("Operator Audit Test"))}</h2>
              <p>Sends a safe <code>testOnly: true</code> audit event to Foundation. No PHI is sent.</p>
            </div>
            <button class="button" id="append-test-audit"><i data-lucide="FileCheck2"></i> ${escapeHtml(l("Send test audit append"))}</button>
          </div>
        </section>
      ` : ""}
    </div>
  `;
}

function renderTransactionReviewPage(state: RenderState): string {
  const review = state.transactionReview;
  const events = resultItems(review?.events);
  const projections = resultItems(review?.projections);
  const failed = projections.filter((item) => String(readField(item, "projectionStatus", "status")) === "failed");
  const projected = projections.filter((item) => ["projected", "replayed"].includes(String(readField(item, "projectionStatus", "status"))));
  if (!state.authSession) {
    return `
      <div class="page-grid">
        ${renderPageHeader("Transaction Review", "Authenticated operator review for live write workflow events and read-model projections.", "LIVE MODE REQUIRED", "ListChecks")}
        <section class="band">
          <div class="empty-state compact">
            <i data-lucide="LockKeyhole"></i>
            <p>${escapeHtml(l("Sign in with a Foundation-issued token to review live transaction projections."))}</p>
            <a class="button primary" href="#/auth/login"><i data-lucide="KeyRound"></i> ${escapeHtml(l("Foundation Login"))}</a>
          </div>
        </section>
      </div>
    `;
  }
  return `
    <div class="page-grid">
      ${renderPageHeader("Transaction Review", "Operator-safe review of accepted write workflow events, read-model projection state, audit lineage, and replay-safe retry controls.", review?.lastUpdated ? "LIVE REVIEW" : "NOT LOADED", "ListChecks")}
      <section class="metric-grid">
        ${metric("Events", String(events.length), "Recent accepted write workflow events", "RadioTower", events.length ? "success" : "warn")}
        ${metric("Projected", String(projected.length), "Projected or replayed read-model targets", "DatabaseZap", projected.length ? "success" : "warn")}
        ${metric("Failed", String(failed.length), "Retryable projection failures", "TriangleAlert", failed.length ? "warn" : "success")}
        ${metric("Last updated", review?.lastUpdated ? new Date(review.lastUpdated).toLocaleString() : "Not refreshed", "Manual refresh available", "RefreshCw", review?.lastUpdated ? "success" : "warn")}
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Transaction Projection Review"))}</h2>
            <p>${escapeHtml(l("Review is read-only except for safe retry of failed projections. Retry upserts read models and never re-executes clinical decisions."))}</p>
          </div>
          <button class="button primary" id="refresh-transaction-review"><i data-lucide="RefreshCw"></i> ${escapeHtml(l("Refresh Transactions"))}</button>
        </div>
        ${review?.retryResult ? liveResultCard(review.retryResult) : ""}
      </section>
      <section class="band">
        <h2>${escapeHtml(l("Recent Workflow Events"))}</h2>
        ${events.length ? transactionEventsTable(events) : emptyTransactionState(review?.events, "No live write workflow events returned for this tenant.")}
      </section>
      <section class="band">
        <h2>${escapeHtml(l("Projection Status"))}</h2>
        ${projections.length ? projectionTable(projections) : emptyTransactionState(review?.projections, "No projection tracking rows returned for this tenant.")}
      </section>
    </div>
  `;
}

function transactionEventsTable(items: unknown[]): string {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${["Event", "Workflow", "Actor", "Tenant", "Projection", "Request", "Occurred"].map((header) => `<th>${escapeHtml(l(header))}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => {
            const projections = Array.isArray(readField(item, "projections")) ? readField(item, "projections") as unknown[] : [];
            const statuses = projections.map((projection) => String(readField(projection, "status", "projectionStatus") ?? "")).filter(Boolean);
            return `
              <tr>
                <td><strong>${escapeHtml(String(readField(item, "eventType") ?? ""))}</strong><br><small>${escapeHtml(String(readField(item, "id") ?? ""))}</small></td>
                <td>${escapeHtml(String(readField(item, "workflowKey") ?? ""))}<br><small>${escapeHtml(String(readField(item, "subjectId") ?? ""))}</small></td>
                <td>${escapeHtml(String(readField(item, "actorId") ?? ""))}</td>
                <td>${escapeHtml(String(readField(item, "tenantId") ?? ""))}</td>
                <td>${escapeHtml(statuses.join(", ") || "none")}</td>
                <td><small>${escapeHtml(String(readNested(item, ["requestContext", "requestId"]) ?? ""))}</small><br><small>${escapeHtml(String(readNested(item, ["requestContext", "correlationId"]) ?? ""))}</small></td>
                <td>${escapeHtml(String(readField(item, "occurredAt") ?? ""))}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function projectionTable(items: unknown[]): string {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${["Target", "Event", "Status", "Actor", "Tenant", "Correlation", "Failure", "Action"].map((header) => `<th>${escapeHtml(l(header))}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => {
            const id = String(readField(item, "id") ?? "");
            const status = String(readField(item, "projectionStatus", "status") ?? "");
            return `
              <tr>
                <td><strong>${escapeHtml(String(readField(item, "projectionTarget") ?? ""))}</strong><br><small>${escapeHtml(String(readField(item, "readModelId") ?? ""))}</small></td>
                <td>${escapeHtml(String(readField(item, "eventType") ?? ""))}<br><small>${escapeHtml(String(readField(item, "eventId") ?? ""))}</small></td>
                <td><span class="status-pill ${statusClass(status)}">${escapeHtml(l(status || "unknown"))}</span><br><small>${escapeHtml(String(readField(item, "processedAt") ?? ""))}</small></td>
                <td>${escapeHtml(String(readField(item, "actorId") ?? ""))}</td>
                <td>${escapeHtml(String(readField(item, "tenantId") ?? ""))}</td>
                <td><small>${escapeHtml(String(readField(item, "correlationId") ?? ""))}</small><br><small>${escapeHtml(String(readField(item, "requestId") ?? ""))}</small></td>
                <td>${escapeHtml(String(readField(item, "failureReason") ?? ""))}</td>
                <td>${status === "failed" ? `<button class="button compact" data-retry-projection-id="${escapeAttribute(id)}"><i data-lucide="RotateCcw"></i> ${escapeHtml(l("Retry"))}</button>` : `<span>${escapeHtml(l("Review only"))}</span>`}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function emptyTransactionState(result: LiveApiResult | undefined, emptyText: string): string {
  if (result && result.state !== "online") return liveResultCard(result);
  return `<div class="empty-state compact"><i data-lucide="Database"></i><p>${escapeHtml(l(emptyText))}</p></div>`;
}

function renderModuleGroupPage(title: string, description: string, modules: ModuleVisibility[], data: AppData): string {
  return `
    <div class="page-grid">
      ${renderPageHeader(title, description, `${modules.length} capabilities`, "Boxes")}
      <section class="band">
        ${renderModuleTiles(modules, data)}
      </section>
      <section class="band">
        <h2>${escapeHtml(l("Enterprise Capability View"))}</h2>
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
  return `
    <div class="page-grid">
      ${renderPageHeader(module.title, module.summary, professionalModuleStatus(module.status), "Workflow")}
      <section class="metric-grid">
        ${metric("Capability Status", professionalModuleStatus(module.status), "Visible in enterprise interface", "BadgeCheck", module.hasUi ? "success" : "warn")}
        ${metric("Governance", "Auditable", "Actions remain policy-controlled", "ShieldCheck", "success")}
        ${metric("Data Boundary", "Tenant Aware", "Organization separation remains enforced", "Building2", "success")}
        ${metric("Validation", service.testFiles ? "Validated" : "Needs Review", "Evidence retained in Operator Center", "TestTube2", service.testFiles ? "success" : "warn")}
      </section>
      <section class="band two-column">
        <div>
          <h2>${escapeHtml(l("How To Use"))}</h2>
          <p>${escapeHtml(l("Use this area as a professional view of the governed platform capability. Technical contracts, ports, and route evidence are kept in the Operator Center."))}</p>
          <div class="link-list">
            <p class="link-line"><strong>${escapeHtml(l("Primary workspace"))}</strong><a href="#${module.route}">${escapeHtml(l(module.title))}</a></p>
            <p class="link-line"><strong>${escapeHtml(l("Operator evidence"))}</strong><a href="#/command/system-health">${escapeHtml(l("System Operations"))}</a></p>
          </div>
        </div>
        <div>
          <h2>${escapeHtml(l("Safety Boundary"))}</h2>
          <p>${escapeHtml(l("This UI does not perform diagnosis, treatment, autonomous clinical action, or AI reasoning expansion."))}</p>
          <ul class="check-list">
            <li><i data-lucide="CheckCircle2"></i> ${escapeHtml(l("Organization boundary controls"))}</li>
            <li><i data-lucide="CheckCircle2"></i> ${escapeHtml(l("Audit and evidence retained"))}</li>
            <li><i data-lucide="CheckCircle2"></i> ${escapeHtml(l("Human governance preserved"))}</li>
          </ul>
        </div>
      </section>
      <section class="band">
        <h2>${escapeHtml(l("Related Documentation"))}</h2>
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
      ${renderPageHeader("API Explorer", "Search versioned OpenAPI contracts and generate safe tenant-aware curl requests.", `${endpoints.length} endpoints`, "Braces")}
      <section class="band api-workspace">
        <div class="api-controls">
          <label class="field">
            <span>${escapeHtml(l("Search"))}</span>
            <input id="api-query" type="search" value="${escapeAttribute(state.apiQuery)}" aria-label="${escapeAttribute(l("Search endpoint, operation, or service"))}" />
          </label>
          <label class="field">
            <span>${escapeHtml(l("Method"))}</span>
            <select id="api-method">
              ${methods.map((method) => `<option value="${method}" ${method === state.apiMethod ? "selected" : ""}>${method}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>${escapeHtml(l("OpenAPI document"))}</span>
            <select id="api-document">
              <option value="ALL">${escapeHtml(l("All documents"))}</option>
              ${data.openApiDocuments.map((document) => `<option value="${escapeAttribute(document.id)}" ${document.id === state.apiDocumentId ? "selected" : ""}>${escapeHtml(document.title)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div class="api-layout">
          <div class="endpoint-list" role="list">
            ${filtered.slice(0, 140).map((endpoint) => endpointRow(endpoint, selected)).join("")}
          </div>
          <aside class="endpoint-detail">
            ${selected ? endpointDetail(selected) : `<p>${escapeHtml(l("No endpoint matches the current filter."))}</p>`}
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
          ${selected ? markdown(selected.body) : `<p>${escapeHtml(l("Select a document."))}</p>`}
        </article>
      </section>
    </div>
  `;
}

function renderDemoMode(_data: AppData): string {
  return `
    <div class="page-grid">
      ${renderPageHeader("Access & Environment", "A secure environment view for reviewing Panacea OS without exposing real patient records.", "Enterprise", "MonitorPlay")}
      <section class="band two-column">
        <div>
          <h2>${escapeHtml(l("Environment Review"))}</h2>
          <p>${escapeHtml(l("Use the role workspaces to review the hospital experience with protected preview records, clear safety boundaries, and no public patient data exposure."))}</p>
          <ul class="check-list">
            <li><i data-lucide="CheckCircle2"></i> ${escapeHtml(l("Protected Preview Records"))}</li>
            <li><i data-lucide="CheckCircle2"></i> ${escapeHtml(l("Human Approval Required"))}</li>
            <li><i data-lucide="CheckCircle2"></i> ${escapeHtml(l("No real patient data without authorization"))}</li>
          </ul>
        </div>
        <div>
          <h2>${escapeHtml(l("Operator Validation"))}</h2>
          <p>${escapeHtml(l("Operational commands, deployment verification, and technical evidence remain in the controlled operator documentation package."))}</p>
          <div class="quick-actions">
            <a class="button primary" href="#/command/system-health"><i data-lucide="Activity"></i> ${escapeHtml(l("System Operations"))}</a>
            <a class="button" href="#/evidence/release"><i data-lucide="FileCheck2"></i> ${escapeHtml(l("Compliance Evidence"))}</a>
          </div>
        </div>
      </section>
      <section class="band">
        <h2>${escapeHtml(l("Recommended Platform Walkthrough"))}</h2>
        ${renderRoleEntryGrid()}
      </section>
      <section class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Environment Access Plan"))}</h2>
            <p>${escapeHtml(l("The detailed operator runbook remains available in the documentation center for authorized technical review."))}</p>
          </div>
          <a class="button compact" href="#/developer/documentation"><i data-lucide="BookOpen"></i> ${escapeHtml(l("Documentation Center"))}</a>
        </div>
      </section>
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
        <h2>${escapeHtml(l("Evidence Documents"))}</h2>
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
          <h2>${escapeHtml(l(document?.title ?? fallbackTitle))}</h2>
          <p class="ltr-text" dir="ltr">${escapeHtml(document?.relativePath ?? l("Document not found in generated data."))}</p>
        </div>
      </div>
      <article class="markdown-panel single">
        ${document ? markdown(document.body) : `<p>${escapeHtml(l("The referenced document is not available in this checkout."))}</p>`}
      </article>
    </section>
  `;
}

function renderPageHeader(title: string, description: string, status: string, icon: string): string {
  return `
    <section class="page-header">
      <div>
        <p class="eyebrow">${escapeHtml(l("Panacea OS Enterprise"))}</p>
        <h2>${escapeHtml(l(title))}</h2>
        <p>${escapeHtml(l(description))}</p>
      </div>
      <div class="header-status">
        <i data-lucide="${icon}"></i>
        <span>${escapeHtml(l(status))}</span>
      </div>
    </section>
  `;
}

function renderModuleTiles(modules: ModuleVisibility[], _data: AppData): string {
  if (modules.length === 0) return "<p>No module records match this page.</p>";
  return `<div class="module-grid">
    ${modules.map((module) => {
      return `
        <article class="module-card">
          <div class="module-card-top">
            <span class="status-pill ${statusClass(module.status)}">${escapeHtml(l(professionalModuleStatus(module.status)))}</span>
            <span>${escapeHtml(l(module.category))}</span>
          </div>
          <h3>${escapeHtml(l(module.title))}</h3>
          <p>${escapeHtml(l(module.summary))}</p>
          <div class="module-facts">
            <span>${escapeHtml(l(module.hasUi ? "Workspace visible" : "Documented capability"))}</span>
            <span>${escapeHtml(l(module.hasApi ? "Governed backend available" : "Documentation-backed"))}</span>
            <span>${escapeHtml(l(module.userVisible ? "User-visible" : "Operator evidence only"))}</span>
          </div>
          <a class="button compact" href="#${module.route}"><i data-lucide="ArrowRight"></i> ${escapeHtml(l("Open"))}</a>
        </article>
      `;
    }).join("")}
  </div>`;
}

function renderModuleTable(modules: ModuleVisibility[], data: AppData): string {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>${escapeHtml(l("Platform"))}</th><th>${escapeHtml(l("Workspace"))}</th><th>${escapeHtml(l("Backend availability"))}</th><th>${escapeHtml(l("Governance"))}</th><th>${escapeHtml(l("Evidence"))}</th><th>${escapeHtml(l("User-visible"))}</th></tr></thead>
        <tbody>
          ${modules.map((module) => {
            const service = module.serviceId ? data.services.find((item) => item.id === module.serviceId) : undefined;
            return `<tr>
              <td><strong>${escapeHtml(l(module.title))}</strong><small>${escapeHtml(l(professionalModuleStatus(module.status)))}</small></td>
              <td>${escapeHtml(l(module.hasUi ? "Available" : "Documented"))}</td>
              <td>${escapeHtml(l(module.hasApi ? "Governed backend available" : "Documentation-backed"))}</td>
              <td>${escapeHtml(l(module.hasDatabaseMigration ? "Auditable and tenant aware" : "Reviewed in documentation"))}</td>
              <td>${escapeHtml(l(service?.testFiles ? "Validated evidence available" : "Needs operator review"))}</td>
              <td>${escapeHtml(l(module.userVisible ? "YES" : "NO"))}</td>
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
        <thead><tr><th>${escapeHtml(l("Service"))}</th><th>${escapeHtml(l("Port"))}</th><th>OpenAPI</th><th>${escapeHtml(l("Migration"))}</th><th>Docker</th><th>Kubernetes</th><th>${escapeHtml(l("Tests"))}</th></tr></thead>
        <tbody>
          ${services.map((service) => `
            <tr>
              <td><strong>${escapeHtml(l(service.title))}</strong><small class="ltr-text" dir="ltr">${escapeHtml(service.apiBase)}</small></td>
              <td>${escapeHtml(service.localPort)}</td>
              <td>${service.hasOpenApi ? `${service.pathCount} ${escapeHtml(l("paths"))}` : escapeHtml(l("NO"))}<small class="ltr-text" dir="ltr">${escapeHtml(service.openApiUrl)}</small></td>
              <td>${escapeHtml(l(service.hasMigration ? "YES" : "NO"))}<small class="ltr-text" dir="ltr">${escapeHtml(service.migrations[0] ?? "")}</small></td>
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
          <h2>${escapeHtml(l("Endpoint Preview"))}</h2>
          <p>${escapeHtml(l("Open the API Explorer for filtering, schemas, response codes, and curl generation."))}</p>
        </div>
        <a class="button compact" href="#/developer/api-explorer"><i data-lucide="Braces"></i> ${escapeHtml(l("API Explorer"))}</a>
      </div>
      <div class="endpoint-grid">
        ${endpoints.map((endpoint) => `
          <article class="endpoint-card">
            <span class="method ${endpoint.method.toLowerCase()}">${escapeHtml(endpoint.method)}</span>
            <h3 class="api-path" dir="ltr">${escapeHtml(endpoint.path)}</h3>
            <p>${escapeHtml(endpoint.summary)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderDocList(documents: MarkdownDocument[]): string {
  if (!documents.length) return `<p>${escapeHtml(l("No related documents found."))}</p>`;
  return `<div class="doc-grid">
    ${documents.map((doc) => `
      <article class="doc-card">
        <h3>${escapeHtml(l(doc.title))}</h3>
        <p>${escapeHtml(l("Professional documentation is available for authorized operator review."))}</p>
        <span class="doc-availability">${escapeHtml(l("Documentation available in Operator Center"))}</span>
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
        <strong class="api-path" dir="ltr">${escapeHtml(endpoint.path)}</strong>
        <small>${escapeHtml(endpoint.documentTitle)}</small>
      </span>
    </button>
  `;
}

function endpointDetail(endpoint: EndpointRecord): string {
  return `
    <h2>${escapeHtml(endpoint.summary)}</h2>
    <p class="endpoint-path" dir="ltr"><span class="method ${endpoint.method.toLowerCase()}">${escapeHtml(endpoint.method)}</span> ${escapeHtml(endpoint.path)}</p>
    <dl class="detail-list">
      <div><dt>${escapeHtml(l("Service"))}</dt><dd>${escapeHtml(endpoint.documentTitle)}</dd></div>
      <div><dt>${escapeHtml(l("Version"))}</dt><dd>${escapeHtml(endpoint.documentVersion)}</dd></div>
      <div><dt>${escapeHtml(l("Auth"))}</dt><dd>${escapeHtml(l(endpoint.authRequired ? "Required" : "Public runtime endpoint"))}</dd></div>
      <div><dt>${escapeHtml(l("Responses"))}</dt><dd>${escapeHtml(endpoint.responseCodes.join(", ") || l("Not specified"))}</dd></div>
    </dl>
    <h3>curl</h3>
    <pre><code>${escapeHtml(buildCurl(endpoint))}</code></pre>
    <h3>${escapeHtml(l("Request Schema"))}</h3>
    <pre><code>${escapeHtml(endpoint.requestSchema || l("No JSON request body for this operation."))}</code></pre>
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
        <span class="status-pill ${item.status === "Available" ? "success" : "warn"}">${escapeHtml(l(item.status))}</span>
      </div>
      <h3>${escapeHtml(l(item.title))}</h3>
      <p>${escapeHtml(l(item.excerpt || "Release evidence document."))}</p>
      <code dir="ltr">${escapeHtml(item.relativePath)}</code>
    </article>
  `;
}

function foundationEndpointCard(label: string, url: string, note: string, checks: FoundationProbeResult["checks"]): string {
  const check = checks.find((item) => item.label === label || item.url === url);
  return `
    <article class="endpoint-card">
      <div class="module-card-top">
        <span class="status-pill ${check ? statusClass(check.status) : "neutral"}">${escapeHtml(l(check?.status ?? "documented"))}</span>
        <span>${escapeHtml(note)}</span>
      </div>
      <h3>${escapeHtml(l(label))}</h3>
      <p class="ltr-text" dir="ltr">${escapeHtml(url)}</p>
      <small>${escapeHtml(l(check?.detail ?? "Release evidence records this endpoint as validated."))}</small>
    </article>
  `;
}

function releaseFact(label: string, value: string, status: string): string {
  const isUrl = value.startsWith("http");
  return `
    <div class="release-fact">
      <span>${escapeHtml(l(label))}</span>
      ${isUrl ? `<a href="${escapeAttribute(value)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>` : `<strong>${escapeHtml(value)}</strong>`}
      <em>${escapeHtml(l(status))}</em>
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
  if (!items?.length) return `<div class="empty-state compact"><i data-lucide="WifiOff"></i><p>${escapeHtml(l(empty))}</p></div>`;
  return `
    <div class="status-list">
      ${items.map((item) => `
        <article>
          <span class="status-pill ${statusClass(item.state)}">${escapeHtml(l(item.state))}</span>
          <div>
            <strong>${escapeHtml(l(item.label))}</strong>
            <a class="ltr-text" dir="ltr" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.url)}</a>
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
          <span class="status-pill ${check.status === "available" ? "success" : check.status === "missing" ? "warn" : "danger"}">${escapeHtml(l(check.status))}</span>
          <div>
            <strong>${escapeHtml(l(check.label))}</strong>
            <small>${escapeHtml(l(professionalAvailabilityDetail(check.status, check.detail)))}</small>
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
          <strong>${escapeHtml(l(professionalAllowlistLabel(label as BrowserApiClassification)))}</strong>
          <span>${escapeHtml(value)}</span>
        </article>
      `).join("")}
    </div>
  `;
}

function liveResultCard(result: LiveApiResult): string {
  return `
    <article class="live-result-card">
      <div class="module-card-top">
        <span class="status-pill ${statusClass(result.state)}">${escapeHtml(l(result.state))}</span>
        <span>${escapeHtml(result.httpStatus ? `HTTP ${result.httpStatus}` : l("No HTTP status"))}</span>
      </div>
      <h3 class="ltr-text" dir="ltr">${escapeHtml(result.method)} ${escapeHtml(result.url)}</h3>
      <p>${escapeHtml(l(result.detail))}</p>
      ${result.blockedReason ? `<p><strong>${escapeHtml(l("Blocked reason:"))}</strong> ${escapeHtml(l(result.blockedReason))}</p>` : ""}
      ${result.allowlistClassification ? `<p><strong>${escapeHtml(l("Allowlist:"))}</strong> ${escapeHtml(result.allowlistClassification)}</p>` : ""}
      <code>${escapeHtml(result.requestId)}</code>
      ${result.bodyPreview ? `<pre>${escapeHtml(result.bodyPreview)}</pre>` : ""}
    </article>
  `;
}

function resultItems(result: LiveApiResult | undefined): unknown[] {
  const body = asObject(result?.jsonBody);
  const data = asObject(body.data);
  return Array.isArray(data.items) ? data.items : [];
}

function readField(value: unknown, ...keys: string[]): unknown {
  const record = asObject(value);
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
}

function readNested(value: unknown, keys: string[]): unknown {
  let current = value;
  for (const key of keys) {
    current = asObject(current)[key];
    if (current === undefined || current === null) return undefined;
  }
  return current;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function metric(label: string, value: string, detail: string, icon: string, tone: "success" | "warn" | "info"): string {
  return `
    <article class="metric-card ${tone}">
      <i data-lucide="${icon}"></i>
      <div>
        <span>${escapeHtml(l(label))}</span>
        <strong>${escapeHtml(l(value))}</strong>
        <small>${escapeHtml(l(detail))}</small>
      </div>
    </article>
  `;
}

function linkLine(label: string, url: string): string {
  if (!url) return `<p class="link-line"><strong>${escapeHtml(l(label))}</strong><span>${escapeHtml(l("Not available"))}</span></p>`;
  return `<p class="link-line"><strong>${escapeHtml(l(label))}</strong><a class="ltr-text" dir="ltr" href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></p>`;
}

function runtimeCheckLinks(service: ServiceRecord): string {
  const checks = service.runtimeChecks.length > 0
    ? service.runtimeChecks
    : [
        { label: "Live", url: service.healthUrl },
        { label: "Ready", url: service.readinessUrl },
        { label: "Metrics", url: service.metricsUrl },
        { label: "OpenAPI", url: service.openApiUrl }
      ];
  return checks.map((check) => linkLine(check.label, check.url)).join("");
}

function requiredLabel(required: boolean): string {
  return required ? l("Required") : l("Optional");
}

function yesNo(value: boolean): string {
  return `<span class="yes-no ${value ? "yes" : "no"}">${escapeHtml(l(value ? "YES" : "NO"))}</span>`;
}

function statusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("pass") || normalized.includes("active") || normalized.includes("success") || normalized.includes("online")) return "success";
  if (normalized.includes("blocked") || normalized.includes("fail") || normalized.includes("offline")) return "danger";
  if (normalized.includes("unauthorized") || normalized.includes("unavailable")) return "danger";
  if (normalized.includes("documentation") || normalized.includes("evidence") || normalized.includes("pending") || normalized.includes("degraded")) return "warn";
  return "neutral";
}

function professionalModuleStatus(status: string): string {
  if (status === "Active API") return "Operational capability";
  if (status === "Evidence-backed") return "Evidence-backed";
  if (status === "Documentation-backed") return "Documentation-backed";
  return status;
}

function professionalAuthRecommendation(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized.includes("operator jwt") || normalized.includes("token")) return "Operator validation required";
  if (normalized.includes("available")) return "Provider sign-in available";
  return "Operator review required";
}

function professionalAvailabilityDetail(status: string, detail: string): string {
  if (status === "available") return "Available for approved provider sign-in.";
  if (status === "missing") return "Not currently exposed by the provider.";
  if (detail.toLowerCase().includes("failed") || detail.toLowerCase().includes("network")) {
    return "The system could not reach this provider check.";
  }
  return "Provider capability checked.";
}

function professionalAllowlistLabel(label: BrowserApiClassification): string {
  const labels: Record<BrowserApiClassification, string> = {
    ALLOWED_READ: "Approved read-only access",
    ALLOWED_LIVE_WRITE: "Approved live workflow access",
    ALLOWED_OPERATOR_TEST: "Operator test access",
    ALLOWED_OPERATOR_ACTION: "Operator action access",
    BLOCKED_WRITE: "Blocked unsafe write attempts",
    BLOCKED_CLINICAL_ACTION: "Blocked clinical action attempts",
    BLOCKED_ADMIN_DANGEROUS: "Blocked sensitive admin attempts",
    SERVER_ONLY: "Server-only operations",
    UNKNOWN: "Unrecognized browser requests"
  };
  return labels[label];
}

function pageTitle(route: string): string {
  const roleTitle = rolePageTitle(route, activeLocale);
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
