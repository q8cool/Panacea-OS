import { permissionAllows, prohibitedAutonomyPhrases } from "./command-domain.mjs";
import {
  assertNonEmptyString,
  CommandAuthorizationError,
  CommandValidationError
} from "./command-validation.mjs";

export const writeWorkflowPermission = "global_command_intelligence.write_workflows.write";

const baseWriteRoles = Object.freeze(["administrator", "operator", "global-command-intelligence-admin"]);

const writeWorkflowEvents = Object.freeze([
  "patient.created",
  "patient.updated",
  "encounter.created",
  "clinical.note.created",
  "allergy.created",
  "condition.created",
  "medication.created",
  "vital.signs.created",
  "care.team.updated",
  "lab.order.created",
  "specimen.collected",
  "specimen.received",
  "lab.result.entered",
  "lab.result.validated",
  "lab.result.approved",
  "critical.lab.result.flagged",
  "imaging.order.created",
  "imaging.study.started",
  "imaging.study.completed",
  "radiology.report.created",
  "radiology.report.approved",
  "critical.finding.flagged",
  "prescription.created",
  "prescription.reviewed",
  "medication.safety.validated",
  "medication.dispensed",
  "pharmacy.inventory.updated",
  "medication.safety.alert.flagged",
  "appointment.created",
  "appointment.updated",
  "appointment.cancelled",
  "appointment.checked_in",
  "appointment.completed",
  "user.created",
  "user.updated",
  "role.assigned",
  "role.created",
  "tenant.created",
  "organization.created",
  "department.created",
  "configuration.updated",
  "patient.appointment.requested",
  "patient.secure.message.sent",
  "patient.refill.requested",
  "patient.report.requested",
  "patient.communication.preferences.updated"
]);

function definition(input) {
  return Object.freeze({
    ...input,
    method: "POST",
    allowedRoles: Object.freeze([...new Set([...input.allowedRoles, ...baseWriteRoles])])
  });
}

export const writeWorkflowDefinitions = Object.freeze([
  definition({ path: "/write-workflows/clinical/patients", operationId: "createClinicalPatientWriteWorkflow", summary: "Create a governed tenant-scoped patient record", workspace: "clinical", workflowKey: "create_patient", eventType: "patient.created", allowedRoles: ["doctor"], subjectParam: null }),
  definition({ path: "/write-workflows/clinical/patients/{patientId}", operationId: "updateClinicalPatientWriteWorkflow", summary: "Update governed patient demographics or contacts", workspace: "clinical", workflowKey: "update_patient", eventType: "patient.updated", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/write-workflows/clinical/patients/{patientId}/encounters", operationId: "createClinicalEncounterWriteWorkflow", summary: "Create an encounter record", workspace: "clinical", workflowKey: "create_encounter", eventType: "encounter.created", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/write-workflows/clinical/patients/{patientId}/notes", operationId: "createClinicalNoteWriteWorkflow", summary: "Create a clinical note", workspace: "clinical", workflowKey: "create_clinical_note", eventType: "clinical.note.created", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/write-workflows/clinical/patients/{patientId}/allergies", operationId: "createClinicalAllergyWriteWorkflow", summary: "Create an allergy record", workspace: "clinical", workflowKey: "create_allergy", eventType: "allergy.created", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/write-workflows/clinical/patients/{patientId}/conditions", operationId: "createClinicalConditionWriteWorkflow", summary: "Create a condition record", workspace: "clinical", workflowKey: "create_condition", eventType: "condition.created", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/write-workflows/clinical/patients/{patientId}/medications", operationId: "createClinicalMedicationWriteWorkflow", summary: "Create a medication record", workspace: "clinical", workflowKey: "create_medication", eventType: "medication.created", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/write-workflows/clinical/patients/{patientId}/vitals", operationId: "createClinicalVitalSignsWriteWorkflow", summary: "Create a vital signs record", workspace: "clinical", workflowKey: "create_vital_signs", eventType: "vital.signs.created", allowedRoles: ["doctor"], subjectParam: "patientId" }),
  definition({ path: "/write-workflows/clinical/patients/{patientId}/care-team", operationId: "updateClinicalCareTeamWriteWorkflow", summary: "Update patient care team assignments", workspace: "clinical", workflowKey: "update_care_team", eventType: "care.team.updated", allowedRoles: ["doctor"], subjectParam: "patientId" }),

  definition({ path: "/write-workflows/laboratory/orders", operationId: "createLaboratoryOrderWriteWorkflow", summary: "Create a lab order", workspace: "laboratory", workflowKey: "create_lab_order", eventType: "lab.order.created", allowedRoles: ["laboratory"], subjectParam: null }),
  definition({ path: "/write-workflows/laboratory/specimens/{specimenId}/collect", operationId: "collectLaboratorySpecimenWriteWorkflow", summary: "Record specimen collection", workspace: "laboratory", workflowKey: "collect_specimen", eventType: "specimen.collected", allowedRoles: ["laboratory"], subjectParam: "specimenId" }),
  definition({ path: "/write-workflows/laboratory/specimens/{specimenId}/receive", operationId: "receiveLaboratorySpecimenWriteWorkflow", summary: "Record specimen receiving", workspace: "laboratory", workflowKey: "receive_specimen", eventType: "specimen.received", allowedRoles: ["laboratory"], subjectParam: "specimenId" }),
  definition({ path: "/write-workflows/laboratory/results", operationId: "enterLaboratoryResultWriteWorkflow", summary: "Enter a laboratory result", workspace: "laboratory", workflowKey: "enter_lab_result", eventType: "lab.result.entered", allowedRoles: ["laboratory"], subjectParam: null }),
  definition({ path: "/write-workflows/laboratory/results/{resultId}/validate", operationId: "validateLaboratoryResultWriteWorkflow", summary: "Validate a laboratory result", workspace: "laboratory", workflowKey: "validate_lab_result", eventType: "lab.result.validated", allowedRoles: ["laboratory"], subjectParam: "resultId" }),
  definition({ path: "/write-workflows/laboratory/results/{resultId}/approve", operationId: "approveLaboratoryResultWriteWorkflow", summary: "Approve a laboratory result", workspace: "laboratory", workflowKey: "approve_lab_result", eventType: "lab.result.approved", allowedRoles: ["laboratory"], subjectParam: "resultId" }),
  definition({ path: "/write-workflows/laboratory/results/{resultId}/critical", operationId: "flagCriticalLaboratoryResultWriteWorkflow", summary: "Flag a critical laboratory result", workspace: "laboratory", workflowKey: "flag_critical_lab_result", eventType: "critical.lab.result.flagged", allowedRoles: ["laboratory"], subjectParam: "resultId" }),

  definition({ path: "/write-workflows/radiology/orders", operationId: "createRadiologyOrderWriteWorkflow", summary: "Create an imaging order", workspace: "radiology", workflowKey: "create_imaging_order", eventType: "imaging.order.created", allowedRoles: ["radiology"], subjectParam: null }),
  definition({ path: "/write-workflows/radiology/studies/{studyId}/start", operationId: "startRadiologyStudyWriteWorkflow", summary: "Start an imaging study", workspace: "radiology", workflowKey: "start_imaging_study", eventType: "imaging.study.started", allowedRoles: ["radiology"], subjectParam: "studyId" }),
  definition({ path: "/write-workflows/radiology/studies/{studyId}/complete", operationId: "completeRadiologyStudyWriteWorkflow", summary: "Complete an imaging study", workspace: "radiology", workflowKey: "complete_imaging_study", eventType: "imaging.study.completed", allowedRoles: ["radiology"], subjectParam: "studyId" }),
  definition({ path: "/write-workflows/radiology/reports", operationId: "createRadiologyReportWriteWorkflow", summary: "Create a radiology report", workspace: "radiology", workflowKey: "create_radiology_report", eventType: "radiology.report.created", allowedRoles: ["radiology"], subjectParam: null }),
  definition({ path: "/write-workflows/radiology/reports/{reportId}/approve", operationId: "approveRadiologyReportWriteWorkflow", summary: "Approve a radiology report", workspace: "radiology", workflowKey: "approve_radiology_report", eventType: "radiology.report.approved", allowedRoles: ["radiology"], subjectParam: "reportId" }),
  definition({ path: "/write-workflows/radiology/reports/{reportId}/critical-findings", operationId: "flagRadiologyCriticalFindingWriteWorkflow", summary: "Flag a critical radiology finding", workspace: "radiology", workflowKey: "flag_critical_finding", eventType: "critical.finding.flagged", allowedRoles: ["radiology"], subjectParam: "reportId" }),

  definition({ path: "/write-workflows/pharmacy/prescriptions", operationId: "createPharmacyPrescriptionWriteWorkflow", summary: "Create a prescription", workspace: "pharmacy", workflowKey: "create_prescription", eventType: "prescription.created", allowedRoles: ["pharmacy"], subjectParam: null }),
  definition({ path: "/write-workflows/pharmacy/prescriptions/{prescriptionId}/review", operationId: "reviewPharmacyPrescriptionWriteWorkflow", summary: "Review a prescription", workspace: "pharmacy", workflowKey: "review_prescription", eventType: "prescription.reviewed", allowedRoles: ["pharmacy"], subjectParam: "prescriptionId" }),
  definition({ path: "/write-workflows/pharmacy/prescriptions/{prescriptionId}/validate", operationId: "validatePharmacyMedicationSafetyWriteWorkflow", summary: "Validate documented medication safety checks", workspace: "pharmacy", workflowKey: "validate_medication_safety", eventType: "medication.safety.validated", allowedRoles: ["pharmacy"], subjectParam: "prescriptionId" }),
  definition({ path: "/write-workflows/pharmacy/prescriptions/{prescriptionId}/dispense", operationId: "dispensePharmacyMedicationWriteWorkflow", summary: "Dispense medication", workspace: "pharmacy", workflowKey: "dispense_medication", eventType: "medication.dispensed", allowedRoles: ["pharmacy"], subjectParam: "prescriptionId" }),
  definition({ path: "/write-workflows/pharmacy/inventory", operationId: "updatePharmacyInventoryWriteWorkflow", summary: "Update pharmacy inventory", workspace: "pharmacy", workflowKey: "update_pharmacy_inventory", eventType: "pharmacy.inventory.updated", allowedRoles: ["pharmacy"], subjectParam: null }),
  definition({ path: "/write-workflows/pharmacy/safety-alerts", operationId: "flagPharmacySafetyAlertWriteWorkflow", summary: "Flag a documented medication safety alert", workspace: "pharmacy", workflowKey: "flag_medication_safety_alert", eventType: "medication.safety.alert.flagged", allowedRoles: ["pharmacy"], subjectParam: null }),

  definition({ path: "/write-workflows/scheduling/appointments", operationId: "createSchedulingAppointmentWriteWorkflow", summary: "Create an appointment", workspace: "scheduling", workflowKey: "create_appointment", eventType: "appointment.created", allowedRoles: ["administrator", "doctor"], subjectParam: null }),
  definition({ path: "/write-workflows/scheduling/appointments/{appointmentId}", operationId: "updateSchedulingAppointmentWriteWorkflow", summary: "Update an appointment", workspace: "scheduling", workflowKey: "update_appointment", eventType: "appointment.updated", allowedRoles: ["administrator", "doctor"], subjectParam: "appointmentId" }),
  definition({ path: "/write-workflows/scheduling/appointments/{appointmentId}/cancel", operationId: "cancelSchedulingAppointmentWriteWorkflow", summary: "Cancel an appointment", workspace: "scheduling", workflowKey: "cancel_appointment", eventType: "appointment.cancelled", allowedRoles: ["administrator", "doctor"], subjectParam: "appointmentId" }),
  definition({ path: "/write-workflows/scheduling/appointments/{appointmentId}/check-in", operationId: "checkInSchedulingAppointmentWriteWorkflow", summary: "Check in an appointment", workspace: "scheduling", workflowKey: "check_in_appointment", eventType: "appointment.checked_in", allowedRoles: ["administrator", "doctor"], subjectParam: "appointmentId" }),
  definition({ path: "/write-workflows/scheduling/appointments/{appointmentId}/complete", operationId: "completeSchedulingAppointmentWriteWorkflow", summary: "Complete an appointment", workspace: "scheduling", workflowKey: "complete_appointment", eventType: "appointment.completed", allowedRoles: ["administrator", "doctor"], subjectParam: "appointmentId" }),

  definition({ path: "/write-workflows/admin/users", operationId: "createAdminUserWriteWorkflow", summary: "Create a user", workspace: "admin", workflowKey: "create_user", eventType: "user.created", allowedRoles: ["administrator"], subjectParam: null }),
  definition({ path: "/write-workflows/admin/users/{userId}", operationId: "updateAdminUserWriteWorkflow", summary: "Update a user", workspace: "admin", workflowKey: "update_user", eventType: "user.updated", allowedRoles: ["administrator"], subjectParam: "userId" }),
  definition({ path: "/write-workflows/admin/users/{userId}/roles", operationId: "assignAdminUserRoleWriteWorkflow", summary: "Assign a role to a user", workspace: "admin", workflowKey: "assign_role", eventType: "role.assigned", allowedRoles: ["administrator"], subjectParam: "userId" }),
  definition({ path: "/write-workflows/admin/roles", operationId: "createAdminRoleWriteWorkflow", summary: "Create a role", workspace: "admin", workflowKey: "create_role", eventType: "role.created", allowedRoles: ["administrator"], subjectParam: null }),
  definition({ path: "/write-workflows/admin/tenants", operationId: "createAdminTenantWriteWorkflow", summary: "Create a tenant", workspace: "admin", workflowKey: "create_tenant", eventType: "tenant.created", allowedRoles: ["administrator"], subjectParam: null }),
  definition({ path: "/write-workflows/admin/organizations", operationId: "createAdminOrganizationWriteWorkflow", summary: "Create an organization", workspace: "admin", workflowKey: "create_organization", eventType: "organization.created", allowedRoles: ["administrator"], subjectParam: null }),
  definition({ path: "/write-workflows/admin/departments", operationId: "createAdminDepartmentWriteWorkflow", summary: "Create a department", workspace: "admin", workflowKey: "create_department", eventType: "department.created", allowedRoles: ["administrator"], subjectParam: null }),
  definition({ path: "/write-workflows/admin/configuration", operationId: "updateAdminConfigurationWriteWorkflow", summary: "Update approved configuration", workspace: "admin", workflowKey: "update_configuration", eventType: "configuration.updated", allowedRoles: ["administrator"], subjectParam: null }),

  definition({ path: "/write-workflows/patient-portal/appointment-requests", operationId: "requestPatientPortalAppointmentWriteWorkflow", summary: "Submit a patient appointment request", workspace: "patient_portal", workflowKey: "request_appointment", eventType: "patient.appointment.requested", allowedRoles: ["patient"], subjectParam: null, patientPortal: true }),
  definition({ path: "/write-workflows/patient-portal/messages", operationId: "sendPatientPortalSecureMessageWriteWorkflow", summary: "Send a patient secure message", workspace: "patient_portal", workflowKey: "send_secure_message", eventType: "patient.secure.message.sent", allowedRoles: ["patient"], subjectParam: null, patientPortal: true }),
  definition({ path: "/write-workflows/patient-portal/refill-requests", operationId: "requestPatientPortalRefillWriteWorkflow", summary: "Submit a patient refill request", workspace: "patient_portal", workflowKey: "request_refill", eventType: "patient.refill.requested", allowedRoles: ["patient"], subjectParam: null, patientPortal: true }),
  definition({ path: "/write-workflows/patient-portal/medical-report-requests", operationId: "requestPatientPortalMedicalReportWriteWorkflow", summary: "Submit a patient medical report request", workspace: "patient_portal", workflowKey: "request_medical_report", eventType: "patient.report.requested", allowedRoles: ["patient"], subjectParam: null, patientPortal: true }),
  definition({ path: "/write-workflows/patient-portal/preferences", operationId: "updatePatientPortalCommunicationPreferencesWriteWorkflow", summary: "Update patient communication preferences", workspace: "patient_portal", workflowKey: "update_communication_preferences", eventType: "patient.communication.preferences.updated", allowedRoles: ["patient"], subjectParam: null, patientPortal: true })
]);

const workflowMatchers = writeWorkflowDefinitions.map((item) => ({
  definition: item,
  regex: new RegExp(`^${item.path.replaceAll("/", "\\/").replace(/\{([^}]+)\}/g, "([^/]+)")}$`),
  params: [...item.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1])
}));

export function matchWriteWorkflowRoute(relativePath, method = "POST") {
  if (method !== "POST") return null;
  for (const matcher of workflowMatchers) {
    const match = matcher.regex.exec(relativePath);
    if (!match) continue;
    return {
      definition: matcher.definition,
      params: Object.fromEntries(matcher.params.map((param, index) => [param, decodeURIComponent(match[index + 1])]))
    };
  }
  return null;
}

export function assertPrincipalCanWriteWorkflow(principal, definition) {
  const roles = Array.isArray(principal.roles) ? principal.roles : [];
  const hasAllowedRole = roles.some((role) => definition.allowedRoles.includes(role));
  const hasPermission = permissionAllows(principal.permissions, writeWorkflowPermission) || permissionAllows(principal.permissions, "global_command_intelligence.*");
  if (!hasAllowedRole || !hasPermission) {
    throw new CommandAuthorizationError("principal is not authorized for this live write workflow", {
      requiredPermission: writeWorkflowPermission,
      allowedRoles: definition.allowedRoles,
      workspace: definition.workspace,
      workflowKey: definition.workflowKey
    });
  }
}

export function normalizeWriteWorkflowInput(input, definition, params, principal) {
  const candidate = validatePlainObject(input, "input");
  validateNoProhibitedAutonomy(candidate);
  const controls = validateWorkflowControls(candidate.workflowControls, definition);
  const subjectId = definition.subjectParam
    ? assertNonEmptyString(params[definition.subjectParam], definition.subjectParam, 180)
    : optionalString(candidate.subjectId, "subjectId", 180);
  return {
    tenantId: assertNonEmptyString(candidate.tenantId, "tenantId", 128),
    subjectId,
    title: optionalString(candidate.title, "title", 240) ?? definition.summary,
    reason: optionalString(candidate.reason, "reason", 1000),
    idempotencyKey: optionalString(candidate.idempotencyKey, "idempotencyKey", 180),
    payload: validatePlainObject(candidate.payload, "payload"),
    workflowControls: controls,
    requestContext: {
      ...optionalObject(candidate.requestContext, "requestContext"),
      actorId: principal.actorId,
      subjectType: principal.subjectType
    }
  };
}

export function requiredWriteWorkflowEvents() {
  return writeWorkflowEvents;
}

function validateWorkflowControls(value, definition) {
  const controls = validatePlainObject(value, "workflowControls");
  for (const fieldName of [
    "liveMode",
    "auditRequired",
    "tenantIsolationConfirmed",
    "humanUserConfirmed",
    "noAutonomousDiagnosis",
    "noAutonomousTreatment",
    "noAiGeneratedClinicalDecision"
  ]) {
    assertBooleanTrue(controls[fieldName], `workflowControls.${fieldName}`);
  }
  if (controls.demoData !== false) {
    throw new CommandValidationError("workflowControls.demoData must be false for live write workflows", { fieldName: "workflowControls.demoData" });
  }
  if (definition.patientPortal) {
    assertBooleanTrue(controls.patientClinicalRecordModificationBlocked, "workflowControls.patientClinicalRecordModificationBlocked");
  }
  if (definition.workspace === "pharmacy") {
    assertBooleanTrue(controls.documentedMedicationSafetyRulesApplied, "workflowControls.documentedMedicationSafetyRulesApplied");
  }
  return {
    liveMode: true,
    demoData: false,
    auditRequired: true,
    tenantIsolationConfirmed: true,
    humanUserConfirmed: true,
    noAutonomousDiagnosis: true,
    noAutonomousTreatment: true,
    noAiGeneratedClinicalDecision: true,
    patientClinicalRecordModificationBlocked: Boolean(controls.patientClinicalRecordModificationBlocked),
    documentedMedicationSafetyRulesApplied: Boolean(controls.documentedMedicationSafetyRulesApplied),
    sourceBoundary: optionalString(controls.sourceBoundary, "workflowControls.sourceBoundary", 240) ?? "live-foundation-authenticated-workflow"
  };
}

function validatePlainObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CommandValidationError(`${fieldName} must be an object`, { fieldName });
  }
  return value;
}

function optionalObject(value, fieldName) {
  if (value === undefined || value === null) return {};
  return validatePlainObject(value, fieldName);
}

function optionalString(value, fieldName, maxLength = 512) {
  if (value === undefined || value === null || value === "") return null;
  return assertNonEmptyString(value, fieldName, maxLength);
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new CommandValidationError(`${fieldName} must be true`, { fieldName });
  }
}

function collectStrings(value, output = []) {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, output);
    return output;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, output);
  }
  return output;
}

function validateNoProhibitedAutonomy(input) {
  const joined = collectStrings(input).join(" ").toLowerCase();
  for (const phrase of prohibitedAutonomyPhrases) {
    if (joined.includes(phrase)) {
      throw new CommandValidationError("live write workflow input contains prohibited autonomous clinical behavior", { phrase });
    }
  }
}
