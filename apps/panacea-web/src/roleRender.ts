import { pageFromRoute, roleDefaultRoute, roleWorkspaces, workspaceFromRoute } from "./roleWorkspaces";
import { translate, type Locale } from "./locales";
import type { AppData, AuthSession, DataMode, LiveWorkspaceState, RoleMetric, RolePageDefinition, RolePanel, RoleWorkspaceDefinition } from "./types";

export interface RoleRenderContext {
  mode: DataMode;
  session?: AuthSession;
  workspaceState?: LiveWorkspaceState;
  locale?: Locale;
}

let activeLocale: Locale = "en";

function l(value: string | number | undefined): string {
  return translate(activeLocale, value);
}

export function renderRoleWorkspace(data: AppData, route: string, context: RoleRenderContext = { mode: "demo" }): string {
  activeLocale = context.locale ?? "en";
  const workspace = workspaceFromRoute(route) ?? roleWorkspaces[0];
  const page = pageFromRoute(route) ?? workspace.pages[0];
  const serviceSources = workspace.serviceIds
    .map((serviceId) => data.services.find((service) => service.id === serviceId))
    .filter((service): service is AppData["services"][number] => Boolean(service));
  const docCount = relatedDocCount(data, workspace);

  return `
    <div class="page-grid role-page" data-role="${workspace.id}">
      ${roleHeader(workspace, page, serviceSources.length, docCount, context)}
      <section class="role-shell">
        ${roleNavigation(workspace, page)}
        <div class="role-content">
          ${modeNotice(workspace, context)}
          ${roleLiveConnection(workspace, page, context)}
          ${roleMetrics(page)}
          ${roleMainPanels(workspace, page)}
          ${roleWorkflow(page)}
          ${roleTable(page, context.mode)}
          ${roleSourceSection(data, workspace, serviceSources)}
        </div>
      </section>
    </div>
  `;
}

export function rolePageTitle(route: string, locale: Locale = "en"): string | undefined {
  const workspace = workspaceFromRoute(route);
  const page = pageFromRoute(route);
  if (!workspace) return undefined;
  return page ? `${translate(locale, workspace.label)}: ${translate(locale, page.label)}` : translate(locale, workspace.title);
}

function roleHeader(workspace: RoleWorkspaceDefinition, page: RolePageDefinition, serviceCount: number, docCount: number, context: RoleRenderContext): string {
  const connection = workspaceConnectionStatus(context);
  return `
    <section class="page-header role-hero">
      <div>
        <p class="eyebrow">${escapeHtml(l(workspace.label))} ${escapeHtml(l("Workspace"))}</p>
        <h2>${escapeHtml(l(page.label))}</h2>
        <p>${escapeHtml(l(page.description))}</p>
        <div class="role-hero-facts">
          <span><i data-lucide="Database"></i>${serviceCount} ${escapeHtml(l("active source service(s)"))}</span>
          <span><i data-lucide="BookOpen"></i>${docCount} ${escapeHtml(l("related document(s)"))}</span>
          <span><i data-lucide="ShieldCheck"></i>${escapeHtml(l(workspace.boundary))}</span>
        </div>
      </div>
      <div class="header-status">
        <i data-lucide="${workspace.icon}"></i>
        <span>${escapeHtml(l(connection.label))}</span>
      </div>
    </section>
  `;
}

function roleNavigation(workspace: RoleWorkspaceDefinition, activePage: RolePageDefinition): string {
  return `
    <aside class="role-nav" aria-label="${escapeAttribute(l(workspace.label))} ${escapeAttribute(l("workspace navigation"))}">
      <div class="role-nav-title">
        <i data-lucide="${workspace.icon}"></i>
        <div>
          <strong>${escapeHtml(l(workspace.title))}</strong>
          <span>${escapeHtml(l(workspace.audience))}</span>
        </div>
      </div>
      <nav>
        ${workspace.pages.map((page) => `
          <a class="${page.id === activePage.id ? "active" : ""}" href="#${page.route}">
            <i data-lucide="${page.icon}"></i>
            <span>${escapeHtml(l(page.label))}</span>
          </a>
        `).join("")}
      </nav>
    </aside>
  `;
}

function modeNotice(workspace: RoleWorkspaceDefinition, context: RoleRenderContext): string {
  if (context.mode === "live" && context.session) {
    return `
      <section class="demo-notice live">
        <i data-lucide="ShieldCheck"></i>
        <div>
          <strong>${escapeHtml(l("LIVE MODE -- AUTHENTICATED READ-ONLY SESSION"))}</strong>
          <p>${escapeHtml(l("User"))} ${escapeHtml(context.session.displayName)} ${escapeHtml(l("is scoped to role"))} ${escapeHtml(l(context.session.role))} ${escapeHtml(l("and tenant"))} ${escapeHtml(context.session.tenantId)}. ${escapeHtml(l("Demo role switching is disabled for this session."))}</p>
        </div>
      </section>
    `;
  }
  return `
    <section class="demo-notice">
      <i data-lucide="Info"></i>
      <div>
        <strong>${escapeHtml(l("DEMO DATA -- NOT REAL PATIENT DATA"))}</strong>
        <p>${escapeHtml(l(workspace.dataMode))} ${escapeHtml(l("Demo Role Switcher is for presentation only and does not bypass real security in production."))}</p>
      </div>
    </section>
  `;
}

function roleLiveConnection(workspace: RoleWorkspaceDefinition, page: RolePageDefinition, context: RoleRenderContext): string {
  const connection = workspaceConnectionStatus(context);
  if (context.mode !== "live") {
    return `
      <section class="band live-connection">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Live Data Connection"))}</h2>
            <p>${escapeHtml(l("Data source:"))} ${escapeHtml(l(page.source))}. ${escapeHtml(l("Demo Mode is active. Open Foundation Login and provide a valid JWT to execute read-only API checks."))}</p>
          </div>
          <span class="status-pill ${connection.className}">${escapeHtml(l(connection.label))}</span>
          <a class="button compact" href="#/auth/login"><i data-lucide="KeyRound"></i> ${escapeHtml(l("Foundation Login"))}</a>
        </div>
      </section>
    `;
  }
  const state = context.workspaceState;
  if (!state) {
    return `
      <section class="band live-connection">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Live Data Connection"))}</h2>
            <p>${escapeHtml(l("Data source:"))} ${escapeHtml(l(page.source))}. ${escapeHtml(l("Waiting for read-only API evaluation for this workspace page."))}</p>
          </div>
          <span class="status-pill ${connection.className}">${escapeHtml(l(connection.label))}</span>
        </div>
      </section>
    `;
  }
  return `
    <section class="band live-connection">
      <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Live Data Connection"))}</h2>
            <p>${escapeHtml(l("Data source:"))} ${escapeHtml(l(page.source))}. ${escapeHtml(l(state.endpoint.reason))}</p>
        </div>
        <span class="status-pill ${connection.className}">${escapeHtml(l(connection.label))}</span>
      </div>
      <div class="role-source-grid">
        <div class="source-list">
          <article>
            <strong>${escapeHtml(l(state.endpoint.label))}</strong>
            <span class="ltr-text" dir="ltr">${escapeHtml(state.endpoint.url || l("Live API unavailable"))}</span>
            <span class="ltr-text" dir="ltr">${escapeHtml(state.endpoint.source)}</span>
          </article>
        </div>
        <div class="source-list">
          ${state.result ? `
            <article>
              <strong>${escapeHtml(state.result.httpStatus ? `HTTP ${state.result.httpStatus}` : state.result.state)}</strong>
              <span>${escapeHtml(l(state.result.detail))}</span>
              ${state.result.blockedReason ? `<span>${escapeHtml(l(state.result.blockedReason))}</span>` : ""}
              ${state.result.allowlistClassification ? `<span>${escapeHtml(state.result.allowlistClassification)}</span>` : ""}
              <span class="ltr-text" dir="ltr">${escapeHtml(state.result.requestId)}</span>
            </article>
          ` : `<article><strong>${escapeHtml(l("No response yet"))}</strong><span>${escapeHtml(l("Refresh or navigate to retry read-only API execution."))}</span></article>`}
        </div>
      </div>
      ${state.auditAction ? auditAction(state.auditAction) : ""}
    </section>
  `;
}

function roleMetrics(page: RolePageDefinition): string {
  return `
    <section class="metric-grid role-metrics">
      ${page.metrics.map((metric) => `
        <article class="metric-card ${metric.tone}">
          <i data-lucide="${metricIcon(metric)}"></i>
          <div>
            <span>${escapeHtml(l(metric.label))}</span>
            <strong>${escapeHtml(l(metric.value))}</strong>
            <small>${escapeHtml(l(metric.detail))}</small>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

function roleMainPanels(workspace: RoleWorkspaceDefinition, page: RolePageDefinition): string {
  return `
    <section class="role-dashboard-grid">
      <article class="band role-detail-panel">
        <div class="section-title">
          <div>
          <h2>${escapeHtml(l(page.label))} ${escapeHtml(l("Detail"))}</h2>
          <p>${escapeHtml(l(page.safetyNote))}</p>
        </div>
          <span class="status-pill warn">${escapeHtml(l("Read-only"))}</span>
        </div>
        <div class="role-panel-grid">
          ${page.panels.map((panel) => rolePanel(panel)).join("")}
        </div>
      </article>
      <article class="band">
        <h2>${escapeHtml(l("Workspace Readiness"))}</h2>
        <p>${escapeHtml(l(workspace.summary))}</p>
        <div class="bar-list">
          ${page.chart.map((item) => chartBar(item)).join("")}
        </div>
      </article>
    </section>
  `;
}

function rolePanel(panel: RolePanel): string {
  return `
    <div class="role-panel">
      <span class="status-pill ${statusClass(panel.status)}">${escapeHtml(l(panel.status))}</span>
      <h3>${escapeHtml(l(panel.title))}</h3>
      <p>${escapeHtml(l(panel.detail))}</p>
    </div>
  `;
}

function roleWorkflow(page: RolePageDefinition): string {
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("Workflow Timeline"))}</h2>
          <p>${escapeHtml(l("Workflow visualization uses documented/API-backed state. Live execution is unavailable in this UI sprint."))}</p>
        </div>
      </div>
      <ol class="timeline">
        ${page.workflow.map((step, index) => `
          <li>
            <span>${index + 1}</span>
            <p>${escapeHtml(l(step))}</p>
          </li>
        `).join("")}
      </ol>
    </section>
  `;
}

function roleTable(page: RolePageDefinition, mode: DataMode): string {
  if (mode === "live") {
    return `
      <section class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l(page.label))} ${escapeHtml(l("Worklist"))}</h2>
            <p>${escapeHtml(l("Demo rows are hidden in Live Mode. Real records appear only when an existing authenticated read-only API returns data."))}</p>
          </div>
          <span class="status-pill warn">${escapeHtml(l("LIVE API UNAVAILABLE"))}</span>
        </div>
        <div class="empty-state compact">
          <i data-lucide="DatabaseZap"></i>
          <p>${escapeHtml(l("No live records are displayed for this workspace page."))}</p>
        </div>
      </section>
    `;
  }
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l(page.label))} ${escapeHtml(l("Worklist"))}</h2>
          <p>${escapeHtml(l("Rows are UI-state examples and source labels only, not real patient records."))}</p>
        </div>
        <span class="status-pill warn">${escapeHtml(l("Live data unavailable"))}</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>${page.table.columns.map((column) => `<th>${escapeHtml(l(column))}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${page.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(l(cell))}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function auditAction(action: NonNullable<LiveWorkspaceState["auditAction"]>): string {
  return `
    <div class="audit-strip">
      <span><strong>${escapeHtml(l("User"))}</strong>${escapeHtml(action.user)}</span>
      <span><strong>${escapeHtml(l("Role"))}</strong>${escapeHtml(l(action.role))}</span>
      <span><strong>${escapeHtml(l("Tenant"))}</strong>${escapeHtml(action.tenant)}</span>
      <span><strong>${escapeHtml(l("Request"))}</strong>${escapeHtml(action.requestId)}</span>
      <span><strong>${escapeHtml(l("Status"))}</strong>${escapeHtml(l(action.status))}</span>
      <span><strong>${escapeHtml(l("Time"))}</strong>${escapeHtml(action.timestamp)}</span>
    </div>
  `;
}

function roleSourceSection(data: AppData, workspace: RoleWorkspaceDefinition, serviceSources: NonNullable<AppData["services"][number]>[]): string {
  const docs = data.documents.filter((doc) => workspace.docHints.some((hint) => {
    const normalized = hint.toLowerCase();
    return doc.title.toLowerCase().includes(normalized) || doc.relativePath.toLowerCase().includes(normalized) || doc.body.toLowerCase().includes(normalized);
  })).slice(0, 8);

  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("API And Documentation Sources"))}</h2>
          <p>${escapeHtml(l(workspace.dataMode))}</p>
        </div>
        <a class="button compact" href="#/developer/api-explorer"><i data-lucide="Braces"></i> ${escapeHtml(l("API Explorer"))}</a>
      </div>
      <div class="role-source-grid">
        <div>
          <h3>${escapeHtml(l("OpenAPI-backed services"))}</h3>
          <div class="source-list">
            ${serviceSources.length ? serviceSources.map((service) => `
              <article>
                <strong>${escapeHtml(l(service.title))}</strong>
                <span class="ltr-text" dir="ltr">${escapeHtml(service.apiBase)} · ${service.pathCount} ${escapeHtml(l("paths"))} · ${escapeHtml(l("port"))} ${escapeHtml(service.localPort)}</span>
              </article>
            `).join("") : `<article><strong>${escapeHtml(l("No active service mapped"))}</strong><span>${escapeHtml(l("Coverage is documentation-backed in this checkout."))}</span></article>`}
          </div>
        </div>
        <div>
          <h3>${escapeHtml(l("Related documents"))}</h3>
          <div class="source-list">
            ${docs.length ? docs.map((doc) => `
              <article>
                <strong>${escapeHtml(l(doc.title))}</strong>
                <span class="ltr-text" dir="ltr">${escapeHtml(doc.relativePath)}</span>
              </article>
            `).join("") : `<article><strong>${escapeHtml(l("No matching document found"))}</strong><span>${escapeHtml(l("Review Documentation Center for all available docs."))}</span></article>`}
          </div>
        </div>
      </div>
    </section>
  `;
}

function chartBar(metric: RoleMetric): string {
  const numericValue = Number.parseInt(metric.value, 10);
  const width = Number.isFinite(numericValue) ? Math.max(0, Math.min(100, numericValue)) : 0;
  return `
    <div class="bar-row">
      <div>
        <strong>${escapeHtml(l(metric.label))}</strong>
        <span>${escapeHtml(l(metric.detail))}</span>
      </div>
      <div class="bar-track" aria-label="${escapeAttribute(metric.label)} ${width}%">
        <span class="${metric.tone}" style="width:${width}%"></span>
      </div>
      <em>${width}%</em>
    </div>
  `;
}

function relatedDocCount(data: AppData, workspace: RoleWorkspaceDefinition): number {
  return data.documents.filter((doc) => workspace.docHints.some((hint) => {
    const normalized = hint.toLowerCase();
    return doc.title.toLowerCase().includes(normalized) || doc.relativePath.toLowerCase().includes(normalized) || doc.body.toLowerCase().includes(normalized);
  })).length;
}

function metricIcon(metric: RoleMetric): string {
  if (metric.tone === "success") return "CheckCircle2";
  if (metric.tone === "warn") return "TriangleAlert";
  return "Gauge";
}

function statusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("unavailable") || normalized.includes("unauthorized")) return "danger";
  if (normalized.includes("cors") || normalized.includes("auth")) return "danger";
  if (normalized.includes("connected") || normalized.includes("online") || normalized.includes("available")) return "success";
  if (normalized.includes("action")) return "danger";
  if (normalized.includes("partial") || normalized.includes("demo") || normalized.includes("documentation") || normalized.includes("pending") || normalized.includes("degraded")) return "warn";
  return "neutral";
}

function workspaceConnectionStatus(context: RoleRenderContext): { label: string; className: string } {
  if (context.mode !== "live") {
    return { label: "DEMO MODE", className: "warn" };
  }
  const state = context.workspaceState;
  if (!state) {
    return { label: "LIVE PARTIAL", className: "warn" };
  }
  if (!state.endpoint.available) {
    return { label: "LIVE API UNAVAILABLE", className: "warn" };
  }
  const result = state.result;
  if (!result) {
    return { label: "LIVE PARTIAL", className: "warn" };
  }
  if (result.httpStatus === 401 || result.httpStatus === 403 || result.state === "unauthorized") {
    return { label: "BLOCKED BY AUTH", className: "danger" };
  }
  if (result.state === "unavailable") {
    const detail = `${result.detail} ${result.blockedReason ?? ""}`.toLowerCase();
    if (detail.includes("cors") || detail.includes("failed to fetch")) {
      return { label: "BLOCKED BY CORS", className: "danger" };
    }
    return { label: "LIVE API UNAVAILABLE", className: "warn" };
  }
  if (result.state === "online") {
    const runtimeOnly = /\/(live|ready|metrics)$|\/docs\/openapi\.json$/.test(state.endpoint.url);
    return runtimeOnly
      ? { label: "LIVE PARTIAL", className: "warn" }
      : { label: "LIVE CONNECTED", className: "success" };
  }
  return { label: "LIVE PARTIAL", className: "warn" };
}

export function isRoleRoute(route: string): boolean {
  return Boolean(workspaceFromRoute(route));
}

export function routeForRole(roleId: string): string {
  return roleDefaultRoute(roleId as Parameters<typeof roleDefaultRoute>[0]);
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
