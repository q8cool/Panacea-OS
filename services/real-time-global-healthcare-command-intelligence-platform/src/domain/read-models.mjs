import { permissionAllows } from "./command-domain.mjs";
import { CommandAuthorizationError, CommandValidationError } from "./command-validation.mjs";

export const readModelPermission = "global_command_intelligence.read_models.read";

const baseReadRoles = Object.freeze(["administrator", "operator", "global-command-intelligence-admin"]);

function definition({ path, operationId, summary, workspace, modelKey, allowedRoles, subjectParam = null, selfScoped = false }) {
  return Object.freeze({
    path,
    operationId,
    summary,
    workspace,
    modelKey,
    allowedRoles: Object.freeze([...new Set([...allowedRoles, ...baseReadRoles])]),
    subjectParam,
    selfScoped
  });
}

export const readModelDefinitions = Object.freeze([
  definition({ path: "/read-models/clinical/patients", operationId: "listClinicalPatientsReadModel", summary: "List tenant-scoped clinical patient read models", workspace: "clinical", modelKey: "patients", allowedRoles: ["doctor"] }),
  definition({ path: "/read-models/clinical/patients/{patientId}", operationId: "getClinicalPatientProfileReadModel", summary: "Get a tenant-scoped clinical patient profile read model", workspace: "clinical", modelKey: "patient_profile", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/summary", operationId: "getClinicalPatientSummaryReadModel", summary: "Get a clinical summary read model", workspace: "clinical", modelKey: "clinical_summary", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/timeline", operationId: "listClinicalPatientTimelineReadModel", summary: "List clinical timeline read models", workspace: "clinical", modelKey: "clinical_timeline", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/encounters", operationId: "listClinicalPatientEncountersReadModel", summary: "List encounter read models", workspace: "clinical", modelKey: "encounters", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/allergies", operationId: "listClinicalPatientAllergiesReadModel", summary: "List allergy read models", workspace: "clinical", modelKey: "allergies", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/conditions", operationId: "listClinicalPatientConditionsReadModel", summary: "List condition read models", workspace: "clinical", modelKey: "conditions", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/medications", operationId: "listClinicalPatientMedicationsReadModel", summary: "List medication read models", workspace: "clinical", modelKey: "medications", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/vitals", operationId: "listClinicalPatientVitalsReadModel", summary: "List vital sign read models", workspace: "clinical", modelKey: "vitals", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/notes", operationId: "listClinicalPatientNotesReadModel", summary: "List clinical note read models", workspace: "clinical", modelKey: "notes", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/orders", operationId: "listClinicalPatientOrdersReadModel", summary: "List order overview read models", workspace: "clinical", modelKey: "orders", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/labs", operationId: "listClinicalPatientLabsReadModel", summary: "List lab result summary read models", workspace: "clinical", modelKey: "labs", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/radiology", operationId: "listClinicalPatientRadiologyReadModel", summary: "List radiology report summary read models", workspace: "clinical", modelKey: "radiology", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/pharmacy-review", operationId: "listClinicalPatientPharmacyReviewReadModel", summary: "List pharmacy medication review read models", workspace: "clinical", modelKey: "pharmacy_review", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/alerts", operationId: "listClinicalPatientAlertsReadModel", summary: "List clinical alert read models", workspace: "clinical", modelKey: "alerts", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/tasks", operationId: "listClinicalPatientTasksReadModel", summary: "List clinical task read models", workspace: "clinical", modelKey: "tasks", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/read-models/clinical/patients/{patientId}/care-team", operationId: "listClinicalPatientCareTeamReadModel", summary: "List care team read models", workspace: "clinical", modelKey: "care_team", allowedRoles: ["doctor"], subjectParam: "patientId" }),

  definition({ path: "/read-models/patient-portal/me", operationId: "getPatientPortalMeReadModel", summary: "Get authenticated patient profile read model", workspace: "patient_portal", modelKey: "profile", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/appointments", operationId: "listPatientPortalAppointmentsReadModel", summary: "List authenticated patient appointment read models", workspace: "patient_portal", modelKey: "appointments", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/visits", operationId: "listPatientPortalVisitsReadModel", summary: "List authenticated patient visit read models", workspace: "patient_portal", modelKey: "visits", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/medications", operationId: "listPatientPortalMedicationsReadModel", summary: "List authenticated patient medication read models", workspace: "patient_portal", modelKey: "medications", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/allergies", operationId: "listPatientPortalAllergiesReadModel", summary: "List authenticated patient allergy read models", workspace: "patient_portal", modelKey: "allergies", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/labs", operationId: "listPatientPortalLabsReadModel", summary: "List authenticated patient lab result read models", workspace: "patient_portal", modelKey: "labs", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/radiology", operationId: "listPatientPortalRadiologyReadModel", summary: "List authenticated patient radiology report read models", workspace: "patient_portal", modelKey: "radiology", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/documents", operationId: "listPatientPortalDocumentsReadModel", summary: "List authenticated patient document read models", workspace: "patient_portal", modelKey: "documents", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/invoices", operationId: "listPatientPortalInvoicesReadModel", summary: "List authenticated patient invoice read models", workspace: "patient_portal", modelKey: "invoices", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/messages", operationId: "listPatientPortalMessagesReadModel", summary: "List authenticated patient message read models", workspace: "patient_portal", modelKey: "messages", allowedRoles: ["patient"], selfScoped: true }),
  definition({ path: "/read-models/patient-portal/me/care-instructions", operationId: "listPatientPortalCareInstructionsReadModel", summary: "List authenticated patient care instruction read models", workspace: "patient_portal", modelKey: "care_instructions", allowedRoles: ["patient"], selfScoped: true }),

  ...["dashboard", "orders", "specimens", "results", "critical-results", "quality-control", "reports"].map((key) =>
    definition({ path: `/read-models/laboratory/${key}`, operationId: `listLaboratory${toOperationPart(key)}ReadModel`, summary: `List laboratory ${key.replaceAll("-", " ")} read models`, workspace: "laboratory", modelKey: key.replaceAll("-", "_"), allowedRoles: ["laboratory"] })
  ),
  definition({ path: "/read-models/laboratory/specimens/{specimenId}", operationId: "getLaboratorySpecimenReadModel", summary: "Get laboratory specimen read model", workspace: "laboratory", modelKey: "specimen", allowedRoles: ["laboratory"], subjectParam: "specimenId" }),

  ...["dashboard", "orders", "studies", "pacs/status", "reporting-worklist", "reports", "critical-findings", "timeline"].map((key) =>
    definition({ path: `/read-models/radiology/${key}`, operationId: `listRadiology${toOperationPart(key)}ReadModel`, summary: `List radiology ${key.replaceAll("-", " ").replaceAll("/", " ")} read models`, workspace: "radiology", modelKey: key.replaceAll("-", "_").replaceAll("/", "_"), allowedRoles: ["radiology"] })
  ),
  definition({ path: "/read-models/radiology/studies/{studyId}", operationId: "getRadiologyStudyReadModel", summary: "Get radiology study read model", workspace: "radiology", modelKey: "study", allowedRoles: ["radiology"], subjectParam: "studyId" }),
  definition({ path: "/read-models/radiology/studies/{studyId}/dicom-metadata", operationId: "getRadiologyDicomMetadataReadModel", summary: "Get radiology DICOM metadata read model", workspace: "radiology", modelKey: "dicom_metadata", allowedRoles: ["radiology"], subjectParam: "studyId" }),

  ...["dashboard", "medications", "prescriptions", "dispensing", "inventory", "batches", "expiration-warnings", "safety-alerts", "controlled-medications"].map((key) =>
    definition({ path: `/read-models/pharmacy/${key}`, operationId: `listPharmacy${toOperationPart(key)}ReadModel`, summary: `List pharmacy ${key.replaceAll("-", " ")} read models`, workspace: "pharmacy", modelKey: key.replaceAll("-", "_"), allowedRoles: ["pharmacy"] })
  ),
  definition({ path: "/read-models/pharmacy/prescriptions/{prescriptionId}", operationId: "getPharmacyPrescriptionReadModel", summary: "Get pharmacy prescription read model", workspace: "pharmacy", modelKey: "prescription", allowedRoles: ["pharmacy"], subjectParam: "prescriptionId" }),

  ...["users", "roles", "permissions", "tenants", "organizations", "facilities", "departments", "configuration", "audit-logs", "security", "privacy", "compliance", "system-health", "release-evidence"].map((key) =>
    definition({ path: `/read-models/admin/${key}`, operationId: `listAdmin${toOperationPart(key)}ReadModel`, summary: `List administration ${key.replaceAll("-", " ")} read models`, workspace: "admin", modelKey: key.replaceAll("-", "_"), allowedRoles: ["administrator"] })
  )
]);

const readModelMatchers = readModelDefinitions.map((item) => ({
  definition: item,
  regex: new RegExp(`^${item.path.replaceAll("/", "\\/").replace(/\{([^}]+)\}/g, "([^/]+)")}$`),
  params: [...item.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1])
}));

export function matchReadModelRoute(relativePath) {
  for (const matcher of readModelMatchers) {
    const match = matcher.regex.exec(relativePath);
    if (!match) continue;
    return {
      definition: matcher.definition,
      params: Object.fromEntries(matcher.params.map((param, index) => [param, decodeURIComponent(match[index + 1])]))
    };
  }
  return null;
}

export function assertPrincipalCanReadModel(principal, definition) {
  const roles = Array.isArray(principal.roles) ? principal.roles : [];
  const hasAllowedRole = roles.some((role) => definition.allowedRoles.includes(role));
  const hasPermission = permissionAllows(principal.permissions, readModelPermission) || principal.permissions.includes("read");
  if (!hasAllowedRole || !hasPermission) {
    throw new CommandAuthorizationError("principal is not authorized for this live read model", {
      requiredPermission: readModelPermission,
      allowedRoles: definition.allowedRoles,
      workspace: definition.workspace,
      modelKey: definition.modelKey
    });
  }
}

export function normalizeReadModelQuery(searchParams) {
  const limit = boundedInteger(searchParams.get("limit"), 25, 1, 100);
  const offset = boundedInteger(searchParams.get("offset"), 0, 0, 10000);
  return { limit, offset };
}

export function subjectForReadModel(definition, params, principal) {
  if (definition.selfScoped) return principal.actorId;
  if (definition.subjectParam) return params[definition.subjectParam] ?? null;
  return null;
}

function boundedInteger(value, defaultValue, min, max) {
  if (value === null || value === "") return defaultValue;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new CommandValidationError(`pagination value must be an integer between ${min} and ${max}`);
  }
  return parsed;
}

function toOperationPart(value) {
  return value
    .split(/[-/]/g)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("");
}
