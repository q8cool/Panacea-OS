import type { ModuleVisibility, NavSection } from "./types";

export const defaultRoute = "/command/executive-overview";

export const navSections: NavSection[] = [
  {
    title: "Command",
    items: [
      { label: "Executive Overview", route: "/command/executive-overview", icon: "LayoutDashboard", keywords: ["release", "overview", "status"] },
      { label: "System Health", route: "/command/system-health", icon: "Activity", keywords: ["health", "readiness", "metrics"] },
      { label: "Command Intelligence", route: "/command/global-command", icon: "Radar", keywords: ["command", "alerts", "crisis"] },
      { label: "Foundation Provider", route: "/command/foundation-provider", icon: "ShieldCheck", keywords: ["foundation", "jwks", "audit", "policy"] }
    ]
  },
  {
    title: "Care Platform",
    items: [
      { label: "Clinical Modules", route: "/clinical/modules", icon: "Stethoscope", keywords: ["clinical", "hospital", "care"] },
      { label: "Patient Experience", route: "/clinical/patient-experience", icon: "HeartHandshake", keywords: ["patient", "portal", "engagement"] },
      { label: "Education & Training", route: "/clinical/education", icon: "GraduationCap", keywords: ["training", "certification", "cme"] }
    ]
  },
  {
    title: "Enterprise",
    items: [
      { label: "Enterprise Modules", route: "/enterprise/modules", icon: "Building2", keywords: ["enterprise", "operations", "finance"] },
      { label: "Workforce", route: "/enterprise/workforce", icon: "Users", keywords: ["hr", "credentialing", "staff"] },
      { label: "Legal & Governance", route: "/enterprise/legal-governance", icon: "Scale", keywords: ["legal", "risk", "policy"] },
      { label: "Compliance & Privacy", route: "/enterprise/compliance-privacy", icon: "LockKeyhole", keywords: ["compliance", "privacy", "consent"] },
      { label: "Customer Success", route: "/enterprise/customer-success", icon: "LifeBuoy", keywords: ["support", "service", "customer"] },
      { label: "Product Management", route: "/enterprise/product-management", icon: "Boxes", keywords: ["roadmap", "feature", "release"] }
    ]
  },
  {
    title: "Intelligence",
    items: [
      { label: "AI & Governance", route: "/intelligence/ai-governance", icon: "BrainCircuit", keywords: ["ai", "assurance", "model risk"] },
      { label: "Autonomous Intelligence", route: "/intelligence/autonomous-foundation", icon: "Workflow", keywords: ["advisory", "trace", "approval"] },
      { label: "New Innovations", route: "/intelligence/innovations", icon: "Sparkles", keywords: ["innovation", "v4", "new"] }
    ]
  },
  {
    title: "Developer",
    items: [
      { label: "API Explorer", route: "/developer/api-explorer", icon: "Braces", keywords: ["openapi", "endpoint", "curl"] },
      { label: "Documentation Center", route: "/developer/documentation", icon: "BookOpen", keywords: ["docs", "guide", "manual"] },
      { label: "Demo Mode", route: "/developer/demo-mode", icon: "MonitorPlay", keywords: ["demo", "operator", "run"] }
    ]
  },
  {
    title: "Evidence",
    items: [
      { label: "Release Evidence", route: "/evidence/release", icon: "FileCheck2", keywords: ["release", "evidence", "ci"] },
      { label: "Legacy Coverage", route: "/evidence/legacy-coverage", icon: "GitCompare", keywords: ["legacy", "coverage", "preserved"] },
      { label: "User Journeys", route: "/evidence/user-journeys", icon: "Route", keywords: ["roles", "journey", "workflow"] }
    ]
  }
];

export const activeServiceModules: ModuleVisibility[] = [
  {
    id: "real-time-global-healthcare-command-intelligence-platform",
    title: "Real-Time Global Healthcare Command Intelligence",
    category: "Command",
    status: "Active API",
    summary: "Global, regional, country, hospital, and department command center records with advisory command recommendations and crisis coordination.",
    route: "/command/global-command",
    serviceId: "real-time-global-healthcare-command-intelligence-platform",
    docHints: ["Global_Command_Center_API", "Command_Intelligence_API", "Sprint_85"],
    hasUi: true,
    hasApi: true,
    hasOpenApi: true,
    hasDatabaseMigration: true,
    hasDockerRuntime: true,
    hasTests: true,
    userVisible: true
  },
  {
    id: "autonomous-healthcare-intelligence-foundation",
    title: "Autonomous Healthcare Intelligence Foundation",
    category: "Intelligence",
    status: "Active API",
    summary: "Advisory intelligence governance, policy, approval, safety, traceability, and autonomous-action prevention records.",
    route: "/intelligence/autonomous-foundation",
    serviceId: "autonomous-healthcare-intelligence-foundation",
    docHints: ["Autonomous_Intelligence_API", "Clinical_Intelligence_Governance_API", "Sprint_84"],
    hasUi: true,
    hasApi: true,
    hasOpenApi: true,
    hasDatabaseMigration: true,
    hasDockerRuntime: true,
    hasTests: true,
    userVisible: true
  },
  {
    id: "global-ai-assurance-safety-model-risk-management-platform",
    title: "Global AI Assurance, Safety and Model Risk",
    category: "AI Governance",
    status: "Active API",
    summary: "AI assurance inventory, model risk, safety testing, prompt and agent assurance, monitoring, incidents, and governance evidence.",
    route: "/intelligence/ai-governance",
    serviceId: "global-ai-assurance-safety-model-risk-management-platform",
    docHints: ["AI_Assurance_API", "Model_Risk_API", "AI_Incident_API", "Sprint_78"],
    hasUi: true,
    hasApi: true,
    hasOpenApi: true,
    hasDatabaseMigration: true,
    hasDockerRuntime: true,
    hasTests: true,
    userVisible: true
  },
  {
    id: "global-enterprise-data-privacy-consent-trust-platform",
    title: "Global Data Privacy, Consent and Trust",
    category: "Security and Privacy",
    status: "Active API",
    summary: "Consent lifecycle, data rights, privacy policies, sharing governance, trust profiles, and privacy monitoring.",
    route: "/enterprise/compliance-privacy",
    serviceId: "global-enterprise-data-privacy-consent-trust-platform",
    docHints: ["Privacy_API", "Consent_API", "Data_Rights_API", "Sprint_79"],
    hasUi: true,
    hasApi: true,
    hasOpenApi: true,
    hasDatabaseMigration: true,
    hasDockerRuntime: true,
    hasTests: true,
    userVisible: true
  },
  {
    id: "global-compliance-automation-regulatory-intelligence-platform",
    title: "Global Compliance Automation and Regulatory Intelligence",
    category: "Compliance",
    status: "Active API",
    summary: "Regulatory intelligence, compliance checks, audit management, certification lifecycle, policy compliance, and reporting.",
    route: "/enterprise/compliance-privacy",
    serviceId: "global-compliance-automation-regulatory-intelligence-platform",
    docHints: ["Regulatory_Intelligence_API", "Compliance_Automation_API", "Audit_Management_API", "Sprint_77"],
    hasUi: true,
    hasApi: true,
    hasOpenApi: true,
    hasDatabaseMigration: true,
    hasDockerRuntime: true,
    hasTests: true,
    userVisible: true
  },
  {
    id: "global-workforce-hr-credentialing-staff-experience-platform",
    title: "Global Workforce, HR, Credentialing and Staff Experience",
    category: "Enterprise",
    status: "Active API",
    summary: "Staff registry, credentials, workforce planning, staff experience, HR operations, compliance, and scheduling evidence.",
    route: "/enterprise/workforce",
    serviceId: "global-workforce-hr-credentialing-staff-experience-platform",
    docHints: ["Workforce_API", "Credentialing_API", "Staff_Experience_API", "Sprint_73"],
    hasUi: true,
    hasApi: true,
    hasOpenApi: true,
    hasDatabaseMigration: true,
    hasDockerRuntime: true,
    hasTests: true,
    userVisible: true
  },
  {
    id: "global-legal-contracting-risk-governance-platform",
    title: "Global Legal, Contracting, Risk and Enterprise Governance",
    category: "Enterprise",
    status: "Active API",
    summary: "Legal matters, contracts, enterprise risks, governance, policies, regulatory obligations, and audit trails.",
    route: "/enterprise/legal-governance",
    serviceId: "global-legal-contracting-risk-governance-platform",
    docHints: ["Legal_API", "Contract_Management_API", "Enterprise_Risk_API", "Sprint_74"],
    hasUi: true,
    hasApi: true,
    hasOpenApi: true,
    hasDatabaseMigration: true,
    hasDockerRuntime: true,
    hasTests: true,
    userVisible: true
  },
  {
    id: "global-customer-success-support-service-management-platform",
    title: "Global Customer Success, Support and Service Management",
    category: "Enterprise",
    status: "Active API",
    summary: "Customer registry, support tickets, service management, onboarding, communications, and support analytics.",
    route: "/enterprise/customer-success",
    serviceId: "global-customer-success-support-service-management-platform",
    docHints: ["Customer_Success_API", "Support_API", "Service_Management_API", "Sprint_75"],
    hasUi: true,
    hasApi: true,
    hasOpenApi: true,
    hasDatabaseMigration: true,
    hasDockerRuntime: true,
    hasTests: true,
    userVisible: true
  },
  {
    id: "global-product-management-roadmap-innovation-portfolio-platform",
    title: "Global Product Management, Roadmap and Innovation Portfolio",
    category: "Enterprise",
    status: "Active API",
    summary: "Product registry, roadmaps, innovation portfolio, requirements, feedback, and release governance.",
    route: "/enterprise/product-management",
    serviceId: "global-product-management-roadmap-innovation-portfolio-platform",
    docHints: ["Product_Management_API", "Roadmap_API", "Innovation_Portfolio_API", "Sprint_76"],
    hasUi: true,
    hasApi: true,
    hasOpenApi: true,
    hasDatabaseMigration: true,
    hasDockerRuntime: true,
    hasTests: true,
    userVisible: true
  }
];

export const clinicalModules: ModuleVisibility[] = [
  moduleDoc("patient-registry", "Patient Registry", "Clinical", "Patient identity and demographic records appear in historical planning and portal docs; no active patient registry service is present in this checkout.", ["patient_service", "Patient Portal"]),
  moduleDoc("clinical-core", "Clinical Core", "Clinical", "Clinical core is represented by historical docs and empty legacy folders; active v4 services intentionally avoid diagnosis and treatment execution.", ["clinical_core", "Clinical User"]),
  moduleDoc("laboratory", "Laboratory", "Clinical", "Laboratory platform capabilities are documented in sprint history and integration requirements but are not active runtime services here.", ["Laboratory", "LOINC"]),
  moduleDoc("radiology", "Radiology", "Clinical", "Radiology platform capabilities are documentation-backed in this checkout, including reporting and integration references.", ["Radiology", "DICOM"]),
  moduleDoc("pharmacy", "Pharmacy", "Clinical", "Pharmacy and medication safety appear in historical evidence and safety constraints, not as a standalone active service.", ["Pharmacy", "Medication"]),
  moduleDoc("scheduling", "Scheduling", "Clinical", "Scheduling is referenced by workforce and operational planning docs; no active scheduling service is present.", ["Scheduling"]),
  moduleDoc("emergency", "Emergency", "Clinical", "Emergency workflows are represented in public health, command intelligence, and disaster medicine documentation.", ["Emergency", "Disaster"]),
  moduleDoc("inpatient", "Inpatient", "Clinical", "Inpatient platform is historical documentation in this checkout.", ["Inpatient"]),
  moduleDoc("icu", "ICU", "Clinical", "ICU workflows are documentation-backed and visible through command intelligence categories, not direct care UI.", ["ICU"]),
  moduleDoc("surgery", "Surgery", "Clinical", "Surgery operations are documented in command, scheduling, and safety plans, without active direct-care execution.", ["Surgery"]),
  moduleDoc("nursing", "Nursing", "Clinical", "Nursing workflows are documentation-backed; workforce APIs cover staff records and compliance.", ["Nursing", "Workforce"]),
  moduleDoc("blood-bank", "Blood Bank", "Clinical", "Blood bank platform remains historical documentation in this checkout.", ["Blood Bank"]),
  moduleDoc("infection-control", "Infection Control", "Clinical", "Infection control appears in historical docs and public health planning; no active service is present.", ["Infection"])
];

export const enterpriseDocModules: ModuleVisibility[] = [
  moduleDoc("revenue-cycle", "Revenue Cycle", "Enterprise", "Revenue cycle and global finance are documented; no active finance service is present in this checkout.", ["Revenue", "Finance", "Claims"]),
  moduleDoc("inventory", "Inventory", "Enterprise", "Inventory and supply chain are documentation-backed; no active inventory service is present.", ["Inventory", "Supply"]),
  moduleDoc("analytics", "Analytics", "Enterprise", "Analytics appears in architecture, data, and release docs; no standalone runtime analytics service is active.", ["Analytics", "Data"]),
  moduleDoc("quality", "Quality", "Enterprise", "Quality and patient safety evidence is historical documentation in this checkout.", ["Quality", "Safety"]),
  moduleDoc("research", "Research", "Enterprise", "Research, innovation, discovery, and federated learning are documented; no active research service is present.", ["Research", "Discovery"]),
  moduleDoc("telemedicine", "Telemedicine", "Enterprise", "Telemedicine remains documented capability, not active runtime in this checkout.", ["Telemedicine"]),
  moduleDoc("patient-portal", "Patient Portal", "Enterprise", "Patient portal capabilities are documented; this Sprint adds an operator UI, not patient self-service care workflows.", ["Patient Portal", "Patient Experience"]),
  moduleDoc("population-health", "Population Health", "Enterprise", "Population health appears in planning and public health docs; no active service is present.", ["Population"]),
  moduleDoc("developer-platform", "Developer Platform and Marketplace", "Enterprise", "Developer and marketplace capabilities are represented by product management APIs and documentation.", ["Developer", "Marketplace"]),
  moduleDoc("global-platform", "Global Healthcare Ecosystem", "Enterprise", "Global network, multi-country, data residency, and federation are documented and represented through governance fields in active APIs.", ["Global", "Multi-Country"])
];

export const innovationModules: ModuleVisibility[] = [
  moduleDoc("foundation-provider", "Live Foundation Provider", "Innovation", "External Foundation Provider is validated at foundation.utbe.ai for health, readiness, metrics, JWKS, audit append, and policy evaluation.", ["Foundation"]),
  moduleDoc("release-evidence", "Enterprise Release Evidence", "Innovation", "Release evidence, CI, runtime orchestration, security scans, and official closure reports are available in the repository.", ["Release", "Evidence"]),
  moduleDoc("runtime-orchestration", "Runtime Orchestration", "Innovation", "Runtime orchestration validates PostgreSQL-backed service startup and infrastructure behavior through scripts and reports.", ["Runtime", "Orchestration"]),
  moduleDoc("disaster-recovery", "Disaster Recovery Validation", "Innovation", "Disaster recovery mini-drill reports verify backup, restore, audit, and event outbox behavior.", ["Disaster", "Recovery"]),
  moduleDoc("multi-country", "Multi-Country Architecture", "Innovation", "Multi-country and data residency controls are present in documentation and active service governance fields.", ["Multi-Country", "Data Residency"]),
  moduleDoc("digital-twin", "Digital Twin", "Innovation", "Digital twin capabilities remain documentation-backed in this checkout.", ["Digital Twin"]),
  moduleDoc("knowledge-graph", "Medical Knowledge Graph", "Innovation", "Knowledge graph is represented in architecture and sprint documentation, not as an active runtime service.", ["Knowledge Graph"]),
  moduleDoc("developer-ecosystem", "Developer Ecosystem", "Innovation", "Product management APIs and docs cover roadmap and innovation portfolio; a marketplace UI is not active runtime.", ["Marketplace", "SDK"])
];

export const allModules = [
  ...activeServiceModules,
  ...clinicalModules,
  ...enterpriseDocModules,
  ...innovationModules
];

function moduleDoc(id: string, title: string, category: string, summary: string, docHints: string[]): ModuleVisibility {
  return {
    id,
    title,
    category,
    status: "Documentation-backed",
    summary,
    route: "/developer/documentation",
    docHints,
    hasUi: false,
    hasApi: false,
    hasOpenApi: false,
    hasDatabaseMigration: false,
    hasDockerRuntime: false,
    hasTests: false,
    userVisible: false
  };
}

export function findNavRoute(route: string) {
  return navSections.flatMap((section) => section.items).find((item) => item.route === route);
}

export function searchNav(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return navSections
    .flatMap((section) => section.items.map((item) => ({ section: section.title, ...item })))
    .filter((item) => [item.label, item.section, ...item.keywords].some((value) => value.toLowerCase().includes(normalized)));
}
