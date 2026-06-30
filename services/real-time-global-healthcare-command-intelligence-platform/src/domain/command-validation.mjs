import {
  commandStatuses,
  integrationSources,
  isKnownRecordType,
  permissionAllows,
  permissionsByGroup,
  prohibitedAutonomyPhrases,
  recordGroups
} from "./command-domain.mjs";

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const countryCodePattern = /^[A-Z]{2}$/;
const priorities = Object.freeze(["low", "medium", "high", "critical"]);
const riskLevels = Object.freeze(["minimal", "low", "moderate", "high", "critical"]);

export class CommandValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CommandValidationError";
    this.details = details;
  }
}

export class CommandAuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CommandAuthorizationError";
    this.details = details;
  }
}

export function assertNonEmptyString(value, fieldName, maxLength = 512) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new CommandValidationError(`${fieldName} is required`, { fieldName });
  }
  if (value.length > maxLength) {
    throw new CommandValidationError(`${fieldName} exceeds ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new CommandValidationError(`${fieldName} must be true`, { fieldName });
  }
}

function validatePlainObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CommandValidationError(`${fieldName} must be an object`, { fieldName });
  }
  return value;
}

function optionalObject(value, fieldName) {
  if (value === undefined || value === null) {
    return {};
  }
  return validatePlainObject(value, fieldName);
}

function optionalArray(value, fieldName) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new CommandValidationError(`${fieldName} must be an array`, { fieldName });
  }
  return value;
}

function optionalString(value, fieldName, maxLength = 512) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return assertNonEmptyString(value, fieldName, maxLength);
}

function validateDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 64);
  if (!isoDatePattern.test(raw) && !isoDateTimePattern.test(raw)) {
    throw new CommandValidationError(`${fieldName} must be an ISO date or ISO date-time`, { fieldName });
  }
  return raw;
}

function validateCountryCode(value, fieldName = "countryCode") {
  const raw = assertNonEmptyString(value, fieldName, 2).toUpperCase();
  if (!countryCodePattern.test(raw)) {
    throw new CommandValidationError(`${fieldName} must be an ISO 3166-1 alpha-2 country code`, { fieldName });
  }
  return raw;
}

function validateEnum(value, allowed, fieldName) {
  const raw = assertNonEmptyString(value, fieldName, 96);
  if (!allowed.includes(raw)) {
    throw new CommandValidationError(`${fieldName} is not supported`, { [fieldName]: raw });
  }
  return raw;
}

function validateNumber(value, fieldName, { min = 0, max = 100, nullable = true } = {}) {
  if ((value === undefined || value === null || value === "") && nullable) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new CommandValidationError(`${fieldName} must be a number between ${min} and ${max}`, { fieldName });
  }
  return value;
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
      throw new CommandValidationError("command intelligence input contains prohibited autonomous clinical or emergency behavior", { phrase });
    }
  }
}

export function validatePrincipal(principal) {
  const actor = validatePlainObject(principal, "principal");
  const permissions = optionalArray(actor.permissions, "principal.permissions").map((permission, index) =>
    assertNonEmptyString(permission, `principal.permissions[${index}]`, 180)
  );
  if (permissions.length === 0) {
    throw new CommandAuthorizationError("principal.permissions must include at least one permission");
  }
  return {
    tenantId: assertNonEmptyString(actor.tenantId, "principal.tenantId", 128),
    actorId: assertNonEmptyString(actor.actorId, "principal.actorId", 128),
    subjectType: optionalString(actor.subjectType, "principal.subjectType", 80) ?? "user",
    roles: optionalArray(actor.roles, "principal.roles").map((role, index) =>
      assertNonEmptyString(role, `principal.roles[${index}]`, 120)
    ),
    permissions,
    countryCodes: optionalArray(actor.countryCodes, "principal.countryCodes").map((countryCode, index) =>
      validateCountryCode(countryCode, `principal.countryCodes[${index}]`)
    ),
    regionCodes: optionalArray(actor.regionCodes, "principal.regionCodes").map((regionCode, index) =>
      assertNonEmptyString(regionCode, `principal.regionCodes[${index}]`, 80)
    )
  };
}

export function assertPrincipalCanWriteGroup(principal, recordGroup) {
  const normalized = validatePrincipal(principal);
  const requiredPermission = permissionsByGroup[recordGroup];
  if (!requiredPermission || !permissionAllows(normalized.permissions, requiredPermission)) {
    throw new CommandAuthorizationError("principal is not authorized for this command intelligence action", {
      requiredPermission,
      recordGroup
    });
  }
  return normalized;
}

function validatePolicyControls(value) {
  const policy = validatePlainObject(value, "policyControls");
  for (const fieldName of [
    "policyApproved",
    "humanApprovalRequired",
    "governanceApprovalRequired",
    "clinicalApprovalProtected",
    "auditPolicyApplied",
    "tenantIsolationApplied",
    "regionalGovernanceApplied",
    "countryPolicyApplied",
    "emergencyAccessGoverned",
    "autonomousExecutionBlocked"
  ]) {
    assertBooleanTrue(policy[fieldName], `policyControls.${fieldName}`);
  }
  return {
    policyId: assertNonEmptyString(policy.policyId, "policyControls.policyId", 160),
    policyVersion: assertNonEmptyString(policy.policyVersion, "policyControls.policyVersion", 80),
    policyApproved: true,
    humanApprovalRequired: true,
    governanceApprovalRequired: true,
    clinicalApprovalProtected: true,
    auditPolicyApplied: true,
    tenantIsolationApplied: true,
    regionalGovernanceApplied: true,
    countryPolicyApplied: true,
    emergencyAccessGoverned: true,
    autonomousExecutionBlocked: true,
    approvalReference: assertNonEmptyString(policy.approvalReference, "policyControls.approvalReference", 180),
    governingBody: assertNonEmptyString(policy.governingBody, "policyControls.governingBody", 180),
    effectiveDate: validateDate(policy.effectiveDate, "policyControls.effectiveDate"),
    expiresAt: validateDate(policy.expiresAt, "policyControls.expiresAt")
  };
}

function validateGovernanceContext(value) {
  const context = validatePlainObject(value, "governanceContext");
  for (const fieldName of [
    "advisoryOnly",
    "noAutonomousDiagnosis",
    "noAutonomousTreatment",
    "noAutonomousEmergencyEnforcement",
    "clinicianApprovalProtected",
    "governanceApprovalEnforced",
    "explainabilityRequired",
    "auditRequired",
    "tenantIsolationRequired",
    "multiCountryGovernanceChecked",
    "regionalPolicyChecked",
    "countryPolicyChecked"
  ]) {
    assertBooleanTrue(context[fieldName], `governanceContext.${fieldName}`);
  }
  return {
    advisoryOnly: true,
    noAutonomousDiagnosis: true,
    noAutonomousTreatment: true,
    noAutonomousEmergencyEnforcement: true,
    clinicianApprovalProtected: true,
    governanceApprovalEnforced: true,
    explainabilityRequired: true,
    auditRequired: true,
    tenantIsolationRequired: true,
    multiCountryGovernanceChecked: true,
    regionalPolicyChecked: true,
    countryPolicyChecked: true,
    approvedCountries: optionalArray(context.approvedCountries, "governanceContext.approvedCountries").map((countryCode, index) =>
      validateCountryCode(countryCode, `governanceContext.approvedCountries[${index}]`)
    ),
    approvedRegions: optionalArray(context.approvedRegions, "governanceContext.approvedRegions").map((regionCode, index) =>
      assertNonEmptyString(regionCode, `governanceContext.approvedRegions[${index}]`, 80)
    ),
    governingAuthorityIds: optionalArray(context.governingAuthorityIds, "governanceContext.governingAuthorityIds").map((id, index) =>
      assertNonEmptyString(id, `governanceContext.governingAuthorityIds[${index}]`, 160)
    )
  };
}

function validateEvidence(value) {
  const evidence = optionalArray(value, "evidence");
  if (evidence.length === 0) {
    throw new CommandValidationError("evidence must include at least one item");
  }
  return evidence.map((item, index) => {
    const entry = validatePlainObject(item, `evidence[${index}]`);
    return {
      evidenceType: assertNonEmptyString(entry.evidenceType, `evidence[${index}].evidenceType`, 120),
      reference: assertNonEmptyString(entry.reference, `evidence[${index}].reference`, 240),
      recordedAt: validateDate(entry.recordedAt, `evidence[${index}].recordedAt`),
      source: optionalString(entry.source, `evidence[${index}].source`, 160)
    };
  });
}

function validateWorkflowControls(value, recordGroup, recordType, status) {
  const workflow = validatePlainObject(value, "workflowControls");
  for (const fieldName of [
    "auditEnabled",
    "tenantIsolationVerified",
    "humanReviewRequired",
    "governanceApprovalRequired",
    "policyChecked",
    "explainabilityEnabled",
    "autonomousExecutionPrevented",
    "notificationPolicyApplied"
  ]) {
    assertBooleanTrue(workflow[fieldName], `workflowControls.${fieldName}`);
  }

  if (recordGroup === recordGroups.commandIntelligence) {
    assertBooleanTrue(workflow.commandScopeVerified, "workflowControls.commandScopeVerified");
    assertBooleanTrue(workflow.situationAwarenessValidated, "workflowControls.situationAwarenessValidated");
    if (recordType === "command_event_timeline") assertBooleanTrue(workflow.timelineEventSequenced, "workflowControls.timelineEventSequenced");
  }

  if (recordGroup === recordGroups.operationalIntelligence) {
    assertBooleanTrue(workflow.realTimeSignalValidated, "workflowControls.realTimeSignalValidated");
    assertBooleanTrue(workflow.operationalSourceVerified, "workflowControls.operationalSourceVerified");
    assertBooleanTrue(workflow.capacityImpactReviewed, "workflowControls.capacityImpactReviewed");
  }

  if (recordGroup === recordGroups.alertIntelligence) {
    assertBooleanTrue(workflow.alertSourceVerified, "workflowControls.alertSourceVerified");
    assertBooleanTrue(workflow.alertReviewRequired, "workflowControls.alertReviewRequired");
    if (recordType === "alert_correlation") assertBooleanTrue(workflow.alertCorrelationReviewed, "workflowControls.alertCorrelationReviewed");
    if (recordType === "alert_escalation" || status === "escalated") assertBooleanTrue(workflow.escalationApproved, "workflowControls.escalationApproved");
    if (recordType === "alert_suppression_rules") assertBooleanTrue(workflow.suppressionRuleApproved, "workflowControls.suppressionRuleApproved");
    if (recordType === "alert_resolution_tracking") assertBooleanTrue(workflow.resolutionEvidenceCaptured, "workflowControls.resolutionEvidenceCaptured");
  }

  if (recordGroup === recordGroups.crisisCoordination) {
    assertBooleanTrue(workflow.crisisAuthorityVerified, "workflowControls.crisisAuthorityVerified");
    assertBooleanTrue(workflow.emergencyAccessGoverned, "workflowControls.emergencyAccessGoverned");
    assertBooleanTrue(workflow.crossBoundaryCoordinationApproved, "workflowControls.crossBoundaryCoordinationApproved");
    if (recordType === "emergency_operations_workflow") assertBooleanTrue(workflow.emergencyWorkflowApproved, "workflowControls.emergencyWorkflowApproved");
    if (recordType === "mass_casualty_coordination") assertBooleanTrue(workflow.massCasualtyGovernanceChecked, "workflowControls.massCasualtyGovernanceChecked");
  }

  if (recordGroup === recordGroups.decisionSupport) {
    assertBooleanTrue(workflow.recommendationIsAdvisory, "workflowControls.recommendationIsAdvisory");
    assertBooleanTrue(workflow.recommendationExplainabilityCaptured, "workflowControls.recommendationExplainabilityCaptured");
    assertBooleanTrue(workflow.noAutonomousExecution, "workflowControls.noAutonomousExecution");
    assertBooleanTrue(workflow.governanceReviewQueued, "workflowControls.governanceReviewQueued");
  }

  if (recordGroup === recordGroups.executiveIntelligence) {
    assertBooleanTrue(workflow.executiveViewApproved, "workflowControls.executiveViewApproved");
    assertBooleanTrue(workflow.kpiSourceVerified, "workflowControls.kpiSourceVerified");
    assertBooleanTrue(workflow.riskSummaryReviewed, "workflowControls.riskSummaryReviewed");
    if (recordType === "executive_briefing_generator") assertBooleanTrue(workflow.briefingReviewed, "workflowControls.briefingReviewed");
  }

  return workflow;
}

export function validateCreateCommandRecordInput(input) {
  const candidate = validatePlainObject(input, "input");
  validateNoProhibitedAutonomy(candidate);
  const recordGroup = assertNonEmptyString(candidate.recordGroup, "recordGroup", 120);
  const recordType = assertNonEmptyString(candidate.recordType, "recordType", 160);
  if (!isKnownRecordType(recordGroup, recordType)) {
    throw new CommandValidationError("recordType is not supported for recordGroup", { recordGroup, recordType });
  }
  const status = validateEnum(candidate.status, commandStatuses, "status");
  return {
    tenantId: assertNonEmptyString(candidate.tenantId, "tenantId", 128),
    recordGroup,
    recordType,
    status,
    title: assertNonEmptyString(candidate.title, "title", 240),
    description: optionalString(candidate.description, "description", 2000),
    countryCode: validateCountryCode(candidate.countryCode),
    regionCode: assertNonEmptyString(candidate.regionCode, "regionCode", 80),
    jurisdictionCode: assertNonEmptyString(candidate.jurisdictionCode, "jurisdictionCode", 120),
    organizationId: optionalString(candidate.organizationId, "organizationId", 160),
    commandCenterId: optionalString(candidate.commandCenterId, "commandCenterId", 160),
    commandEventId: optionalString(candidate.commandEventId, "commandEventId", 160),
    situationId: optionalString(candidate.situationId, "situationId", 160),
    alertId: optionalString(candidate.alertId, "alertId", 160),
    crisisEventId: optionalString(candidate.crisisEventId, "crisisEventId", 160),
    coordinationId: optionalString(candidate.coordinationId, "coordinationId", 160),
    recommendationId: optionalString(candidate.recommendationId, "recommendationId", 160),
    briefingId: optionalString(candidate.briefingId, "briefingId", 160),
    facilityId: optionalString(candidate.facilityId, "facilityId", 160),
    departmentId: optionalString(candidate.departmentId, "departmentId", 160),
    ownerId: optionalString(candidate.ownerId, "ownerId", 160),
    approverId: optionalString(candidate.approverId, "approverId", 160),
    priority: candidate.priority ? validateEnum(candidate.priority, priorities, "priority") : null,
    riskLevel: candidate.riskLevel ? validateEnum(candidate.riskLevel, riskLevels, "riskLevel") : null,
    severity: candidate.severity ? validateEnum(candidate.severity, priorities, "severity") : null,
    confidenceScore: validateNumber(candidate.confidenceScore, "confidenceScore"),
    riskScore: validateNumber(candidate.riskScore, "riskScore"),
    urgencyScore: validateNumber(candidate.urgencyScore, "urgencyScore"),
    capacityImpactScore: validateNumber(candidate.capacityImpactScore, "capacityImpactScore"),
    startedAt: validateDate(candidate.startedAt, "startedAt"),
    updatedAtSignal: validateDate(candidate.updatedAtSignal, "updatedAtSignal"),
    escalatedAt: validateDate(candidate.escalatedAt, "escalatedAt"),
    resolvedAt: validateDate(candidate.resolvedAt, "resolvedAt"),
    generatedAt: validateDate(candidate.generatedAt, "generatedAt"),
    policyControls: validatePolicyControls(candidate.policyControls),
    governanceContext: validateGovernanceContext(candidate.governanceContext),
    workflowControls: validateWorkflowControls(candidate.workflowControls, recordGroup, recordType, status),
    evidence: validateEvidence(candidate.evidence),
    metrics: optionalObject(candidate.metrics, "metrics"),
    metadata: optionalObject(candidate.metadata, "metadata")
  };
}

export function validateIntegrationReferenceInput(input) {
  const candidate = validatePlainObject(input, "input");
  const sourceSystem = validateEnum(candidate.sourceSystem, integrationSources, "sourceSystem");
  return {
    tenantId: assertNonEmptyString(candidate.tenantId, "tenantId", 128),
    sourceSystem,
    sourceResourceType: assertNonEmptyString(candidate.sourceResourceType, "sourceResourceType", 160),
    sourceResourceId: assertNonEmptyString(candidate.sourceResourceId, "sourceResourceId", 180),
    commandResourceType: assertNonEmptyString(candidate.commandResourceType, "commandResourceType", 160),
    commandResourceId: assertNonEmptyString(candidate.commandResourceId, "commandResourceId", 180),
    countryCode: validateCountryCode(candidate.countryCode),
    regionCode: assertNonEmptyString(candidate.regionCode, "regionCode", 80),
    metadata: optionalObject(candidate.metadata, "metadata")
  };
}
