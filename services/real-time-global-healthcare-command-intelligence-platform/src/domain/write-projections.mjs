import { permissionAllows } from "./command-domain.mjs";
import { CommandAuthorizationError, CommandValidationError } from "./command-validation.mjs";

export const projectionReadPermission = "global_command_intelligence.write_workflows.read";
export const projectionRetryPermission = "global_command_intelligence.write_workflows.retry";

export const projectionStatuses = Object.freeze(["pending", "projected", "failed", "skipped", "replayed"]);

const projectionReviewRoles = Object.freeze(["administrator", "operator", "global-command-intelligence-admin"]);

const patientEventModelKeys = Object.freeze({
  "encounter.created": "encounters",
  "clinical.note.created": "notes",
  "allergy.created": "allergies",
  "condition.created": "conditions",
  "medication.created": "medications",
  "vital.signs.created": "vitals",
  "care.team.updated": "care_team"
});

export function assertPrincipalCanReviewProjections(principal) {
  const roles = Array.isArray(principal.roles) ? principal.roles : [];
  const hasRole = roles.some((role) => projectionReviewRoles.includes(role));
  const hasPermission = permissionAllows(principal.permissions, projectionReadPermission);
  if (!hasRole || !hasPermission) {
    throw new CommandAuthorizationError("principal is not authorized to review live write workflow projections", {
      requiredPermission: projectionReadPermission,
      allowedRoles: projectionReviewRoles
    });
  }
}

export function assertPrincipalCanRetryProjection(principal) {
  const roles = Array.isArray(principal.roles) ? principal.roles : [];
  const hasRole = roles.some((role) => projectionReviewRoles.includes(role));
  const hasPermission = permissionAllows(principal.permissions, projectionRetryPermission);
  if (!hasRole || !hasPermission) {
    throw new CommandAuthorizationError("principal is not authorized to retry live write workflow projections", {
      requiredPermission: projectionRetryPermission,
      allowedRoles: projectionReviewRoles
    });
  }
}

export function normalizeProjectionListQuery(searchParams) {
  const limit = boundedInteger(searchParams.get("limit"), 25, 1, 100);
  const offset = boundedInteger(searchParams.get("offset"), 0, 0, 10000);
  const status = optionalEnum(searchParams.get("status"), projectionStatuses, "status");
  const eventType = optionalString(searchParams.get("eventType"), "eventType", 160);
  return { limit, offset, status, eventType };
}

export function createWriteWorkflowProjections(record, event, processedAt) {
  const context = projectionContext(record, event, processedAt);
  const targets = projectionTargets(context);
  return targets.map((readModel) => ({
    id: projectionId(event.id, readModel.workspace, readModel.modelKey, readModel.subjectId, readModel.id),
    tenantId: record.tenantId,
    eventId: event.id,
    eventType: event.eventType,
    workflowId: record.id,
    projectionTarget: `${readModel.workspace}.${readModel.modelKey}.${readModel.subjectId ?? "collection"}`,
    readModelId: readModel.id,
    projectionStatus: "projected",
    processedAt,
    failureReason: null,
    retryCount: 0,
    correlationId: context.correlationId,
    requestId: context.requestId,
    actorId: record.createdBy,
    payload: {
      source: "live-write-projection",
      replaySafe: true,
      targetReadModel: readModel
    },
    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    createdAt: processedAt,
    updatedAt: processedAt,
    readModel
  }));
}

export function projectionSummary(projection) {
  return {
    id: projection.id,
    eventId: projection.eventId,
    eventType: projection.eventType,
    workflowId: projection.workflowId,
    projectionTarget: projection.projectionTarget,
    readModelId: projection.readModelId,
    status: projection.projectionStatus,
    processedAt: projection.processedAt,
    failureReason: projection.failureReason,
    retryCount: projection.retryCount,
    correlationId: projection.correlationId,
    requestId: projection.requestId,
    actorId: projection.actorId
  };
}

export function assertRetryableProjection(projection) {
  if (!projection) {
    throw new CommandValidationError("projection does not exist", { projectionId: null });
  }
  if (projection.projectionStatus !== "failed") {
    throw new CommandValidationError("only failed projections may be retried", {
      projectionId: projection.id,
      status: projection.projectionStatus
    });
  }
  const targetReadModel = projection.payload?.targetReadModel;
  if (!targetReadModel || typeof targetReadModel !== "object") {
    throw new CommandValidationError("projection retry payload is missing its replay-safe read model", {
      projectionId: projection.id
    });
  }
}

function projectionContext(record, event, processedAt) {
  const subjectId = subjectFrom(record);
  return {
    record,
    event,
    processedAt,
    subjectId,
    requestId: stringOrNull(record.requestContext?.requestId ?? event.payload?.requestId),
    correlationId: stringOrNull(record.requestContext?.correlationId ?? event.payload?.correlationId),
    title: record.title || `${record.workflowKey} accepted`,
    basePayload: {
      source: "live-write-projection",
      workflowId: record.id,
      workflowGroup: record.workflowGroup,
      workflowKey: record.workflowKey,
      eventId: event.id,
      eventType: event.eventType,
      subjectId,
      title: record.title,
      reason: record.reason,
      actorId: record.createdBy,
      tenantId: record.tenantId,
      correlationId: stringOrNull(record.requestContext?.correlationId ?? event.payload?.correlationId),
      requestId: stringOrNull(record.requestContext?.requestId ?? event.payload?.requestId),
      occurredAt: event.occurredAt,
      payload: record.payload,
      controls: {
        liveMode: true,
        demoData: false,
        auditRequired: true,
        noAutonomousDiagnosis: true,
        noAutonomousTreatment: true,
        humanUserConfirmed: true
      }
    }
  };
}

function projectionTargets(context) {
  const { event } = context;
  if (event.eventType === "patient.created" || event.eventType === "patient.updated") {
    const title = patientDisplayTitle(context);
    return [
      target(context, "clinical", "patients", context.subjectId, title),
      target(context, "clinical", "patient_profile", context.subjectId, title),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${title} timeline`)
    ];
  }
  if (patientEventModelKeys[event.eventType]) {
    const modelKey = patientEventModelKeys[event.eventType];
    const rows = [
      target(context, "clinical", modelKey, context.subjectId, context.title),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${context.title} timeline`)
    ];
    if (event.eventType === "medication.created") {
      rows.push(target(context, "clinical", "pharmacy_review", context.subjectId, `${context.title} pharmacy review`));
      rows.push(target(context, "patient_portal", "medications", context.subjectId, `${context.title} patient medication`));
    }
    if (event.eventType === "allergy.created") {
      rows.push(target(context, "patient_portal", "allergies", context.subjectId, `${context.title} patient allergy`));
    }
    return rows;
  }
  if (event.eventType === "clinical.file.ingested" || event.eventType === "clinical.file.extracted" || event.eventType === "clinical.file.analyzed") {
    return [
      target(context, "clinical", "files", context.subjectId, context.title),
      target(context, "clinical", "reports", context.subjectId, `${context.title} report record`),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${context.title} timeline`),
      target(context, "patient_portal", "documents", context.subjectId, `${context.title} patient document`)
    ];
  }
  if (event.eventType === "clinical.patient.chat.logged") {
    return [
      target(context, "clinical", "patient_chat", context.subjectId, context.title),
      target(context, "clinical", "notes", context.subjectId, `${context.title} note`),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${context.title} timeline`)
    ];
  }
  if (event.eventType === "clinical.global.chat.logged") {
    return [
      target(context, "clinical", "global_chat", context.subjectId, context.title),
      target(context, "admin", "audit_logs", context.subjectId, `${context.title} audit`)
    ];
  }
  if (event.eventType === "clinical.reasoning.completed") {
    return [
      target(context, "clinical", "clinical_reasoning", context.subjectId, context.title),
      target(context, "clinical", "clinical_summary", context.subjectId, `${context.title} summary`),
      target(context, "clinical", "alerts", context.subjectId, `${context.title} review alert`),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${context.title} timeline`)
    ];
  }
  if (event.eventType === "clinical.report.analyzed" || event.eventType === "clinical.report.translated") {
    return [
      target(context, "clinical", "reports", context.subjectId, context.title),
      target(context, "clinical", "labs", context.subjectId, `${context.title} lab review`),
      target(context, "clinical", "radiology", context.subjectId, `${context.title} radiology review`),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${context.title} timeline`)
    ];
  }
  if (event.eventType === "clinical.workflow.advanced") {
    return [
      target(context, "clinical", "workflow_actions", context.subjectId, context.title),
      target(context, "clinical", "tasks", context.subjectId, `${context.title} task`),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${context.title} timeline`)
    ];
  }
  if (event.eventType === "clinical.notification.sent") {
    return [
      target(context, "clinical", "notifications", context.subjectId, context.title),
      target(context, "clinical", "tasks", context.subjectId, `${context.title} follow up`),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${context.title} timeline`),
      target(context, "admin", "audit_logs", context.subjectId, `${context.title} audit`)
    ];
  }
  if (event.eventType.startsWith("lab.") || event.eventType.startsWith("specimen.") || event.eventType.startsWith("critical.lab.")) {
    return laboratoryTargets(context);
  }
  if (event.eventType.startsWith("imaging.") || event.eventType.startsWith("radiology.") || event.eventType.startsWith("critical.finding.")) {
    return radiologyTargets(context);
  }
  if (event.eventType.startsWith("prescription.") || event.eventType.startsWith("medication.") || event.eventType.startsWith("pharmacy.")) {
    return pharmacyTargets(context);
  }
  if (event.eventType.startsWith("appointment.")) {
    return appointmentTargets(context);
  }
  if (event.eventType.startsWith("treatment.")) {
    return [
      target(context, "clinical", "orders", context.subjectId, context.title),
      target(context, "clinical", "tasks", context.subjectId, `${context.title} review task`),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${context.title} timeline`)
    ];
  }
  if (event.eventType.startsWith("patient.")) {
    return patientPortalTargets(context);
  }
  return adminTargets(context);
}

function laboratoryTargets(context) {
  const { event } = context;
  if (event.eventType === "lab.order.created") {
    return [
      target(context, "laboratory", "orders", context.subjectId, context.title),
      target(context, "clinical", "orders", context.subjectId, `${context.title} order`)
    ];
  }
  if (event.eventType === "specimen.collected" || event.eventType === "specimen.received") {
    return [
      target(context, "laboratory", "specimens", context.subjectId, context.title),
      target(context, "laboratory", "specimen", context.subjectId, context.title)
    ];
  }
  if (event.eventType === "critical.lab.result.flagged") {
    return [
      target(context, "laboratory", "critical_results", context.subjectId, context.title),
      target(context, "clinical", "alerts", context.subjectId, `${context.title} alert`)
    ];
  }
  return [
    target(context, "laboratory", "results", context.subjectId, context.title),
    target(context, "clinical", "labs", context.subjectId, `${context.title} lab summary`),
    target(context, "patient_portal", "labs", context.subjectId, `${context.title} patient lab`)
  ];
}

function radiologyTargets(context) {
  const { event } = context;
  if (event.eventType === "imaging.order.created") {
    return [
      target(context, "radiology", "orders", context.subjectId, context.title),
      target(context, "clinical", "orders", context.subjectId, `${context.title} imaging order`)
    ];
  }
  if (event.eventType === "imaging.study.started" || event.eventType === "imaging.study.completed") {
    return [
      target(context, "radiology", "studies", context.subjectId, context.title),
      target(context, "radiology", "study", context.subjectId, context.title),
      target(context, "radiology", "timeline", context.subjectId, `${context.title} timeline`)
    ];
  }
  if (event.eventType === "critical.finding.flagged") {
    return [
      target(context, "radiology", "critical_findings", context.subjectId, context.title),
      target(context, "clinical", "alerts", context.subjectId, `${context.title} alert`)
    ];
  }
  return [
    target(context, "radiology", "reports", context.subjectId, context.title),
    target(context, "radiology", "reporting_worklist", context.subjectId, `${context.title} worklist`),
    target(context, "clinical", "radiology", context.subjectId, `${context.title} radiology summary`),
    target(context, "patient_portal", "radiology", context.subjectId, `${context.title} patient radiology`)
  ];
}

function pharmacyTargets(context) {
  const { event } = context;
  if (event.eventType === "pharmacy.inventory.updated") {
    return [target(context, "pharmacy", "inventory", context.subjectId, context.title)];
  }
  if (event.eventType === "medication.safety.alert.flagged") {
    return [
      target(context, "pharmacy", "safety_alerts", context.subjectId, context.title),
      target(context, "clinical", "alerts", context.subjectId, `${context.title} medication alert`)
    ];
  }
  if (event.eventType === "pharmacy.safety.checked") {
    return [
      target(context, "pharmacy", "safety_alerts", context.subjectId, context.title),
      target(context, "clinical", "pharmacy_review", context.subjectId, `${context.title} review`),
      target(context, "clinical", "alerts", context.subjectId, `${context.title} safety review`),
      target(context, "clinical", "clinical_timeline", context.subjectId, `${context.title} timeline`)
    ];
  }
  if (event.eventType === "medication.dispensed") {
    return [
      target(context, "pharmacy", "dispensing", context.subjectId, context.title),
      target(context, "patient_portal", "medications", context.subjectId, `${context.title} dispensed`)
    ];
  }
  return [
    target(context, "pharmacy", "prescriptions", context.subjectId, context.title),
    target(context, "pharmacy", "prescription", context.subjectId, context.title),
    target(context, "clinical", "pharmacy_review", context.subjectId, `${context.title} review`)
  ];
}

function appointmentTargets(context) {
  const rows = [
    target(context, "patient_portal", "appointments", context.subjectId, context.title),
    target(context, "clinical", "orders", context.subjectId, `${context.title} appointment`)
  ];
  if (context.event.eventType === "appointment.checked_in" || context.event.eventType === "appointment.completed") {
    rows.push(target(context, "patient_portal", "visits", context.subjectId, `${context.title} visit`));
    rows.push(target(context, "clinical", "encounters", context.subjectId, `${context.title} encounter`));
  }
  return rows;
}

function patientPortalTargets(context) {
  if (context.event.eventType === "patient.secure.message.sent") {
    return [target(context, "patient_portal", "messages", context.subjectId, context.title)];
  }
  if (context.event.eventType === "patient.refill.requested") {
    return [
      target(context, "patient_portal", "medications", context.subjectId, context.title),
      target(context, "pharmacy", "prescriptions", context.subjectId, `${context.title} refill queue`)
    ];
  }
  if (context.event.eventType === "patient.report.requested") {
    return [target(context, "patient_portal", "documents", context.subjectId, context.title)];
  }
  if (context.event.eventType === "patient.communication.preferences.updated") {
    return [target(context, "patient_portal", "profile", context.subjectId, context.title)];
  }
  return [target(context, "patient_portal", "appointments", context.subjectId, context.title)];
}

function adminTargets(context) {
  const map = {
    "user.created": "users",
    "user.updated": "users",
    "role.assigned": "roles",
    "role.created": "roles",
    "tenant.created": "tenants",
    "organization.created": "organizations",
    "department.created": "departments",
    "configuration.updated": "configuration"
  };
  return [target(context, "admin", map[context.event.eventType] ?? "system_health", context.subjectId, context.title)];
}

function target(context, workspace, modelKey, subjectId, title) {
  const modelSubject = subjectId || context.record.id;
  const id = readModelId(context.event.id, workspace, modelKey, modelSubject);
  return {
    id,
    tenantId: context.record.tenantId,
    workspace,
    modelKey,
    subjectId: modelSubject,
    status: "active",
    title: title || context.title,
    payload: {
      ...context.basePayload,
      ...patientDisplayFields(context.record.payload),
      projectionTarget: `${workspace}.${modelKey}`,
      projectionStatus: "projected",
      readModelId: id
    },
    createdBy: context.record.createdBy,
    updatedBy: context.record.updatedBy,
    createdAt: context.processedAt,
    updatedAt: context.processedAt
  };
}

function patientDisplayTitle(context) {
  return stringOrNull(
    context.record.payload?.fullName ??
    context.record.payload?.patientName ??
    context.record.payload?.full_name ??
    context.title
  ) ?? context.title;
}

function patientDisplayFields(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  const fullName = stringOrNull(payload.fullName ?? payload.patientName ?? payload.full_name);
  const medicalRecordNumber = stringOrNull(payload.medicalRecordNumber ?? payload.fileNumber ?? payload.file_number);
  const bloodType = stringOrNull(payload.bloodType ?? payload.blood_type);
  const dateOfBirth = stringOrNull(payload.dateOfBirth ?? payload.date_of_birth);
  const gender = stringOrNull(payload.gender);
  const phoneNumber = stringOrNull(payload.phoneNumber ?? payload.phone_number);
  const nationalId = stringOrNull(payload.nationalId ?? payload.national_id);
  const emergencyContact = stringOrNull(payload.emergencyContact ?? payload.emergency_contact);
  return Object.fromEntries(Object.entries({
    fullName,
    patientName: fullName,
    full_name: fullName,
    medicalRecordNumber,
    fileNumber: medicalRecordNumber,
    file_number: medicalRecordNumber,
    bloodType,
    blood_type: bloodType,
    dateOfBirth,
    date_of_birth: dateOfBirth,
    gender,
    phoneNumber,
    phone_number: phoneNumber,
    nationalId,
    national_id: nationalId,
    emergencyContact,
    emergency_contact: emergencyContact
  }).filter(([, value]) => value));
}

function subjectFrom(record) {
  const candidates = [
    record.subjectId,
    record.payload?.patientId,
    record.payload?.subjectId,
    record.payload?.appointmentId,
    record.payload?.specimenId,
    record.payload?.resultId,
    record.payload?.studyId,
    record.payload?.reportId,
    record.payload?.prescriptionId,
    record.payload?.fileId,
    record.payload?.orderId,
    record.payload?.workflowId,
    record.id
  ];
  return String(candidates.find((value) => typeof value === "string" && value.trim()) ?? record.id);
}

function projectionId(eventId, workspace, modelKey, subjectId, readModelIdValue) {
  return `projection:${eventId}:${workspace}:${modelKey}:${subjectId ?? "collection"}:${readModelIdValue}`;
}

function readModelId(eventId, workspace, modelKey, subjectId) {
  return `read:${eventId}:${workspace}:${modelKey}:${subjectId ?? "collection"}`;
}

function optionalString(value, fieldName, maxLength) {
  if (value === null || value === "") return undefined;
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maxLength) {
    throw new CommandValidationError(`${fieldName} must be a non-empty string up to ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function optionalEnum(value, allowed, fieldName) {
  const normalized = optionalString(value, fieldName, 40);
  if (!normalized) return undefined;
  if (!allowed.includes(normalized)) {
    throw new CommandValidationError(`${fieldName} must be one of: ${allowed.join(", ")}`, { fieldName });
  }
  return normalized;
}

function boundedInteger(value, defaultValue, min, max) {
  if (value === null || value === "") return defaultValue;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new CommandValidationError(`pagination value must be an integer between ${min} and ${max}`);
  }
  return parsed;
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
