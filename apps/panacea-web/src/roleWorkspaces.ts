import type { RoleId, RoleMetric, RolePageDefinition, RolePanel, RoleTable, RoleWorkspaceDefinition } from "./types";

const demoLabel = "GOVERNED WORKSPACE VIEW";

type PageSeed = {
  id: string;
  label: string;
  icon: string;
  focus: string;
  workflow?: string[];
  panels?: RolePanel[];
};

export const roleSwitcherOptions: Array<{ id: RoleId; label: string; route: string }> = [
  { id: "operator", label: "Operator", route: "/command/executive-overview" },
  { id: "doctor", label: "Doctor", route: "/workspace/doctor/dashboard" },
  { id: "patient", label: "Patient", route: "/workspace/patient/dashboard" },
  { id: "laboratory", label: "Laboratory User", route: "/workspace/laboratory/dashboard" },
  { id: "radiology", label: "Radiology User", route: "/workspace/radiology/dashboard" },
  { id: "pharmacy", label: "Pharmacist", route: "/workspace/pharmacy/dashboard" },
  { id: "administrator", label: "Administrator", route: "/workspace/administrator/dashboard" }
];

export const roleWorkspaces: RoleWorkspaceDefinition[] = [
  buildWorkspace({
    id: "doctor",
    label: "Doctor",
    title: "Doctor / Clinician Workspace",
    icon: "Stethoscope",
    route: "/workspace/doctor/dashboard",
    audience: "Clinicians reviewing patient context, documented clinical coverage, active governance APIs, and advisory-only intelligence evidence.",
    summary: "A professional clinical workspace with patient context, timelines, summaries, alerts, medication safety visibility, lab/radiology summaries, task views, and audit/documentation links.",
    boundary: "No autonomous diagnosis. No autonomous treatment. Advisory only. Clinician remains final decision maker.",
    dataMode: "Secure workspace mode using OpenAPI, documentation, release evidence, and active governance service status.",
    serviceIds: [
      "autonomous-healthcare-intelligence-foundation",
      "global-ai-assurance-safety-model-risk-management-platform",
      "real-time-global-healthcare-command-intelligence-platform"
    ],
    docHints: ["Clinical", "Patient", "AI_Assurance", "Autonomous_Intelligence", "Patient_Safety", "Medication"],
    seeds: [
      seed("dashboard", "Clinician Dashboard", "LayoutDashboard", "Clinical command view with patient context, alerts, task load, documented clinical coverage, and advisory-only intelligence status."),
      seed("patient-search", "Patient Search", "Search", "Search-ready workspace for patient lookup using approved authenticated clinical APIs when connected; current state shows governed live data status explicitly."),
      seed("patient-profile", "Patient Profile", "UserRound", "Patient profile context panel with identity and consent source status clearly separated from live records."),
      seed("patient-files", "Patient Files", "Files", "Patient document upload, file registry, and governed analysis workflow connected to operational core APIs."),
      seed("file-analysis", "Medical File Analysis", "FileSearch", "Clinical file analysis surface with clinician review, audit, and event projection controls."),
      seed("patient-ai-chat", "Patient AI Chat", "MessagesSquare", "Patient-scoped assistive clinical chat with traceability, no autonomous diagnosis, and no autonomous treatment."),
      seed("global-ai-chat", "Global AI Chat", "MessageCircleQuestion", "Organization-scoped assistive clinical chat for governed knowledge review and audit tracking."),
      seed("clinical-timeline", "Clinical Timeline", "History", "Timeline view for encounters, orders, results, medication events, and documented audit evidence."),
      seed("encounters", "Encounters", "ClipboardList", "Encounter list and details with documented API coverage status."),
      seed("allergies", "Allergies", "TriangleAlert", "Allergy warning area with safety status and documentation links."),
      seed("conditions", "Conditions", "ListChecks", "Condition summary cards with clinical documentation source status."),
      seed("medications", "Medications", "Pill", "Medication list with medication safety visibility and pharmacy review links."),
      seed("vital-signs", "Vital Signs", "Activity", "Vital signs trend surface showing documented availability and live data status."),
      seed("clinical-notes", "Clinical Notes", "FileText", "Clinical notes table and audit trail links."),
      seed("orders-overview", "Orders Overview", "ListOrdered", "Orders overview with governed routing and approval status."),
      seed("prescriptions", "Prescriptions", "ClipboardPenLine", "Prescription workflow submission, clinician approval, and pharmacy safety review visibility."),
      seed("treatment-orders", "Treatment Orders", "ClipboardCheck", "Treatment and order workflow routing with mandatory clinician approval and audit trail."),
      seed("report-analysis", "Report Analysis", "FileBarChart2", "Lab, radiology, and clinical report analysis with governed translation and review workflow."),
      seed("workflow-actions", "Workflow Actions", "GitBranch", "Patient workflow advancement with policy controls, audit evidence, and human oversight."),
      seed("lab-results", "Lab Results Viewer", "TestTube2", "Laboratory result viewer with critical result status and validation source labels."),
      seed("radiology-reports", "Radiology Reports Viewer", "ScanLine", "Radiology report viewer with report status and imaging documentation links."),
      seed("pharmacy-review", "Pharmacy / Medication Review", "ShieldAlert", "Medication review with allergy, interaction, duplicate therapy, and dispensing status areas."),
      seed("ai-recommendations", "AI Recommendations Viewer", "BrainCircuit", "Advisory-only recommendation viewer backed by AI assurance and autonomous intelligence governance evidence."),
      seed("clinical-alerts", "Clinical Alerts", "BellRing", "Clinical alert review surface with escalation state and auditability."),
      seed("task-list", "Task List", "CheckSquare", "Clinician task list with assignment, status, and SLA visibility."),
      seed("care-team", "Care Team View", "UsersRound", "Care team collaboration surface with documentation links and role visibility.")
    ]
  }),
  buildWorkspace({
    id: "patient",
    label: "Patient",
    title: "Patient Portal Workspace",
    icon: "HeartHandshake",
    route: "/workspace/patient/dashboard",
    audience: "Patients and authorized caregivers viewing simple, clear, educational, and privacy-aware information.",
    summary: "Mobile-friendly patient portal workspace for profile, appointments, visit history, medications, results, documents, messages, telemedicine, invoices, notifications, and care instructions.",
    boundary: "Patient-facing information is educational and does not replace clinician advice.",
    dataMode: "Secure portal workspace mode. Live patient records require approved authenticated patient APIs and consent enforcement.",
    serviceIds: ["global-enterprise-data-privacy-consent-trust-platform"],
    docHints: ["Patient Portal", "Patient_Experience", "Caregiver", "Consent", "Privacy"],
    seeds: [
      seed("dashboard", "Patient Dashboard", "LayoutDashboard", "Simple summary for upcoming care, messages, results, instructions, and privacy status."),
      seed("profile", "Profile", "UserRound", "Patient profile with consent and privacy source indicators."),
      seed("appointments", "Appointments", "CalendarDays", "Appointment list surface with documented scheduling availability."),
      seed("visit-history", "Visit History", "History", "Visit history view with educational labels and live-data status."),
      seed("medications", "Medications", "Pill", "Medication schedule viewer with clinician-advice boundary."),
      seed("allergies", "Allergies", "TriangleAlert", "Allergy information area with clear patient-friendly language."),
      seed("lab-results", "Lab Results", "TestTube2", "Lab results view with explanatory and release-status labels."),
      seed("radiology-reports", "Radiology Reports", "ScanLine", "Radiology report surface without diagnostic image viewing."),
      seed("clinical-documents", "Clinical Documents", "Files", "Document list surface for summaries and clinical documents."),
      seed("secure-messages", "Secure Messages", "MessageSquare", "Secure messages workspace for authenticated backend messaging APIs."),
      seed("telemedicine", "Telemedicine", "Video", "Telemedicine entry surface showing documented availability."),
      seed("invoices-payments", "Invoices / Payments", "Receipt", "Patient billing view with finance capability source status."),
      seed("notifications", "Notifications", "Bell", "Notification preferences and patient-facing alert surface."),
      seed("care-instructions", "Care Instructions", "BookOpenCheck", "Educational care instruction viewer with clinician-advice boundary.")
    ]
  }),
  buildWorkspace({
    id: "laboratory",
    label: "Laboratory User",
    title: "Laboratory Workspace",
    icon: "TestTube2",
    route: "/workspace/laboratory/dashboard",
    audience: "Laboratory users monitoring orders, specimens, results, critical flags, quality controls, and integration status.",
    summary: "A laboratory operations workspace covering order flow, specimen lifecycle, result entry, validation, approval, critical results, quality control, analytics, and reports.",
    boundary: "Laboratory workflows remain governed through approved backend APIs and human validation.",
    dataMode: "Secure laboratory workspace mode. Live laboratory workflow data is available through approved lab API integration.",
    serviceIds: ["real-time-global-healthcare-command-intelligence-platform"],
    docHints: ["Laboratory", "LOINC", "Critical", "Quality", "Specimen"],
    seeds: [
      seed("dashboard", "Laboratory Dashboard", "LayoutDashboard", "Operational lab summary for orders, specimens, turnaround time, critical results, and integration status."),
      seed("lab-orders", "Lab Orders", "ClipboardList", "Lab order queue surface with order status and documented API source labels."),
      seed("specimen-tracking", "Specimen Tracking", "Route", "Specimen status board from collection to receiving, validation, and approval."),
      seed("specimen-collection", "Specimen Collection", "PackageCheck", "Collection workflow surface with auditability and chain-of-custody labels."),
      seed("specimen-receiving", "Specimen Receiving", "Inbox", "Receiving queue with accession, condition, and routing status labels."),
      seed("result-entry", "Result Entry", "Keyboard", "Result entry workspace with governed transactional workflow controls where approved."),
      seed("result-validation", "Result Validation", "BadgeCheck", "Validation state view with documented approval flow."),
      seed("result-approval", "Result Approval", "CheckCircle2", "Approval worklist surface with audit and release-state indicators."),
      seed("critical-results", "Critical Results", "Siren", "Critical result flag view with escalation status and auditability."),
      seed("quality-control", "Quality Control", "Gauge", "Quality control summary with trend and validation status."),
      seed("lab-analytics", "Lab Analytics", "BarChart3", "Turnaround time, workload, and quality analytics workspace."),
      seed("lab-reports", "Lab Reports", "FileBarChart", "Laboratory report registry and export surface.")
    ]
  }),
  buildWorkspace({
    id: "radiology",
    label: "Radiology User",
    title: "Radiology Workspace",
    icon: "ScanLine",
    route: "/workspace/radiology/dashboard",
    audience: "Radiology users reviewing imaging orders, studies, metadata, PACS status, reports, approvals, and critical findings.",
    summary: "A radiology workflow workspace for imaging orders, study list, DICOM metadata, PACS status, reporting worklist, report editing, approval, critical findings, timeline, and analytics.",
    boundary: "DICOM image viewing remains governed by approved imaging systems and formal clinical workflow controls.",
    dataMode: "Secure radiology workspace mode using documentation, OpenAPI contracts, and runtime status. Live imaging data requires approved radiology API integration.",
    serviceIds: ["real-time-global-healthcare-command-intelligence-platform"],
    docHints: ["Radiology", "DICOM", "Imaging", "PACS", "Critical Findings"],
    seeds: [
      seed("dashboard", "Radiology Dashboard", "LayoutDashboard", "Radiology operational summary for imaging orders, reporting status, critical findings, and PACS availability."),
      seed("imaging-orders", "Imaging Orders", "ClipboardList", "Imaging order queue with documented API availability."),
      seed("study-list", "Study List", "List", "Study list with metadata status and live data boundary."),
      seed("dicom-metadata", "DICOM Metadata Viewer", "Database", "DICOM metadata surface without image rendering."),
      seed("pacs-status", "PACS Status", "Server", "PACS availability and integration status surface."),
      seed("reporting-worklist", "Reporting Worklist", "FileText", "Reporting worklist with assignment and priority labels."),
      seed("report-editor", "Report Editor UI", "Edit3", "Report editor surface with governed transactional controls where approved."),
      seed("report-approval", "Report Approval", "BadgeCheck", "Approval queue with auditability and release evidence status."),
      seed("critical-findings", "Critical Findings", "Siren", "Critical finding review and escalation status surface."),
      seed("imaging-timeline", "Imaging Timeline", "History", "Imaging timeline from order to report approval."),
      seed("radiology-analytics", "Radiology Analytics", "BarChart3", "Volume, turnaround, approval, and critical finding analytics workspace.")
    ]
  }),
  buildWorkspace({
    id: "pharmacy",
    label: "Pharmacist",
    title: "Pharmacy Workspace",
    icon: "Pill",
    route: "/workspace/pharmacy/dashboard",
    audience: "Pharmacists reviewing medication catalog, prescription queues, safety indicators, dispensing, inventory, controlled medications, and reports.",
    summary: "A pharmacy operations workspace with medication review, dispensing workflow, stock status, batch/lot tracking, expiration tracking, drug safety alerts, and controlled medication audit.",
    boundary: "Medication safety workflows remain governed through pharmacy review, safety gates, and approved backend APIs.",
    dataMode: "Secure pharmacy workspace mode. Live pharmacy records require approved pharmacy API integration.",
    serviceIds: ["global-enterprise-data-privacy-consent-trust-platform", "real-time-global-healthcare-command-intelligence-platform"],
    docHints: ["Pharmacy", "Medication", "Drug", "Inventory", "Controlled"],
    seeds: [
      seed("dashboard", "Pharmacy Dashboard", "LayoutDashboard", "Medication queue, safety, inventory, controlled medication, and reporting overview."),
      seed("medication-catalog", "Medication Catalog", "BookMarked", "Medication catalog with documented availability."),
      seed("prescription-queue", "Prescription Queue", "ClipboardList", "Prescription queue surface with review and priority labels."),
      seed("prescription-review", "Prescription Review", "ShieldCheck", "Allergy, interaction, duplicate therapy, and dose review workspace."),
      seed("dispensing", "Dispensing", "PackageCheck", "Dispensing workflow surface with audit and status labels."),
      seed("med-admin-overview", "Medication Administration Overview", "ListChecks", "Medication administration visibility surface."),
      seed("inventory", "Inventory", "Boxes", "Stock status and reorder visibility workspace."),
      seed("batch-lot-tracking", "Batch / Lot Tracking", "QrCode", "Batch and lot tracking view with traceability labels."),
      seed("expiration-tracking", "Expiration Tracking", "CalendarClock", "Expiration tracking surface with risk and stock status."),
      seed("drug-safety-alerts", "Drug Safety Alerts", "ShieldAlert", "Drug safety alert surface with documented safety status."),
      seed("controlled-medications", "Controlled Medications", "LockKeyhole", "Controlled medication audit and access control view."),
      seed("pharmacy-reports", "Pharmacy Reports", "FileBarChart", "Pharmacy reports and controlled medication evidence view.")
    ]
  }),
  buildWorkspace({
    id: "administrator",
    label: "Administrator",
    title: "Administration Workspace",
    icon: "Settings",
    route: "/workspace/administrator/dashboard",
    audience: "Administrators reviewing system configuration, identity, access, tenants, organizations, facilities, audit, security, privacy, compliance, release evidence, and APIs.",
    summary: "An administration console visually connected to the operator dashboard with OpenAPI-backed governed views for system and governance state.",
    boundary: "Administrative write workflows require live admin APIs and production authorization.",
    dataMode: "Secure admin console mode using active service APIs, OpenAPI, release evidence, and Foundation Provider status.",
    serviceIds: [
      "global-workforce-hr-credentialing-staff-experience-platform",
      "global-enterprise-data-privacy-consent-trust-platform",
      "global-compliance-automation-regulatory-intelligence-platform",
      "global-legal-contracting-risk-governance-platform",
      "global-product-management-roadmap-innovation-portfolio-platform",
      "global-customer-success-support-service-management-platform"
    ],
    docHints: ["Security", "Privacy", "Compliance", "Release", "Foundation", "Deployment", "Admin"],
    seeds: [
      seed("dashboard", "Admin Dashboard", "LayoutDashboard", "System overview for release, runtime, services, tenants, security, privacy, compliance, and documentation."),
      seed("users", "Users", "UserCog", "User management workspace with Foundation dependency status."),
      seed("roles", "Roles", "Badge", "Role registry surface with RBAC source labels."),
      seed("permissions", "Permissions", "KeyRound", "Permission matrix with API-backed control status."),
      seed("tenants", "Tenants", "Building", "Tenant inventory surface with isolation and evidence indicators."),
      seed("organizations", "Organizations", "Network", "Organization registry with documentation and OpenAPI sources."),
      seed("facilities", "Facilities", "Hospital", "Facility registry surface connected to documented global operations scope."),
      seed("departments", "Departments", "Building2", "Department overview with command intelligence and workforce source labels."),
      seed("configuration", "Configuration", "SlidersHorizontal", "Configuration surface with environment and Foundation provider status."),
      seed("audit-logs", "Audit Logs", "ScrollText", "Audit log visibility surface using service audit evidence and Foundation audit endpoint status."),
      seed("security", "Security", "Shield", "Authentication, RBAC, ABAC, tenant, and secret handling evidence view."),
      seed("privacy", "Privacy", "LockKeyhole", "Consent, data rights, privacy policy, and trust status view."),
      seed("compliance", "Compliance", "BadgeCheck", "Compliance automation and regulatory intelligence status view."),
      seed("release-evidence", "Release Evidence", "FileCheck2", "Release documents, CI, validation, and final closure evidence view."),
      seed("system-health", "System Health", "Activity", "Runtime service health, readiness, metrics, OpenAPI, and infrastructure status view."),
      seed("api-explorer", "API Explorer", "Braces", "Administrative entry point into OpenAPI-backed endpoint exploration."),
      seed("documentation", "Documentation Center", "BookOpen", "Administrative document center with release, API, deployment, security, and operations guides.")
    ]
  })
];

export function roleFromRoute(route: string): RoleId | undefined {
  const match = /^\/workspace\/([^/]+)/.exec(route);
  const id = match?.[1] as RoleId | undefined;
  return roleWorkspaces.some((workspace) => workspace.id === id) ? id : undefined;
}

export function roleDefaultRoute(roleId: RoleId): string {
  if (roleId === "operator") return "/command/executive-overview";
  return roleWorkspaces.find((workspace) => workspace.id === roleId)?.route ?? "/command/executive-overview";
}

export function roleRouteTitle(route: string): string | undefined {
  const workspace = workspaceFromRoute(route);
  const page = pageFromRoute(route);
  if (!workspace) return undefined;
  return page ? page.label : workspace.title;
}

export function workspaceFromRoute(route: string): RoleWorkspaceDefinition | undefined {
  const role = roleFromRoute(route);
  return roleWorkspaces.find((workspace) => workspace.id === role);
}

export function pageFromRoute(route: string): RolePageDefinition | undefined {
  const workspace = workspaceFromRoute(route);
  if (!workspace) return undefined;
  const pageId = route.split("/")[3] || "dashboard";
  return workspace.pages.find((page) => page.id === pageId) ?? workspace.pages[0];
}

export function allRoleRoutes(): string[] {
  return roleWorkspaces.flatMap((workspace) => workspace.pages.map((page) => page.route));
}

function buildWorkspace(input: Omit<RoleWorkspaceDefinition, "pages"> & { seeds: PageSeed[] }): RoleWorkspaceDefinition {
  return {
    ...input,
    pages: input.seeds.map((page) => makePage(input.id, page))
  };
}

function seed(id: string, label: string, icon: string, focus: string, workflow?: string[], panels?: RolePanel[]): PageSeed {
  return { id, label, icon, focus, workflow, panels };
}

function makePage(role: RoleId, seedValue: PageSeed): RolePageDefinition {
  const route = `/workspace/${role}/${seedValue.id}`;
  return {
    id: seedValue.id,
    label: seedValue.label,
    icon: seedValue.icon,
    description: seedValue.focus,
    route,
    source: sourceForRole(role),
    metrics: metricsForRole(role, seedValue.label),
    workflow: seedValue.workflow ?? workflowForRole(role, seedValue.label),
    table: tableForRole(role, seedValue.label),
    panels: seedValue.panels ?? panelsForRole(role, seedValue.label),
    chart: chartForRole(role),
    safetyNote: safetyForRole(role)
  };
}

function sourceForRole(role: RoleId): string {
  const sourceMap: Record<RoleId, string> = {
    operator: "Release evidence and runtime validation",
    doctor: "OpenAPI, clinical documentation, AI governance evidence, and active governance services",
    patient: "Patient experience documentation, privacy service status, and consent/trust evidence",
    laboratory: "Laboratory documentation, command intelligence status, and OpenAPI evidence",
    radiology: "Radiology documentation, DICOM metadata references, command status, and OpenAPI evidence",
    pharmacy: "Pharmacy documentation, medication safety references, privacy/command service status, and OpenAPI evidence",
    administrator: "Active service OpenAPI, Foundation Provider status, release evidence, and security/compliance documentation"
  };
  return sourceMap[role];
}

function safetyForRole(role: RoleId): string {
  if (role === "doctor") return "Advisory only. Clinician remains final decision maker.";
  if (role === "patient") return "Educational content only. Patient-facing information does not replace clinician advice.";
  if (role === "radiology") return "DICOM image viewing remains governed by approved imaging systems and formal clinical workflow controls.";
  if (role === "pharmacy") return "No new medication safety backend logic is implemented; safety status is displayed from documented/API-backed sources.";
  if (role === "administrator") return "Workspace selection does not bypass real security in production.";
  return "Governed workspace. Live operational data requires approved backend APIs.";
}

function metricsForRole(role: RoleId, pageLabel: string): RoleMetric[] {
  const common = [
    { label: "Live APIs", value: "Configured", detail: "Authenticated UTBE API routes are selected when the session is active", tone: "success" as const },
    { label: "Audit trail", value: "Linked", detail: "Audit evidence shown when available", tone: "success" as const },
    { label: "Source", value: "OpenAPI/docs", detail: pageLabel, tone: "info" as const }
  ];
  const roleMetric: Record<RoleId, RoleMetric> = {
    operator: { label: "Mode", value: "Operator", detail: "Release and runtime visibility", tone: "info" },
    doctor: { label: "Clinical mode", value: "Advisory", detail: "Human clinician approval required", tone: "success" },
    patient: { label: "Language", value: "Plain", detail: "Patient-friendly labels", tone: "success" },
    laboratory: { label: "Turnaround", value: "Tracked", detail: "TAT surface connected to governed workflow visibility", tone: "info" },
    radiology: { label: "PACS", value: "Status view", detail: "Metadata and report workflow only", tone: "info" },
    pharmacy: { label: "Safety", value: "Visible", detail: "Allergy, interaction and duplicate therapy areas", tone: "success" },
    administrator: { label: "Access", value: "Governed", detail: "Admin actions require approved APIs and authorization", tone: "success" }
  };
  return [roleMetric[role], ...common];
}

function workflowForRole(role: RoleId, pageLabel: string): string[] {
  const workflowMap: Record<RoleId, string[]> = {
    operator: ["Review release evidence", "Inspect service status", "Open API Explorer", "Validate Foundation Provider"],
    doctor: ["Open patient context", `Review ${pageLabel}`, "Check safety and advisory sections", "Follow audit/documentation links"],
    patient: ["Open dashboard", `Review ${pageLabel}`, "Read educational labels", "Contact care team through approved channels"],
    laboratory: ["Review order/specimen queue", `Inspect ${pageLabel}`, "Check validation or approval state", "Escalate critical results through approved workflow"],
    radiology: ["Review imaging queue", `Inspect ${pageLabel}`, "Check PACS/report status", "Escalate critical findings through approved workflow"],
    pharmacy: ["Review prescription or stock queue", `Inspect ${pageLabel}`, "Check allergy/interaction/duplicate therapy areas", "Complete dispensing only in approved pharmacy system"],
    administrator: ["Review system state", `Inspect ${pageLabel}`, "Open related OpenAPI or release evidence", "Apply changes only through approved live admin APIs"]
  };
  return workflowMap[role];
}

function tableForRole(role: RoleId, pageLabel: string): RoleTable {
  if (role === "doctor") {
    return {
      columns: ["Clinical area", "Status", "Source", "Next action"],
      rows: [
        ["Patient context", "Workspace view", "Documentation/OpenAPI", "Connect authenticated clinical APIs"],
        [pageLabel, "Governed live workflow", "Clinical docs and governance evidence", "Review source links"],
        ["Safety area", "Visible", "AI assurance and privacy controls", "Clinician review required"]
      ]
    };
  }
  if (role === "patient") {
    return {
      columns: ["Portal area", "Status", "Language", "Next action"],
      rows: [
        [pageLabel, "Workspace view", "Patient-friendly", "Connect authenticated patient APIs"],
        ["Privacy and consent", "Visible", "Plain language", "Review consent source status"],
        ["Educational content", "Labeled", "Simple", "Confirm with care team"]
      ]
    };
  }
  if (role === "laboratory") {
    return {
      columns: ["Lab workflow", "Status", "Auditability", "Integration"],
      rows: [
        [pageLabel, "Governed workspace", "Audit link visible", "OpenAPI-backed laboratory workflow"],
        ["Specimen state", "Tracked visually", "Chain-of-custody label", "Approved LIS integration"],
        ["Critical result flag", "Visible", "Escalation label", "Governed notification workflow"]
      ]
    };
  }
  if (role === "radiology") {
    return {
      columns: ["Radiology workflow", "Status", "Viewer", "Integration"],
      rows: [
        [pageLabel, "Governed workspace", "Metadata/report UI", "OpenAPI-backed radiology workflow"],
        ["DICOM metadata", "Visible", "Image viewing governed externally", "PACS integration governed by approved imaging systems"],
        ["Critical findings", "Visible", "Report workflow", "Governed notification workflow"]
      ]
    };
  }
  if (role === "pharmacy") {
    return {
      columns: ["Pharmacy workflow", "Status", "Safety area", "Audit"],
      rows: [
        [pageLabel, "Governed workspace", "Visible", "Audit link visible"],
        ["Allergy safety", "Displayed", "Documentation-backed", "Connect pharmacy APIs"],
        ["Controlled medications", "Audit view", "Access controlled", "Approved live workflow"]
      ]
    };
  }
  return {
    columns: ["Admin area", "Status", "Source", "Action"],
    rows: [
      [pageLabel, "Governed workspace", "OpenAPI/release evidence", "Use approved admin APIs"],
      ["Identity and access", "Foundation-backed", "Provider configuration", "Validate live credentials"],
      ["Audit and compliance", "Visible", "Active services and docs", "Review evidence"]
    ]
  };
}

function panelsForRole(role: RoleId, pageLabel: string): RolePanel[] {
  const shared: RolePanel[] = [
    { title: "Data source", detail: sourceForRole(role), status: "Documentation-backed" },
    { title: "Live data", detail: "Live records are loaded only after secure authentication.", status: "Controlled access" },
    { title: "Auditability", detail: "Audit links and release evidence are surfaced where available.", status: "Available" }
  ];
  if (role === "doctor") {
    return [
      { title: "Patient context panel", detail: `${demoLabel}. Context uses protected workspace records and authenticated clinical API records when a secure provider session is active.`, status: "Evidence-backed" },
      { title: "Medication safety area", detail: "Allergy, interaction, duplicate therapy, and pharmacy review areas are governed by clinical safety boundaries.", status: "Evidence-backed" },
      { title: "Advisory AI", detail: "Advisory only. Clinician remains final decision maker.", status: "Available" },
      ...shared
    ];
  }
  if (role === "patient") {
    return [
      { title: "Patient-friendly language", detail: "Technical terms are reduced and educational content is labeled.", status: "Available" },
      { title: "Medical advice boundary", detail: "Portal content does not replace clinician advice.", status: "Available" },
      ...shared
    ];
  }
  if (role === "laboratory") {
    return [
      { title: "Order status", detail: "Order, specimen, validation, approval, and turnaround sections are visible.", status: "Documentation-backed" },
      { title: "Critical result flag", detail: "Critical result state and escalation label are visible.", status: "Available" },
      ...shared
    ];
  }
  if (role === "radiology") {
    return [
      { title: "DICOM scope", detail: "DICOM image viewing remains governed by approved imaging systems.", status: "Controlled access" },
      { title: "Report workflow", detail: "Metadata, report review, approval, and critical findings are visible.", status: "Evidence-backed" },
      ...shared
    ];
  }
  if (role === "pharmacy") {
    return [
      { title: "Drug safety alerts", detail: "Allergy, interaction, duplicate therapy, dispensing, and controlled-medication audit areas are visible.", status: "Documentation-backed" },
      { title: "Inventory status", detail: "Stock, batch, lot, expiration, and controlled medication sections use governed workspace visibility.", status: "Controlled access" },
      ...shared
    ];
  }
  return [
    { title: "Identity and access", detail: "Users, roles, permissions, tenants, and organizations are shown as OpenAPI-backed governed views.", status: "Documentation-backed" },
    { title: "System configuration", detail: "Configuration, release, health, API, security, privacy, and compliance surfaces are connected to existing evidence.", status: "Available" },
    ...shared
  ];
}

function chartForRole(role: RoleId): RoleMetric[] {
  const chartMap: Record<RoleId, RoleMetric[]> = {
    operator: [],
    doctor: [
      { label: "Clinical summary", value: "72", detail: "UI readiness", tone: "info" },
      { label: "Safety visibility", value: "88", detail: "Warnings and review areas", tone: "success" },
      { label: "Live clinical APIs", value: "28", detail: "Governed backend connection", tone: "info" }
    ],
    patient: [
      { label: "Mobile clarity", value: "86", detail: "Responsive patient layout", tone: "success" },
      { label: "Portal coverage", value: "70", detail: "Docs and UI workspace", tone: "info" },
      { label: "Live records", value: "22", detail: "Governed patient APIs", tone: "info" }
    ],
    laboratory: [
      { label: "Workflow coverage", value: "78", detail: "Order and specimen surfaces", tone: "info" },
      { label: "Critical visibility", value: "84", detail: "Critical flag areas", tone: "success" },
      { label: "Laboratory feeds", value: "18", detail: "Governed lab APIs", tone: "info" }
    ],
    radiology: [
      { label: "Report workflow", value: "82", detail: "Report and approval UI", tone: "success" },
      { label: "Metadata coverage", value: "76", detail: "DICOM metadata surface", tone: "info" },
      { label: "Image viewer", value: "Governed", detail: "External imaging system boundary", tone: "info" }
    ],
    pharmacy: [
      { label: "Safety visibility", value: "88", detail: "Safety status areas", tone: "success" },
      { label: "Inventory workspace", value: "74", detail: "Stock and batch UI", tone: "info" },
      { label: "Live dispensing", value: "20", detail: "Governed pharmacy APIs", tone: "info" }
    ],
    administrator: [
      { label: "Release evidence", value: "96", detail: "Official v4 evidence", tone: "success" },
      { label: "OpenAPI coverage", value: "92", detail: "26 documents", tone: "success" },
      { label: "Admin actions", value: "25", detail: "Governed admin APIs", tone: "info" }
    ]
  };
  return chartMap[role];
}
