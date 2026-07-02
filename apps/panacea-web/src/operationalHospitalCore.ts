import { findOperationalCoreWriteEndpoint, GLOBAL_COMMAND_API_BASE, resolveTemplatePath } from "./liveApi";
import { translate, type Locale } from "./locales";
import type { AppData, LiveApiResult, PanaceaWebConfig } from "./types";
import type { RenderState } from "./render";

type FieldKind = "text" | "textarea" | "file" | "select";

interface OperationalField {
  name: string;
  label: string;
  kind?: FieldKind;
  value?: string;
  options?: string[];
  wide?: boolean;
}

interface OperationalAction {
  id: string;
  title: string;
  purpose: string;
  icon: string;
  templatePath: string;
  patientScoped: boolean;
  fields: OperationalField[];
}

const operationalCoreTargets = new Set([
  "operational-patient-file",
  "operational-workflows",
  "operational-audit-evidence",
  "action-register-patient",
  "action-clinical-note",
  "action-attach-report",
  "action-extract-report-text",
  "action-analyze-report",
  "action-translate-report",
  "action-patient-ai-chat",
  "action-global-ai-chat",
  "action-clinical-reasoning",
  "action-create-order",
  "action-draft-prescription",
  "action-pharmacy-safety",
  "action-advance-workflow",
  "action-send-notification"
]);

export const operationalCoreActions: OperationalAction[] = [
  action("register-patient", "Patient Registration", "Create the patient record used by the restored hospital workflow.", "UserPlus", "/operational-core/patients", false, [
    field("subjectId", "Patient ID", "patient-restored-001"),
    field("title", "Registration Title", "Register restored patient"),
    field("reason", "Registration Reason", "Front desk admission"),
    field("detail", "Demographics and contact notes", "Adult patient record with consent-managed contact details.", "textarea", true)
  ]),
  action("clinical-note", "Add Clinical Note", "Append a clinician-authored note to the patient file and timeline.", "ClipboardPenLine", "/operational-core/patients/{patientId}/notes", true, [
    patientField(),
    field("title", "Note Title", "Clinical progress note"),
    field("reason", "Care Context", "Clinician review"),
    field("detail", "Clinical Note", "Patient reviewed by assigned clinician; plan requires clinician approval.", "textarea", true)
  ]),
  action("attach-report", "Upload Medical File", "Attach a PDF, image, or report reference to the patient file.", "UploadCloud", "/operational-core/patients/{patientId}/files", true, [
    patientField(),
    field("title", "File Title", "Uploaded medical report"),
    { name: "medicalFile", label: "Medical File", kind: "file", wide: true },
    field("reportType", "Report Type", "Laboratory report", "select", false, ["Laboratory report", "Radiology report", "Discharge summary", "Referral letter"]),
    field("detail", "File Notes", "Attached for clinician-supervised review.", "textarea", true)
  ]),
  action("extract-report-text", "PDF Text Extraction", "Record extraction metadata and approved OCR fallback status for an attached file.", "FileSearch", "/operational-core/patients/{patientId}/files/{fileId}/extract", true, [
    patientField(),
    field("fileId", "File ID", "file-restored-001"),
    field("title", "Extraction Title", "Extract report text"),
    field("extractionMethod", "Extraction Method", "PDF text extraction", "select", false, ["PDF text extraction", "OCR fallback", "Manual verification"]),
    field("detail", "Extraction Notes", "Text extraction record retained for clinician verification.", "textarea", true)
  ]),
  action("analyze-report", "AI-Assisted Report Analysis", "Record clinician-reviewed report analysis without autonomous diagnosis or treatment.", "BrainCircuit", "/operational-core/patients/{patientId}/reports/analyze", true, [
    patientField(),
    field("title", "Analysis Title", "Report interpretation review"),
    field("reportDomain", "Report Domain", "Laboratory", "select", false, ["Laboratory", "Radiology", "Clinical document"]),
    field("reason", "Reason", "Clinician requested analysis"),
    field("detail", "Report Content or Findings", "Summarize report findings for supervised clinical review.", "textarea", true)
  ]),
  action("translate-report", "Arabic Medical Translation", "Record a governed Arabic translation request for medical text.", "Languages", "/operational-core/patients/{patientId}/reports/translate", true, [
    patientField(),
    field("title", "Translation Title", "Arabic medical translation"),
    field("targetLanguage", "Target Language", "Arabic"),
    field("detail", "Clinical Text", "Translate medical terminology while preserving clinician review boundaries.", "textarea", true)
  ]),
  action("patient-ai-chat", "Patient-Isolated AI Chat", "Record patient-scoped assistant exchange tied to the patient file.", "MessagesSquare", "/operational-core/patients/{patientId}/chat", true, [
    patientField(),
    field("title", "Chat Title", "Patient file question"),
    field("reason", "Question Type", "Patient context review"),
    field("detail", "Question", "Summarize current patient context for clinician-supervised review.", "textarea", true)
  ]),
  action("global-ai-chat", "Global AI Chat", "Record a general clinical assistant exchange outside a patient file.", "MessageCircle", "/operational-core/chat", false, [
    field("title", "Chat Title", "General clinical operations question"),
    field("subjectId", "Subject Reference", "global-chat-session"),
    field("reason", "Question Type", "Operational inquiry"),
    field("detail", "Question", "Provide a governed general response for clinician or operator review.", "textarea", true)
  ]),
  action("clinical-reasoning", "Clinical Reasoning Workflow", "Record evidence-based reasoning output for clinician review and approval.", "Network", "/operational-core/patients/{patientId}/clinical-reasoning", true, [
    patientField(),
    field("title", "Reasoning Title", "Clinical reasoning review"),
    field("reason", "Review Reason", "Evidence review"),
    field("detail", "Reasoning Inputs", "List observations, evidence, contradictions, and missing information for clinician review.", "textarea", true)
  ]),
  action("create-order", "Create Order", "Create an order workflow requiring clinician approval.", "ListPlus", "/operational-core/patients/{patientId}/orders", true, [
    patientField(),
    field("title", "Order Title", "Clinical order request"),
    field("orderType", "Order Type", "Laboratory order", "select", false, ["Laboratory order", "Radiology order", "Nursing task", "Follow-up order"]),
    field("reason", "Order Reason", "Clinician ordered workflow"),
    field("detail", "Order Details", "Order details require clinician approval before execution.", "textarea", true)
  ]),
  action("draft-prescription", "Draft Prescription", "Create a prescription draft under doctor approval and pharmacy safety review.", "Pill", "/operational-core/patients/{patientId}/prescriptions", true, [
    patientField(),
    field("title", "Prescription Draft", "Medication draft for approval"),
    field("medicationName", "Medication", "Medication name"),
    field("dose", "Dose", "Dose and frequency"),
    field("detail", "Prescription Notes", "Draft remains inactive until authorized clinician approval and safety review.", "textarea", true)
  ]),
  action("pharmacy-safety", "Pharmacy Safety Check", "Run the documented safety review workflow for a medication draft.", "ShieldAlert", "/operational-core/patients/{patientId}/pharmacy-safety/check", true, [
    patientField(),
    field("title", "Safety Check", "Medication safety review"),
    field("medicationName", "Medication", "Medication name"),
    field("reason", "Safety Focus", "Allergy, interaction, duplicate therapy, contraindication"),
    field("detail", "Safety Notes", "Documented safety review for clinician and pharmacy approval.", "textarea", true)
  ]),
  action("advance-workflow", "Advance Workflow", "Move a patient workflow step forward with audit evidence.", "GitBranchPlus", "/operational-core/patients/{patientId}/workflow/advance", true, [
    patientField(),
    field("title", "Workflow Step", "Advance patient workflow"),
    field("workflowStep", "Next Step", "Clinician review", "select", false, ["Clinician review", "Pharmacy review", "Laboratory review", "Radiology review", "Discharge planning"]),
    field("reason", "Advancement Reason", "Approved handoff"),
    field("detail", "Workflow Notes", "Workflow advancement is recorded with tenant, actor, and audit context.", "textarea", true)
  ]),
  action("send-notification", "Operational Notification", "Record a patient-linked operational notification and status update.", "BellRing", "/operational-core/patients/{patientId}/notifications", true, [
    patientField(),
    field("title", "Notification Title", "Operational status update"),
    field("recipientRole", "Recipient Role", "doctor", "select", false, ["doctor", "pharmacy", "laboratory", "radiology", "administrator"]),
    field("reason", "Notification Reason", "Workflow status"),
    field("detail", "Notification Message", "Notify the responsible team about a patient workflow update.", "textarea", true)
  ])
];

export function renderOperationalHospitalCore(data: AppData, state: RenderState): string {
  const config = state.webConfig;
  const session = state.authSession;
  const locale = state.language;
  const patientId = session ? "patient-restored-001" : "patient";
  const result = state.operationalCoreResult;
  return `
    <div class="page-grid operational-core-page hospital-core-route" data-page="hospital-core">
      ${pageHeader(locale, "AI Hospital Core", "Executable patient registration, patient file, report analysis, chat, orders, prescriptions, pharmacy safety, workflow, audit, and notification operations restored from the original hospital core.", session ? "Authenticated Operations" : "Foundation Access Required", "Hospital")}
      ${operationConsole(locale, patientId, data.publicApiBaseUrl)}
      <section class="metric-grid">
        ${metric(locale, "Patient Registry", "Operational", "Create and open governed patient records", "UserPlus", "success")}
        ${metric(locale, "Patient File", "Operational", "Timeline, files, notes, reports, chat, orders, and notifications", "FolderOpen", "success")}
        ${metric(locale, "AI Assistance", "Governed", "No autonomous diagnosis or treatment; clinician approval remains mandatory", "ShieldCheck", "success")}
        ${metric(locale, "Audit Trail", "Active", "Write workflows generate event and projection evidence", "FileClock", "success")}
      </section>
      ${session ? sessionBanner(locale, session.displayName, session.role, session.tenantId) : loginBanner(locale)}
      ${state.authError ? `<div class="alert danger"><strong>${escapeHtml(l(locale, "Action Required"))}</strong><p>${escapeHtml(l(locale, state.authError))}</p></div>` : ""}
      <section id="operational-patient-file" class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l(locale, "Operational Patient File"))}</h2>
            <p>${escapeHtml(l(locale, "Open patient list, profile, timeline, file, report, chat, order, pharmacy, workflow, notification, and audit routes inside this workspace."))}</p>
          </div>
        </div>
        <div class="core-route-grid">
          ${readRoutes(patientId, data.publicApiBaseUrl).map((route) => `
            <button type="button" data-operational-read-url="${escapeAttribute(route.url)}" data-operational-read-label="${escapeAttribute(route.label)}">
              <strong>${escapeHtml(l(locale, route.label))}</strong>
              <span>${escapeHtml(route.path)}</span>
            </button>
          `).join("")}
        </div>
        ${result ? renderResult(result, locale) : `<div class="empty-state compact"><i data-lucide="FolderOpen"></i><p>${escapeHtml(l(locale, "Choose Patient List or Open Patient File to load live patient-file evidence after secure sign-in."))}</p></div>`}
      </section>
      <section id="operational-workflows" class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l(locale, "Restored Executable Workflows"))}</h2>
            <p>${escapeHtml(l(locale, "Each action below submits to a live governed write endpoint published by the OpenAPI contract and requires a Foundation-authenticated session."))}</p>
          </div>
        </div>
        <div class="operational-action-grid">
          ${operationalCoreActions.map((item) => renderAction(item, data, config, patientId, locale)).join("")}
        </div>
      </section>
      <section id="operational-audit-evidence" class="band">
        <div class="section-title">
          <div>
            <h2>${escapeHtml(l(locale, "Transaction Evidence"))}</h2>
            <p>${escapeHtml(l(locale, "Successful operations create write workflow events, read-model projections, and operator review records."))}</p>
          </div>
        </div>
        ${renderResult(result, locale)}
        <div class="quick-actions">
          <a class="button" href="#/command/transaction-review"><i data-lucide="ListChecks"></i> ${escapeHtml(l(locale, "Review Events and Projections"))}</a>
          <a class="button" href="#/workspace/administrator/audit-logs"><i data-lucide="FileClock"></i> ${escapeHtml(l(locale, "View Audit Trail"))}</a>
          <a class="button" href="#/auth/login"><i data-lucide="KeyRound"></i> ${escapeHtml(l(locale, "Manage Foundation Session"))}</a>
        </div>
      </section>
    </div>
  `;
}

export function operationalCoreTargetFromRoute(route: string): string | undefined {
  const cleaned = route.replace(/^#/, "").replace(/^\//, "");
  return operationalCoreTargets.has(cleaned) ? cleaned : undefined;
}

function operationConsole(locale: Locale, patientId: string, apiBase: string): string {
  const routeByLabel = new Map(readRoutes(patientId, apiBase).map((route) => [route.label, route.url]));
  const controls = [
    { label: "Create Patient", icon: "UserPlus", target: "action-register-patient", kind: "workflow" },
    { label: "Patient List", icon: "Users", target: "operational-patient-file", kind: "record", evidenceUrl: routeByLabel.get("Patient List") },
    { label: "Open Patient File", icon: "FolderOpen", target: "operational-patient-file", kind: "record", evidenceUrl: routeByLabel.get("Patient Profile") },
    { label: "Upload Medical File", icon: "UploadCloud", target: "action-attach-report", kind: "workflow" },
    { label: "AI-Assisted Report Analysis", icon: "BrainCircuit", target: "action-analyze-report", kind: "workflow" },
    { label: "Patient AI Chat", icon: "MessagesSquare", target: "action-patient-ai-chat", kind: "workflow" },
    { label: "Global AI Chat", icon: "MessageCircle", target: "action-global-ai-chat", kind: "workflow" },
    { label: "Create Order", icon: "ListPlus", target: "action-create-order", kind: "workflow" },
    { label: "Draft Prescription", icon: "Pill", target: "action-draft-prescription", kind: "workflow" },
    { label: "Pharmacy Safety Check", icon: "ShieldAlert", target: "action-pharmacy-safety", kind: "workflow" },
    { label: "Advance Workflow", icon: "GitBranchPlus", target: "action-advance-workflow", kind: "workflow" },
    { label: "Audit Trail", icon: "FileClock", target: "operational-audit-evidence", kind: "record", evidenceUrl: routeByLabel.get("Audit Trail") }
  ];
  return `
    <section class="band hospital-core-console" aria-label="${escapeAttribute(l(locale, "Hospital Operations Console"))}">
      <div class="section-title">
        <div>
          <h2>${escapeHtml(l(locale, "Hospital Operations Console"))}</h2>
          <p>${escapeHtml(l(locale, "Use the controls below to create patients, open patient files, upload reports, run governed AI assistance, create orders, draft prescriptions, run pharmacy safety checks, advance workflows, and review audit evidence."))}</p>
        </div>
        <span class="status-pill online">${escapeHtml(l(locale, "Executable workflows"))}</span>
      </div>
      <div class="hospital-core-control-grid">
        ${controls.map((control) => `
          <button class="hospital-core-control ${escapeAttribute(control.kind)}" type="button" data-scroll-target="${escapeAttribute(control.target)}" ${control.evidenceUrl ? `data-evidence-url="${escapeAttribute(control.evidenceUrl)}"` : ""} aria-label="${escapeAttribute(l(locale, control.label))}">
            <i data-lucide="${escapeAttribute(control.icon)}"></i>
            <span>${escapeHtml(l(locale, control.label))}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderAction(item: OperationalAction, data: AppData, config: PanaceaWebConfig | undefined, patientId: string, locale: Locale): string {
  const fullTemplatePath = `${GLOBAL_COMMAND_API_BASE}${item.templatePath}`;
  const resolvedPath = resolveTemplatePath(fullTemplatePath, {
    patientId,
    fileId: "file-restored-001",
    prescriptionId: "prescription-restored-001",
    orderId: "order-restored-001"
  });
  const endpoint = config ? findOperationalCoreWriteEndpoint(data, config, fullTemplatePath, {
    patientId,
    fileId: "file-restored-001",
    prescriptionId: "prescription-restored-001",
    orderId: "order-restored-001"
  }) : undefined;
  const endpointReady = Boolean(endpoint?.available);
  const translatedTitle = l(locale, item.title);
  const submitLabel = locale === "ar" ? `إرسال ${translatedTitle}` : `Submit ${translatedTitle}`;
  return `
    <article id="action-${escapeAttribute(item.id)}" class="operational-action-card">
      <div class="action-card-title">
        <i data-lucide="${escapeAttribute(item.icon)}"></i>
        <div>
          <h3>${escapeHtml(translatedTitle)}</h3>
          <p>${escapeHtml(l(locale, item.purpose))}</p>
        </div>
      </div>
      <form class="live-write-form operational-core-form" data-action-id="${escapeAttribute(item.id)}" data-workflow-path="${escapeAttribute(fullTemplatePath)}" data-workflow-url="${escapeAttribute(endpoint?.url ?? `${data.publicApiBaseUrl}${resolvedPath}`)}">
        ${item.fields.map((fieldDef) => renderField(fieldDef, locale)).join("")}
        <div class="write-control-list">
          <span><i data-lucide="UserCheck"></i> ${escapeHtml(l(locale, "Human approval enforced"))}</span>
          <span><i data-lucide="ShieldAlert"></i> ${escapeHtml(l(locale, "No autonomous treatment"))}</span>
          <span><i data-lucide="FileClock"></i> ${escapeHtml(l(locale, "Audited write workflow"))}</span>
        </div>
        <button class="button primary" type="submit" ${endpointReady ? "" : "disabled"}>
          <i data-lucide="Send"></i>
          ${escapeHtml(submitLabel)}
        </button>
        <p class="endpoint-line">${escapeHtml(l(locale, endpointReady ? "Live endpoint" : "OpenAPI route required"))} · ${escapeHtml(endpoint?.url ?? `${data.publicApiBaseUrl}${resolvedPath}`)}</p>
      </form>
    </article>
  `;
}

function renderField(item: OperationalField, locale: Locale): string {
  const kind = item.kind ?? "text";
  const value = item.value ?? "";
  if (kind === "textarea") {
    return `
      <label class="${item.wide ? "wide" : ""}">
        ${escapeHtml(l(locale, item.label))}
        <textarea name="${escapeAttribute(item.name)}">${escapeHtml(l(locale, value))}</textarea>
      </label>
    `;
  }
  if (kind === "select") {
    return `
      <label class="${item.wide ? "wide" : ""}">
        ${escapeHtml(l(locale, item.label))}
        <select name="${escapeAttribute(item.name)}">
          ${(item.options ?? [value]).map((option) => `<option value="${escapeAttribute(option)}" ${option === value ? "selected" : ""}>${escapeHtml(l(locale, option))}</option>`).join("")}
        </select>
      </label>
    `;
  }
  return `
    <label class="${item.wide ? "wide" : ""}">
      ${escapeHtml(l(locale, item.label))}
      <input type="${kind}" name="${escapeAttribute(item.name)}" value="${kind === "file" ? "" : escapeAttribute(l(locale, value))}" />
    </label>
  `;
}

function renderResult(result: LiveApiResult | undefined, locale: Locale): string {
  if (!result) {
    return `<div class="empty-state compact"><i data-lucide="FileClock"></i><p>${escapeHtml(l(locale, "Submit an operational action to view request status, event acceptance, and projection evidence."))}</p></div>`;
  }
  return `
    <div class="live-write-result ${escapeAttribute(result.state)}">
      <span><strong>${escapeHtml(l(locale, "State"))}</strong> ${escapeHtml(l(locale, result.state))}</span>
      <span><strong>HTTP</strong> ${escapeHtml(result.httpStatus ?? l(locale, "pending"))}</span>
      <span><strong>${escapeHtml(l(locale, "Request"))}</strong> ${escapeHtml(result.requestId)}</span>
      <span><strong>${escapeHtml(l(locale, "Detail"))}</strong> ${escapeHtml(l(locale, result.detail))}</span>
      <span><strong>${escapeHtml(l(locale, "Endpoint"))}</strong> ${escapeHtml(result.url)}</span>
    </div>
  `;
}

function readRoutes(patientId: string, apiBase: string) {
  const encodedPatientId = encodeURIComponent(patientId);
  const paths = [
    ["Patient List", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients`],
    ["Patient Profile", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}`],
    ["Patient Timeline", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}/timeline`],
    ["Patient Files", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}/files`],
    ["Report Interpretation", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}/reports`],
    ["Patient Chat", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}/chat`],
    ["Global Chat", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/chat`],
    ["Clinical Reasoning", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}/clinical-reasoning`],
    ["Orders", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}/orders`],
    ["Pharmacy Safety", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}/pharmacy-review`],
    ["Workflow", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}/workflow`],
    ["Notifications", `${GLOBAL_COMMAND_API_BASE}/read-models/clinical/patients/${encodedPatientId}/notifications`],
    ["Audit Trail", `${GLOBAL_COMMAND_API_BASE}/read-models/admin/audit-logs`]
  ];
  return paths.map(([label, path]) => ({ label, path, url: `${apiBase}${path}` }));
}

function pageHeader(locale: Locale, title: string, description: string, status: string, icon: string): string {
  return `
    <section class="page-header">
      <div>
        <p class="eyebrow">${escapeHtml(l(locale, "Restored Operational Product"))}</p>
        <h1>${escapeHtml(l(locale, title))}</h1>
        <p>${escapeHtml(l(locale, description))}</p>
      </div>
      <span><i data-lucide="${escapeAttribute(icon)}"></i>${escapeHtml(l(locale, status))}</span>
    </section>
  `;
}

function metric(locale: Locale, label: string, value: string, detail: string, icon: string, tone: "success" | "warn" | "info"): string {
  return `
    <article class="metric-card ${tone}">
      <i data-lucide="${escapeAttribute(icon)}"></i>
      <span>${escapeHtml(l(locale, label))}</span>
      <strong>${escapeHtml(l(locale, value))}</strong>
      <p>${escapeHtml(l(locale, detail))}</p>
    </article>
  `;
}

function sessionBanner(locale: Locale, displayName: string, role: string, tenantId: string): string {
  return `
    <section class="band operational-session-band">
      <h2>${escapeHtml(l(locale, "Authenticated Hospital Core Session"))}</h2>
      <p>${escapeHtml(displayName)} ${escapeHtml(l(locale, "is connected as"))} ${escapeHtml(l(locale, role))} ${escapeHtml(l(locale, "for tenant"))} ${escapeHtml(tenantId)}. ${escapeHtml(l(locale, "All actions remain tenant-scoped, audited, and governed by Foundation authentication."))}</p>
    </section>
  `;
}

function loginBanner(locale: Locale): string {
  return `
    <section class="band operational-session-band">
      <h2>${escapeHtml(l(locale, "Foundation Login Required"))}</h2>
      <p>${escapeHtml(l(locale, "Sign in through the approved Foundation provider to submit operational hospital workflows. The page remains visible for route review, but transactions require an authenticated session."))}</p>
      <a class="button primary" href="#/auth/login"><i data-lucide="KeyRound"></i> ${escapeHtml(l(locale, "Open Secure Access"))}</a>
    </section>
  `;
}

function l(locale: Locale, value: string | number | undefined): string {
  return translate(locale, value);
}

function action(id: string, title: string, purpose: string, icon: string, path: string, patientScoped: boolean, fields: OperationalField[]): OperationalAction {
  return { id, title, purpose, icon, templatePath: path, patientScoped, fields };
}

function field(name: string, label: string, value = "", kind: FieldKind = "text", wide = false, options?: string[]): OperationalField {
  return { name, label, value, kind, wide, options };
}

function patientField(): OperationalField {
  return field("patientId", "Patient ID", "patient-restored-001");
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
  return escapeHtml(value);
}
