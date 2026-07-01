import { pageFromRoute, roleDefaultRoute, roleWorkspaces, workspaceFromRoute } from "./roleWorkspaces";
import type { AppData, AuthSession, DataMode, LiveWorkspaceState, RoleMetric, RolePageDefinition, RolePanel, RoleWorkspaceDefinition } from "./types";

export interface RoleRenderContext {
  mode: DataMode;
  session?: AuthSession;
  workspaceState?: LiveWorkspaceState;
}

export function renderRoleWorkspace(data: AppData, route: string, context: RoleRenderContext = { mode: "demo" }): string {
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
          ${roleLiveConnection(context)}
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

export function rolePageTitle(route: string): string | undefined {
  const workspace = workspaceFromRoute(route);
  const page = pageFromRoute(route);
  if (!workspace) return undefined;
  return page ? `${workspace.label}: ${page.label}` : workspace.title;
}

function roleHeader(workspace: RoleWorkspaceDefinition, page: RolePageDefinition, serviceCount: number, docCount: number, context: RoleRenderContext): string {
  return `
    <section class="page-header role-hero">
      <div>
        <p class="eyebrow">${escapeHtml(workspace.label)} Workspace</p>
        <h2>${escapeHtml(page.label)}</h2>
        <p>${escapeHtml(page.description)}</p>
        <div class="role-hero-facts">
          <span><i data-lucide="Database"></i>${serviceCount} active source service(s)</span>
          <span><i data-lucide="BookOpen"></i>${docCount} related document(s)</span>
          <span><i data-lucide="ShieldCheck"></i>${escapeHtml(workspace.boundary)}</span>
        </div>
      </div>
      <div class="header-status">
        <i data-lucide="${workspace.icon}"></i>
        <span>${context.mode === "live" ? "LIVE DATA MODE" : escapeHtml(workspace.dataMode)}</span>
      </div>
    </section>
  `;
}

function roleNavigation(workspace: RoleWorkspaceDefinition, activePage: RolePageDefinition): string {
  return `
    <aside class="role-nav" aria-label="${escapeAttribute(workspace.label)} workspace navigation">
      <div class="role-nav-title">
        <i data-lucide="${workspace.icon}"></i>
        <div>
          <strong>${escapeHtml(workspace.title)}</strong>
          <span>${escapeHtml(workspace.audience)}</span>
        </div>
      </div>
      <nav>
        ${workspace.pages.map((page) => `
          <a class="${page.id === activePage.id ? "active" : ""}" href="#${page.route}">
            <i data-lucide="${page.icon}"></i>
            <span>${escapeHtml(page.label)}</span>
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
          <strong>LIVE MODE -- AUTHENTICATED READ-ONLY SESSION</strong>
          <p>User ${escapeHtml(context.session.displayName)} is scoped to role ${escapeHtml(context.session.role)} and tenant ${escapeHtml(context.session.tenantId)}. Demo role switching is disabled for this session.</p>
        </div>
      </section>
    `;
  }
  return `
    <section class="demo-notice">
      <i data-lucide="Info"></i>
      <div>
        <strong>DEMO DATA -- NOT REAL PATIENT DATA</strong>
        <p>${escapeHtml(workspace.dataMode)} Demo Role Switcher is for presentation only and does not bypass real security in production.</p>
      </div>
    </section>
  `;
}

function roleLiveConnection(context: RoleRenderContext): string {
  if (context.mode !== "live") {
    return `
      <section class="band live-connection">
        <div class="section-title">
          <div>
            <h2>Live Data Connection</h2>
            <p>Demo Mode is active. Open Foundation Login and provide a valid JWT to execute read-only API checks.</p>
          </div>
          <a class="button compact" href="#/auth/login"><i data-lucide="KeyRound"></i> Foundation Login</a>
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
            <h2>Live Data Connection</h2>
            <p>Waiting for read-only API evaluation for this workspace page.</p>
          </div>
          <span class="status-pill warn">Pending</span>
        </div>
      </section>
    `;
  }
  return `
    <section class="band live-connection">
      <div class="section-title">
        <div>
          <h2>Live Data Connection</h2>
          <p>${escapeHtml(state.endpoint.reason)}</p>
        </div>
        <span class="status-pill ${statusClass(state.result?.state ?? (state.endpoint.available ? "pending" : "unavailable"))}">${escapeHtml(state.result?.state ?? (state.endpoint.available ? "pending" : "unavailable"))}</span>
      </div>
      <div class="role-source-grid">
        <div class="source-list">
          <article>
            <strong>${escapeHtml(state.endpoint.label)}</strong>
            <span>${escapeHtml(state.endpoint.url || "Live API unavailable")}</span>
            <span>${escapeHtml(state.endpoint.source)}</span>
          </article>
        </div>
        <div class="source-list">
          ${state.result ? `
            <article>
              <strong>${escapeHtml(state.result.httpStatus ? `HTTP ${state.result.httpStatus}` : state.result.state)}</strong>
              <span>${escapeHtml(state.result.detail)}</span>
              ${state.result.blockedReason ? `<span>${escapeHtml(state.result.blockedReason)}</span>` : ""}
              ${state.result.allowlistClassification ? `<span>${escapeHtml(state.result.allowlistClassification)}</span>` : ""}
              <span>${escapeHtml(state.result.requestId)}</span>
            </article>
          ` : `<article><strong>No response yet</strong><span>Refresh or navigate to retry read-only API execution.</span></article>`}
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
            <span>${escapeHtml(metric.label)}</span>
            <strong>${escapeHtml(metric.value)}</strong>
            <small>${escapeHtml(metric.detail)}</small>
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
            <h2>${escapeHtml(page.label)} Detail</h2>
            <p>${escapeHtml(page.safetyNote)}</p>
          </div>
          <span class="status-pill warn">Read-only</span>
        </div>
        <div class="role-panel-grid">
          ${page.panels.map((panel) => rolePanel(panel)).join("")}
        </div>
      </article>
      <article class="band">
        <h2>Workspace Readiness</h2>
        <p>${escapeHtml(workspace.summary)}</p>
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
      <span class="status-pill ${statusClass(panel.status)}">${escapeHtml(panel.status)}</span>
      <h3>${escapeHtml(panel.title)}</h3>
      <p>${escapeHtml(panel.detail)}</p>
    </div>
  `;
}

function roleWorkflow(page: RolePageDefinition): string {
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>Workflow Timeline</h2>
          <p>Workflow visualization uses documented/API-backed state. Live execution is unavailable in this UI sprint.</p>
        </div>
      </div>
      <ol class="timeline">
        ${page.workflow.map((step, index) => `
          <li>
            <span>${index + 1}</span>
            <p>${escapeHtml(step)}</p>
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
            <h2>${escapeHtml(page.label)} Worklist</h2>
            <p>Demo rows are hidden in Live Mode. Real records appear only when an existing authenticated read-only API returns data.</p>
          </div>
          <span class="status-pill warn">Live API unavailable</span>
        </div>
        <div class="empty-state compact">
          <i data-lucide="DatabaseZap"></i>
          <p>No live records are displayed for this workspace page.</p>
        </div>
      </section>
    `;
  }
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(page.label)} Worklist</h2>
          <p>Rows are UI-state examples and source labels only, not real patient records.</p>
        </div>
        <span class="status-pill warn">Live data unavailable</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>${page.table.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${page.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function auditAction(action: NonNullable<LiveWorkspaceState["auditAction"]>): string {
  return `
    <div class="audit-strip">
      <span><strong>User</strong>${escapeHtml(action.user)}</span>
      <span><strong>Role</strong>${escapeHtml(action.role)}</span>
      <span><strong>Tenant</strong>${escapeHtml(action.tenant)}</span>
      <span><strong>Request</strong>${escapeHtml(action.requestId)}</span>
      <span><strong>Status</strong>${escapeHtml(action.status)}</span>
      <span><strong>Time</strong>${escapeHtml(action.timestamp)}</span>
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
          <h2>API And Documentation Sources</h2>
          <p>${escapeHtml(workspace.dataMode)}</p>
        </div>
        <a class="button compact" href="#/developer/api-explorer"><i data-lucide="Braces"></i> API Explorer</a>
      </div>
      <div class="role-source-grid">
        <div>
          <h3>OpenAPI-backed services</h3>
          <div class="source-list">
            ${serviceSources.length ? serviceSources.map((service) => `
              <article>
                <strong>${escapeHtml(service.title)}</strong>
                <span>${escapeHtml(service.apiBase)} · ${service.pathCount} paths · port ${escapeHtml(service.localPort)}</span>
              </article>
            `).join("") : `<article><strong>No active service mapped</strong><span>Coverage is documentation-backed in this checkout.</span></article>`}
          </div>
        </div>
        <div>
          <h3>Related documents</h3>
          <div class="source-list">
            ${docs.length ? docs.map((doc) => `
              <article>
                <strong>${escapeHtml(doc.title)}</strong>
                <span>${escapeHtml(doc.relativePath)}</span>
              </article>
            `).join("") : `<article><strong>No matching document found</strong><span>Review Documentation Center for all available docs.</span></article>`}
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
        <strong>${escapeHtml(metric.label)}</strong>
        <span>${escapeHtml(metric.detail)}</span>
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
  if (normalized.includes("online") || normalized.includes("available")) return "success";
  if (normalized.includes("action")) return "danger";
  if (normalized.includes("documentation") || normalized.includes("pending") || normalized.includes("degraded")) return "warn";
  return "neutral";
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
