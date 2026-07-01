import { pageFromRoute, roleDefaultRoute, roleWorkspaces, workspaceFromRoute } from "./roleWorkspaces";
import { translate, type Locale } from "./locales";
import {
  DEMO_DATA_LABEL,
  DEMO_DATA_LABEL_DISPLAY,
  demoAuditLogs,
  demoHospital,
  demoInventory,
  demoLabOrders,
  demoMedicationCatalog,
  demoPatients,
  demoPharmacyRecords,
  demoRadiologyStudies,
  demoSystemHealth,
  demoUsers,
  findDemoPatient,
  type DemoPatient,
  type DemoSeverity
} from "./demoData";
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
          ${roleOperationalDemo(data, route, workspace, page, context)}
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
        <strong>${escapeHtml(l(DEMO_DATA_LABEL))}</strong>
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

function roleOperationalDemo(data: AppData, route: string, workspace: RoleWorkspaceDefinition, page: RolePageDefinition, context: RoleRenderContext): string {
  if (context.mode === "live") return `${roleLiveReadModel(workspace, page, context)}${roleLiveWriteWorkflow(workspace, page, context)}`;
  const source = demoSourceBanner(context);
  const writeBoundary = roleDemoWriteBoundary(workspace, page);
  if (workspace.id === "doctor") return `${source}${writeBoundary}${doctorExperience(route, page)}`;
  if (workspace.id === "patient") return `${source}${writeBoundary}${patientPortalExperience(page)}`;
  if (workspace.id === "laboratory") return `${source}${writeBoundary}${laboratoryExperience(page)}`;
  if (workspace.id === "radiology") return `${source}${writeBoundary}${radiologyExperience(page)}`;
  if (workspace.id === "pharmacy") return `${source}${writeBoundary}${pharmacyExperience(page)}`;
  if (workspace.id === "administrator") return `${source}${writeBoundary}${adminExperience(data, page)}`;
  return source;
}

function roleLiveReadModel(workspace: RoleWorkspaceDefinition, page: RolePageDefinition, context: RoleRenderContext): string {
  const state = context.workspaceState;
  if (!state) {
    return liveReadModelShell(page, "Awaiting backend read model", "The browser is preparing the authenticated read-only request for this workspace page.", "warn");
  }
  if (!state.result) {
    return liveReadModelShell(page, "Awaiting backend response", "Navigate or refresh to execute the selected read-only backend request.", "warn");
  }
  const result = state.result;
  if (result.state !== "online") {
    return liveReadModelShell(
      page,
      result.httpStatus ? `HTTP ${result.httpStatus}` : result.state,
      result.blockedReason || result.detail,
      statusClass(result.state)
    );
  }
  const readModel = extractReadModelPayload(result.jsonBody);
  if (!readModel || readModel.demoData !== false) {
    return liveReadModelShell(
      page,
      "Backend read model unavailable",
      "The live endpoint responded, but did not return the expected read-model contract with demoData false.",
      "warn",
      result.bodyPreview
    );
  }
  const items = Array.isArray(readModel.items) ? readModel.items : [];
  const summary = [
    metricMini("Live rows", String(items.length), "Tenant-scoped backend rows"),
    metricMini("Tenant", String(readModel.tenantId ?? context.session?.tenantId ?? "Unknown"), "Authenticated scope"),
    metricMini("Model", String(readModel.modelKey ?? page.id), String(readModel.workspace ?? workspace.id))
  ].join("");

  return `
    <section class="band live-read-model">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l(page.label))} ${escapeHtml(l("Live Read Model"))}</h2>
          <p>${escapeHtml(l("Live Mode displays only authenticated backend read-model responses. Demo rows are not mixed with live data."))}</p>
        </div>
        <span class="status-pill success">${escapeHtml(l("LIVE READ MODEL"))}</span>
      </div>
      <div class="metric-grid">${summary}</div>
      ${items.length ? liveReadModelTable(items) : `
        <div class="empty-state compact">
          <i data-lucide="Database"></i>
          <p>${escapeHtml(l("The backend returned zero tenant-scoped records for this read model."))}</p>
        </div>
      `}
    </section>
  `;
}

function liveReadModelShell(page: RolePageDefinition, title: string, detail: string, tone: string, preview = ""): string {
  return `
    <section class="band live-read-model">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l(page.label))} ${escapeHtml(l("Live Read Model"))}</h2>
          <p>${escapeHtml(l("Live Mode displays only authenticated backend read-model responses. Demo rows are not mixed with live data."))}</p>
        </div>
        <span class="status-pill ${escapeAttribute(tone)}">${escapeHtml(l(title))}</span>
      </div>
      <div class="empty-state compact">
        <i data-lucide="DatabaseZap"></i>
        <p>${escapeHtml(l(detail))}</p>
        ${preview ? `<small class="ltr-text" dir="ltr">${escapeHtml(preview)}</small>` : ""}
      </div>
    </section>
  `;
}

function liveReadModelTable(items: unknown[]): string {
  const rows = items.map((item) => {
    const record = asRecord(item);
    return [
      String(record.title ?? record.id ?? "Untitled"),
      String(record.status ?? "active"),
      String(record.subjectId ?? "collection"),
      String(record.updatedAt ?? ""),
      formatPayloadPreview(record.payload)
    ];
  });
  return simpleTable(["Title", "Status", "Subject", "Updated", "Payload"], rows);
}

function roleLiveWriteWorkflow(workspace: RoleWorkspaceDefinition, page: RolePageDefinition, context: RoleRenderContext): string {
  const state = context.workspaceState;
  const endpoint = state?.writeEndpoint;
  if (!endpoint || !endpoint.url) {
    return `
      <section class="band live-write-workflow">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l("Transactional Write Workflow"))}</h2>
            <p>${escapeHtml(l(endpoint?.reason ?? "This page has no approved live write workflow."))}</p>
          </div>
          <span class="status-pill warn">${escapeHtml(l("Read-only"))}</span>
        </div>
      </section>
    `;
  }
  return `
    <section class="band live-write-workflow">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("Transactional Write Workflow"))}</h2>
          <p>${escapeHtml(l("Live writes require Foundation authentication, tenant isolation, RBAC/ABAC, validation, audit, and event outbox persistence."))}</p>
        </div>
        <span class="status-pill ${endpoint.available ? "success" : "warn"}">${escapeHtml(l(endpoint.available ? "LIVE WRITE READY" : "LIVE WRITE UNAVAILABLE"))}</span>
      </div>
      <div class="role-source-grid">
        <article class="source-list">
          <strong>${escapeHtml(l(endpoint.label))}</strong>
          <span class="ltr-text" dir="ltr">${escapeHtml(endpoint.url)}</span>
          <span class="ltr-text" dir="ltr">${escapeHtml(endpoint.source)}</span>
          <span>${escapeHtml(l("No autonomous diagnosis. No autonomous treatment. Human approval remains mandatory."))}</span>
        </article>
        <article class="source-list">
          <strong>${escapeHtml(l("Write Boundary"))}</strong>
          <span>${escapeHtml(l("Only approved Sprint 113 transactional forms can submit POST requests from the browser."))}</span>
          <span>${escapeHtml(l("Unknown or dangerous browser writes remain blocked by the allowlist."))}</span>
          <span>${escapeHtml(l(workspace.boundary))}</span>
        </article>
      </div>
      <form id="live-write-form" class="live-write-form" data-workflow-url="${escapeAttribute(endpoint.url)}">
        <label>
          <span>${escapeHtml(l("Title"))}</span>
          <input id="live-write-title" name="title" required maxlength="160" value="${escapeAttribute(page.label)}" />
        </label>
        <label>
          <span>${escapeHtml(l("Subject ID"))}</span>
          <input id="live-write-subject" name="subjectId" maxlength="160" value="${escapeAttribute(defaultSubjectForPage(page))}" />
        </label>
        <label>
          <span>${escapeHtml(l("Reason"))}</span>
          <input id="live-write-reason" name="reason" maxlength="500" value="${escapeAttribute(`Live ${page.label} workflow`)}" />
        </label>
        <label class="wide">
          <span>${escapeHtml(l("Payload Detail"))}</span>
          <textarea id="live-write-detail" name="detail" required maxlength="1000">${escapeHtml(`Authenticated ${page.label} transaction from Panacea OS web workspace`)}</textarea>
        </label>
        <div class="write-control-list">
          ${[
            "Live Mode only",
            "Tenant isolation confirmed",
            "Audit required",
            "Human user confirmed",
            "No autonomous diagnosis",
            "No autonomous treatment"
          ].map((item) => `<span><i data-lucide="ShieldCheck"></i>${escapeHtml(l(item))}</span>`).join("")}
        </div>
        <button class="button primary" type="submit" ${endpoint.available ? "" : "disabled"}>
          <i data-lucide="Send"></i>
          ${escapeHtml(l("Submit Live Write"))}
        </button>
      </form>
      ${state?.writeResult ? liveWriteResult(state.writeResult) : ""}
      ${state?.writeAuditAction ? auditAction(state.writeAuditAction) : ""}
    </section>
  `;
}

function roleDemoWriteBoundary(_workspace: RoleWorkspaceDefinition, _page: RolePageDefinition): string {
  return `
    <section class="band live-write-workflow demo-write-boundary">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("Transactional Write Workflow"))}</h2>
          <p>${escapeHtml(l("Demo action only — not persisted to production backend"))}</p>
        </div>
        <span class="status-pill warn">${escapeHtml(l("DEMO MODE"))}</span>
      </div>
      <div class="empty-state compact">
        <i data-lucide="DatabaseZap"></i>
        <p>${escapeHtml(l("إجراء تجريبي فقط — لا يتم حفظه في قاعدة الإنتاج"))}</p>
        <small>${escapeHtml(l("Sign in with a Foundation-issued token to enable approved Sprint 113 live write workflows."))}</small>
      </div>
    </section>
  `;
}

function liveWriteResult(result: NonNullable<LiveWorkspaceState["writeResult"]>): string {
  const record = extractWriteRecord(result.jsonBody);
  return `
    <div class="live-write-result ${result.state}">
      <strong>${escapeHtml(result.httpStatus ? `HTTP ${result.httpStatus}` : result.state)}</strong>
      <span>${escapeHtml(l(result.detail))}</span>
      ${result.blockedReason ? `<span>${escapeHtml(l(result.blockedReason))}</span>` : ""}
      ${record ? `
        <span>${escapeHtml(l("Persisted workflow"))}: ${escapeHtml(String(record.workflowKey ?? "accepted"))}</span>
        <span>${escapeHtml(l("Event"))}: ${escapeHtml(String(record.eventType ?? ""))}</span>
      ` : ""}
      <span class="ltr-text" dir="ltr">${escapeHtml(result.requestId)}</span>
    </div>
  `;
}

function extractWriteRecord(value: unknown): Record<string, unknown> | undefined {
  const envelope = asRecord(value);
  const data = asRecord(envelope.data);
  return Object.keys(data).length ? data : undefined;
}

function defaultSubjectForPage(page: RolePageDefinition): string {
  if (page.route.includes("/patient/")) return "patient-self";
  if (page.route.includes("/laboratory/")) return "current-specimen";
  if (page.route.includes("/radiology/")) return "current-study";
  if (page.route.includes("/pharmacy/")) return "current-prescription";
  if (page.route.includes("/administrator/")) return "current-admin-resource";
  return "current-patient";
}

function extractReadModelPayload(value: unknown): Record<string, unknown> | undefined {
  const envelope = asRecord(value);
  const data = asRecord(envelope.data);
  return Object.keys(data).length ? data : undefined;
}

function formatPayloadPreview(value: unknown): string {
  const payload = asRecord(value);
  const entries = Object.entries(payload).slice(0, 4);
  if (entries.length === 0) return "No payload fields";
  return entries.map(([key, item]) => `${key}: ${typeof item === "object" ? JSON.stringify(item) : String(item)}`).join(" | ");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function demoSourceBanner(context: RoleRenderContext): string {
  const status = context.mode === "live" ? "LIVE PARTIAL" : "DEMO DATA";
  const detail = context.mode === "live"
    ? "Live API was evaluated where allowed. These records are frontend demo fallback data and are not persisted to the production backend."
    : "Frontend demo seed data. These records are synthetic and are not real patient data.";
  return `
    <section class="demo-data-banner">
      <div>
        <strong>${escapeHtml(l(DEMO_DATA_LABEL_DISPLAY))}</strong>
        <p>${escapeHtml(l(detail))}</p>
      </div>
      <span class="status-pill warn">${escapeHtml(l(status))}</span>
    </section>
  `;
}

function doctorExperience(route: string, page: RolePageDefinition): string {
  const patient = findDemoPatient(route.split("/")[4]);
  if (page.id === "dashboard") {
    return `
      <section class="operational-grid two-column">
        ${patientSearchPanel("Doctor Patient Search", "Search by synthetic MRN, name, ward, or risk status.")}
        ${clinicalAlertsPanel()}
      </section>
      ${patientChart(patient, "clinical-summary")}
    `;
  }
  if (page.id === "patient-search") return patientSearchPanel("Patient Search", "Click a synthetic patient to open a complete demo chart.", true);
  if (["patient-profile", "clinical-timeline", "allergies", "conditions", "medications", "vital-signs", "encounters", "clinical-notes", "lab-results", "radiology-reports", "pharmacy-review", "ai-recommendations", "clinical-alerts", "care-team"].includes(page.id)) {
    return patientChart(patient, page.id);
  }
  if (page.id === "orders-overview") return ordersPanel(patient);
  if (page.id === "task-list") return taskPanel(patient);
  return patientChart(patient, "clinical-summary");
}

function patientPortalExperience(page: RolePageDefinition): string {
  const patient = demoPatients[0];
  const portalCards = [
    ["Next appointment", patient.appointments[0].date, patient.appointments[0].clinic],
    ["Medication count", String(patient.medications.length), "Review with your care team"],
    ["Unread messages", String(patient.messages.filter((message) => message.status === "Unread").length), "Demo inbox"],
    ["Balance", patient.billing.balance, patient.billing.insurance]
  ];
  const content = page.id === "appointments"
    ? simpleTable(["Date", "Clinic", "Status"], patient.appointments.map((item) => [item.date, item.clinic, item.status]))
    : page.id === "visit-history"
      ? simpleTable(["Date", "Type", "Provider", "Reason"], patient.encounters.map((item) => [item.date, item.type, item.provider, item.reason]))
      : page.id === "medications"
        ? simpleTable(["Medication", "Instruction"], patient.medications.map((item) => [item, "Follow clinician instructions"]))
        : page.id === "lab-results"
          ? simpleTable(["Test", "Status", "Value", "Flag"], patient.labs.map((item) => [item.test, item.status, item.value, item.flag]))
          : page.id === "radiology-reports"
            ? simpleTable(["Study", "Status", "Report"], patient.radiology.map((item) => [item.modality, item.status, item.report]))
            : page.id === "invoices-payments"
              ? simpleTable(["Invoice", "Balance", "Coverage"], [[patient.billing.lastInvoice, patient.billing.balance, patient.billing.insurance]])
              : page.id === "secure-messages"
                ? simpleTable(["From", "Subject", "Status"], patient.messages.map((item) => [item.from, item.subject, item.status]))
                : page.id === "care-instructions"
                  ? bulletList(patient.careInstructions)
                  : patientSummaryCards(patient);
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("Patient Portal Demo"))}</h2>
          <p>${escapeHtml(l("Simple patient-facing demo data. This does not replace clinician advice."))}</p>
        </div>
        <span class="status-pill warn">${escapeHtml(l("DEMO DATA"))}</span>
      </div>
      <div class="metric-grid">${portalCards.map(([label, value, detail]) => metricMini(label, value, detail)).join("")}</div>
      <div class="demo-section-spacer">${content}</div>
    </section>
  `;
}

function laboratoryExperience(page: RolePageDefinition): string {
  const critical = demoLabOrders.filter((order) => order.flag === "critical");
  const pending = demoLabOrders.filter((order) => order.status.includes("Pending")).slice(0, 8);
  const rows = page.id === "critical-results"
    ? critical.map((order) => [order.orderId, order.patientName, order.test, order.value, order.priority])
    : page.id === "result-entry"
      ? pending.map((order) => [order.orderId, order.patientName, order.test, "Demo entry only -- not persisted to production backend"])
      : demoLabOrders.slice(0, 10).map((order) => [order.orderId, order.patientName, order.test, order.status, order.value]);
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("Laboratory Operations Demo"))}</h2>
          <p>${escapeHtml(l(page.id === "result-entry" ? "Demo entry only -- not persisted to production backend" : "Pending orders, specimen status, validation, QC, and critical result visibility."))}</p>
        </div>
        <span class="status-pill ${critical.length ? "danger" : "success"}">${critical.length} ${escapeHtml(l("critical"))}</span>
      </div>
      <div class="metric-grid">
        ${metricMini("Pending orders", String(pending.length), "Specimen and validation queue")}
        ${metricMini("Turnaround", "42 min", "Synthetic median TAT")}
        ${metricMini("QC status", "Passing", "Demo analyzer controls")}
      </div>
      ${simpleTable(page.id === "result-entry" ? ["Order", "Patient", "Test", "Entry state"] : ["Order", "Patient", "Test", "Status", "Result"], rows)}
    </section>
  `;
}

function radiologyExperience(page: RolePageDefinition): string {
  const rows = page.id === "dicom-metadata"
    ? demoRadiologyStudies.slice(0, 8).map((study) => [study.studyId, study.modality, study.bodyPart, "StudyInstanceUID-DEMO", study.pacsStatus])
    : demoRadiologyStudies.slice(0, 10).map((study) => [study.studyId, study.patientName, study.modality, study.status, study.report]);
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("Radiology Operations Demo"))}</h2>
          <p>${escapeHtml(l("Imaging orders, study list, metadata, reports, approvals, and critical findings using synthetic records."))}</p>
        </div>
        <span class="status-pill warn">${escapeHtml(l("DICOM image viewer not implemented yet."))}</span>
      </div>
      <div class="metric-grid">
        ${metricMini("Studies today", String(demoRadiologyStudies.length), "Synthetic worklist")}
        ${metricMini("PACS status", "Metadata available", "No image viewer")}
        ${metricMini("Critical findings", String(demoRadiologyStudies.filter((study) => study.priority === "Urgent").length), "Demo escalation list")}
      </div>
      ${simpleTable(page.id === "dicom-metadata" ? ["Study", "Modality", "Body Part", "DICOM UID", "PACS"] : ["Study", "Patient", "Modality", "Status", "Report"], rows)}
    </section>
  `;
}

function pharmacyExperience(page: RolePageDefinition): string {
  const rows = page.id === "inventory" || page.id === "batch-lot-tracking" || page.id === "expiration-tracking"
    ? demoInventory.map((item) => [item.item, item.lot, item.expiry, String(item.quantity), item.status])
    : page.id === "medication-catalog"
      ? demoMedicationCatalog.map((item) => [item.code, item.name, item.form, String(item.stock), item.status])
      : demoPharmacyRecords.slice(0, 10).map((rx) => [rx.id, rx.patientName, rx.medication, rx.status, rx.safety]);
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("Pharmacy Operations Demo"))}</h2>
          <p>${escapeHtml(l("Prescription queue, dispensing workflow, inventory, batch tracking, and safety alert visibility."))}</p>
        </div>
        <span class="status-pill warn">${escapeHtml(l("Demo safety rules only"))}</span>
      </div>
      <div class="metric-grid">
        ${metricMini("Prescription queue", String(demoPharmacyRecords.length), "Synthetic prescriptions")}
        ${metricMini("Inventory items", String(demoInventory.length), "Demo stock")}
        ${metricMini("Safety alerts", String(demoPharmacyRecords.filter((rx) => rx.safety.includes("Review")).length), "Review labels only")}
      </div>
      ${simpleTable(page.id === "inventory" || page.id === "batch-lot-tracking" || page.id === "expiration-tracking" ? ["Item", "Lot", "Expiry", "Qty", "Status"] : page.id === "medication-catalog" ? ["Code", "Medication", "Form", "Stock", "Status"] : ["Rx", "Patient", "Medication", "Status", "Safety"], rows)}
    </section>
  `;
}

function adminExperience(data: AppData, page: RolePageDefinition): string {
  const table = page.id === "users"
    ? simpleTable(["User", "Role", "Department", "Tenant", "Status"], demoUsers.map((user) => [user.name, user.role, user.department, user.tenant, user.status]))
    : page.id === "roles"
      ? simpleTable(["Role", "Users", "Workspace"], ["doctor", "patient", "laboratory", "radiology", "pharmacy", "administrator", "operator"].map((role) => [role, String(demoUsers.filter((user) => user.role === role).length), role === "operator" ? "Command Center" : `${role} workspace`]))
      : page.id === "tenants"
        ? simpleTable(["Tenant", "Name", "Country", "Status"], demoHospital.tenants.map((tenant) => [tenant.id, tenant.name, tenant.country, tenant.status]))
        : page.id === "departments"
          ? simpleTable(["Department", "Users", "Status"], demoHospital.departments.map((department) => [department, String(demoUsers.filter((user) => user.department === department).length), "Demo active"]))
          : page.id === "audit-logs"
            ? simpleTable(["Event", "Actor", "Action", "Tenant", "Status"], demoAuditLogs.map((log) => [log.id, log.actor, log.action, log.tenant, log.status]))
            : page.id === "system-health"
              ? simpleTable(["Service", "Status", "Detail"], demoSystemHealth.map((item) => [item.service, item.status, item.detail]))
              : simpleTable(["Area", "Value", "Status"], [
                ["Hospital", demoHospital.name, "Demo configured"],
                ["Services", String(data.services.length), "Runtime contracts available"],
                ["OpenAPI documents", String(data.openApiDocuments.length), "Validated"],
                ["Users", String(demoUsers.length), "Synthetic"]
              ]);
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l("Administration Demo Console"))}</h2>
          <p>${escapeHtml(l("Users, roles, tenants, organizations, configuration, audit, security, privacy, and compliance using safe demo records."))}</p>
        </div>
        <span class="status-pill warn">${escapeHtml(l("Read-only admin demo"))}</span>
      </div>
      <div class="metric-grid">
        ${metricMini("Demo users", String(demoUsers.length), "Role mapped")}
        ${metricMini("Tenants", String(demoHospital.tenants.length), "Synthetic")}
        ${metricMini("Audit events", String(demoAuditLogs.length), "Demo only")}
      </div>
      ${table}
    </section>
  `;
}

function patientSearchPanel(title: string, detail: string, full = false): string {
  const rows = demoPatients.slice(0, full ? 20 : 8).map((patient) => [
    `<a href="#/workspace/doctor/patient-profile/${patient.id}">${escapeHtml(patient.name)}</a>`,
    patient.mrn,
    patient.ward,
    patient.status,
    patient.risk
  ]);
  return `
    <section class="band">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l(title))}</h2>
          <p>${escapeHtml(l(detail))}</p>
        </div>
        <label class="field compact-field">
          <span>${escapeHtml(l("Search"))}</span>
          <input type="search" value="" aria-label="${escapeAttribute(l("Synthetic patient search"))}" />
        </label>
      </div>
      ${simpleTable(["Patient", "MRN", "Ward", "Status", "Risk"], rows, true)}
    </section>
  `;
}

function patientChart(patient: DemoPatient, focus: string): string {
  const body = focus === "clinical-timeline"
    ? timeline(patient.timeline)
    : focus === "allergies"
      ? bulletList(patient.allergies)
      : focus === "conditions"
        ? bulletList(patient.conditions)
        : focus === "medications"
          ? bulletList(patient.medications)
          : focus === "vital-signs"
            ? simpleTable(["Time", "BP", "HR", "Temp", "SpO2"], patient.vitals.map((item) => [item.time, item.bp, String(item.hr), String(item.temp), `${item.spo2}%`]))
            : focus === "encounters"
              ? simpleTable(["Date", "Type", "Provider", "Reason"], patient.encounters.map((item) => [item.date, item.type, item.provider, item.reason]))
              : focus === "clinical-notes"
                ? simpleTable(["Date", "Author", "Note"], patient.notes.map((item) => [item.date, item.author, item.note]))
                : focus === "lab-results"
                  ? simpleTable(["Order", "Test", "Status", "Value", "Flag"], patient.labs.map((item) => [item.orderId, item.test, item.status, item.value, item.flag]))
                  : focus === "radiology-reports"
                    ? simpleTable(["Study", "Modality", "Status", "Report"], patient.radiology.map((item) => [item.studyId, item.modality, item.status, item.report]))
                    : focus === "pharmacy-review"
                      ? simpleTable(["Medication", "Status", "Route", "Safety"], patient.pharmacy.map((item) => [item.medication, item.status, item.route, item.safety]))
                      : focus === "ai-recommendations"
                        ? advisoryPanel(patient)
                        : patientSummaryCards(patient);
  return `
    <section class="band patient-chart">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(patient.name)}</h2>
          <p>${escapeHtml(patient.mrn)} · ${escapeHtml(patient.ward)} · ${escapeHtml(patient.room)} · ${escapeHtml(l(patient.status))}</p>
        </div>
        <span class="status-pill ${severityClass(patient.risk)}">${escapeHtml(l(patient.risk))}</span>
      </div>
      <div class="patient-tabs">
        ${["patient-profile", "clinical-timeline", "allergies", "conditions", "medications", "vital-signs", "lab-results", "radiology-reports", "pharmacy-review", "ai-recommendations"].map((tab) => `
          <a class="${focus === tab ? "active" : ""}" href="#/workspace/doctor/${tab}/${patient.id}">${escapeHtml(l(labelForPatientTab(tab)))}</a>
        `).join("")}
      </div>
      ${body}
    </section>
  `;
}

function patientSummaryCards(patient: DemoPatient): string {
  return `
    <div class="operational-cards">
      ${metricMini("Age / Sex", `${patient.age} / ${patient.sex}`, patient.attending)}
      ${metricMini("Allergies", patient.allergies.join(", "), "Demo allergy list")}
      ${metricMini("Conditions", patient.conditions.join(", "), "Synthetic conditions")}
      ${metricMini("Billing", patient.billing.balance, patient.billing.lastInvoice)}
    </div>
    ${simpleTable(["Area", "Summary"], [
      ["Medications", patient.medications.join(", ")],
      ["Latest lab", `${patient.labs[0].test}: ${patient.labs[0].value}`],
      ["Radiology", `${patient.radiology[0].modality} ${patient.radiology[0].status}`],
      ["Next appointment", `${patient.appointments[0].date} ${patient.appointments[0].clinic}`]
    ])}
  `;
}

function clinicalAlertsPanel(): string {
  const rows = demoPatients.filter((patient) => patient.risk !== "normal").slice(0, 6).map((patient) => [
    patient.name,
    patient.room,
    patient.status,
    patient.risk
  ]);
  return `
    <section class="band">
      <h2>${escapeHtml(l("Clinical Alerts"))}</h2>
      <p>${escapeHtml(l("Synthetic watchlist for operational demo. No autonomous diagnosis or treatment."))}</p>
      ${simpleTable(["Patient", "Room", "Status", "Risk"], rows)}
    </section>
  `;
}

function ordersPanel(patient: DemoPatient): string {
  return `
    <section class="band">
      <h2>${escapeHtml(l("Orders Overview"))}</h2>
      ${simpleTable(["Order", "Patient", "Type", "Status"], [
        [patient.labs[0].orderId, patient.name, "Laboratory", patient.labs[0].status],
        [patient.radiology[0].studyId, patient.name, "Radiology", patient.radiology[0].status],
        [`RX-${patient.id}`, patient.name, "Pharmacy", patient.pharmacy[0].status]
      ])}
    </section>
  `;
}

function taskPanel(patient: DemoPatient): string {
  return `
    <section class="band">
      <h2>${escapeHtml(l("Task List"))}</h2>
      ${simpleTable(["Task", "Owner", "Status"], [
        ["Review demo lab trend", patient.attending, "Open"],
        ["Confirm medication reconciliation", "Demo Pharmacist", "In progress"],
        ["Patient portal education check", "Demo Nurse", "Scheduled"]
      ])}
    </section>
  `;
}

function advisoryPanel(patient: DemoPatient): string {
  return `
    <div class="alert warn">
      <strong>${escapeHtml(l("Advisory only. Clinician remains final decision maker."))}</strong>
      <p>${escapeHtml(l("Demo recommendation cards are educational UI examples. They are not diagnosis, treatment, or production AI output."))}</p>
    </div>
    ${simpleTable(["Recommendation", "Reason", "Required action"], [
      ["Review demo allergy list", patient.allergies.join(", "), "Clinician review"],
      ["Check pending demo lab result", patient.labs[0].status, "Wait for validated result"],
      ["Review medication reconciliation", patient.medications.join(", "), "Pharmacist/clinician review"]
    ])}
  `;
}

function timeline(events: DemoPatient["timeline"]): string {
  return `
    <ol class="timeline demo-timeline">
      ${events.map((event, index) => `
        <li>
          <span>${index + 1}</span>
          <p><strong>${escapeHtml(event.time)} · ${escapeHtml(l(event.type))}</strong><br />${escapeHtml(l(event.title))}<br /><small>${escapeHtml(l(event.detail))}</small></p>
        </li>
      `).join("")}
    </ol>
  `;
}

function bulletList(items: string[]): string {
  return `<ul class="demo-bullet-list">${items.map((item) => `<li>${escapeHtml(l(item))}</li>`).join("")}</ul>`;
}

function simpleTable(headers: string[], rows: string[][], htmlCells = false): string {
  return `
    <div class="table-wrap demo-table">
      <table>
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(l(header))}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${htmlCells ? cell : escapeHtml(l(cell))}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function metricMini(label: string, value: string, detail: string): string {
  return `
    <article class="metric-card info">
      <i data-lucide="Gauge"></i>
      <div>
        <span>${escapeHtml(l(label))}</span>
        <strong>${escapeHtml(l(value))}</strong>
        <small>${escapeHtml(l(detail))}</small>
      </div>
    </article>
  `;
}

function severityClass(severity: DemoSeverity): string {
  if (severity === "critical") return "danger";
  if (severity === "watch") return "warn";
  return "success";
}

function labelForPatientTab(tab: string): string {
  const labels: Record<string, string> = {
    "patient-profile": "Patient Profile",
    "clinical-timeline": "Clinical Timeline",
    allergies: "Allergies",
    conditions: "Conditions",
    medications: "Medications",
    "vital-signs": "Vital Signs",
    "lab-results": "Lab Results",
    "radiology-reports": "Radiology Reports",
    "pharmacy-review": "Pharmacy Review",
    "ai-recommendations": "AI Recommendations"
  };
  return labels[tab] ?? tab;
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
    return "";
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
