import {
  intelligenceStatuses,
  integrationSources,
  isKnownRecordType,
  permissionAllows,
  permissionsByGroup,
  prohibitedAutonomyPhrases,
  recordGroups
} from "./intelligence-domain.mjs";

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const countryCodePattern = /^[A-Z]{2}$/;
const priorities = Object.freeze(["low", "medium", "high", "critical"]);
const riskLevels = Object.freeze(["minimal", "low", "moderate", "high", "critical"]);

export class IntelligenceValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "IntelligenceValidationError";
    this.details = details;
  }
}

export class IntelligenceAuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "IntelligenceAuthorizationError";
    this.details = details;
  }
}

export function assertNonEmptyString(value, fieldName, maxLength = 512) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new IntelligenceValidationError(`${fieldName} is required`, { fieldName });
  }
  if (value.length > maxLength) {
    throw new IntelligenceValidationError(`${fieldName} exceeds ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new IntelligenceValidationError(`${fieldName} must be true`, { fieldName });
  }
}

function validatePlainObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new IntelligenceValidationError(`${fieldName} must be an object`, { fieldName });
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
    throw new IntelligenceValidationError(`${fieldName} must be an array`, { fieldName });
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
    throw new IntelligenceValidationError(`${fieldName} must be an ISO date or ISO date-time`, { fieldName });
  }
  return raw;
}

function validateCountryCode(value, fieldName = "countryCode") {
  const raw = assertNonEmptyString(value, fieldName, 2).toUpperCase();
  if (!countryCodePattern.test(raw)) {
    throw new IntelligenceValidationError(`${fieldName} must be an ISO 3166-1 alpha-2 country code`, { fieldName });
  }
  return raw;
}

function validateEnum(value, allowed, fieldName) {
  const raw = assertNonEmptyString(value, fieldName, 96);
  if (!allowed.includes(raw)) {
    throw new IntelligenceValidationError(`${fieldName} is not supported`, { [fieldName]: raw });
  }
  return raw;
}

function validateNumber(value, fieldName, { min = 0, max = 100, nullable = true } = {}) {
  if ((value === undefined || value === null || value === "") && nullable) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new IntelligenceValidationError(`${fieldName} must be a number between ${min} and ${max}`, { fieldName });
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
      throw new IntelligenceValidationError("intelligence input contains prohibited autonomous clinical behavior", { phrase });
    }
  }
}

export function validatePrincipal(principal) {
  const actor = validatePlainObject(principal, "principal");
  const permissions = optionalArray(actor.permissions, "principal.permissions").map((permission, index) =>
    assertNonEmptyString(permission, `principal.permissions[${index}]`, 180)
  );
  if (permissions.length === 0) {
    throw new IntelligenceAuthorizationError("principal.permissions must include at least one permission");
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
    )
  };
}

export function assertPrincipalCanWriteGroup(principal, recordGroup) {
  const normalized = validatePrincipal(principal);
  const requiredPermission = permissionsByGroup[recordGroup];
  if (!requiredPermission || !permissionAllows(normalized.permissions, requiredPermission)) {
    throw new IntelligenceAuthorizationError("principal is not authorized for this intelligence action", {
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
    "clinicianApprovalRequired",
    "auditPolicyApplied",
    "tenantIsolationApplied",
    "aiGovernanceApplied",
    "clinicalApprovalApplied",
    "emergencyStopAuthorized",
    "autonomousActionBlocked"
  ]) {
    assertBooleanTrue(policy[fieldName], `policyControls.${fieldName}`);
  }
  return {
    policyId: assertNonEmptyString(policy.policyId, "policyControls.policyId", 160),
    policyVersion: assertNonEmptyString(policy.policyVersion, "policyControls.policyVersion", 80),
    policyApproved: true,
    humanApprovalRequired: true,
    clinicianApprovalRequired: true,
    auditPolicyApplied: true,
    tenantIsolationApplied: true,
    aiGovernanceApplied: true,
    clinicalApprovalApplied: true,
    emergencyStopAuthorized: true,
    autonomousActionBlocked: true,
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
    "clinicianApprovalEnforced",
    "explainabilityRequired",
    "auditRequired",
    "tenantIsolationRequired",
    "multiCountryGovernanceChecked",
    "privacyConsentChecked"
  ]) {
    assertBooleanTrue(context[fieldName], `governanceContext.${fieldName}`);
  }
  return {
    advisoryOnly: true,
    noAutonomousDiagnosis: true,
    noAutonomousTreatment: true,
    clinicianApprovalEnforced: true,
    explainabilityRequired: true,
    auditRequired: true,
    tenantIsolationRequired: true,
    multiCountryGovernanceChecked: true,
    privacyConsentChecked: true,
    approvedCountries: optionalArray(context.approvedCountries, "governanceContext.approvedCountries").map((countryCode, index) =>
      validateCountryCode(countryCode, `governanceContext.approvedCountries[${index}]`)
    ),
    governingAuthorityIds: optionalArray(context.governingAuthorityIds, "governanceContext.governingAuthorityIds").map((id, index) =>
      assertNonEmptyString(id, `governanceContext.governingAuthorityIds[${index}]`, 160)
    )
  };
}

function validateEvidence(value) {
  const evidence = optionalArray(value, "evidence");
  if (evidence.length === 0) {
    throw new IntelligenceValidationError("evidence must include at least one item");
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
    "policyChecked",
    "aiGovernanceVerified",
    "clinicalApprovalVerified",
    "autonomousActionPreventionEnabled",
    "unsafeRecommendationBlockingEnabled",
    "traceabilityEnabled",
    "emergencyStopAvailable"
  ]) {
    assertBooleanTrue(workflow[fieldName], `workflowControls.${fieldName}`);
  }

  if (recordGroup === recordGroups.foundation) {
    assertBooleanTrue(workflow.capabilityOwnerAssigned, "workflowControls.capabilityOwnerAssigned");
    if (recordType === "intelligence_risk_classification") assertBooleanTrue(workflow.riskClassificationReviewed, "workflowControls.riskClassificationReviewed");
    if (recordType === "intelligence_runtime_governance") assertBooleanTrue(workflow.runtimeGovernanceApproved, "workflowControls.runtimeGovernanceApproved");
    if (recordType === "intelligence_approval_workflow") assertBooleanTrue(workflow.approvalWorkflowConfigured, "workflowControls.approvalWorkflowConfigured");
  }

  if (recordGroup === recordGroups.clinicalGovernance) {
    assertBooleanTrue(workflow.clinicalReviewRuleApproved, "workflowControls.clinicalReviewRuleApproved");
    assertBooleanTrue(workflow.humanApprovalRuleEnforced, "workflowControls.humanApprovalRuleEnforced");
    assertBooleanTrue(workflow.recommendationLifecycleTracked, "workflowControls.recommendationLifecycleTracked");
    if (recordType === "safety_escalation_rules") assertBooleanTrue(workflow.safetyEscalationConfigured, "workflowControls.safetyEscalationConfigured");
    if (recordType === "clinical_override_workflow") assertBooleanTrue(workflow.overrideRequiresReason, "workflowControls.overrideRequiresReason");
    if (recordType === "recommendation_governance") {
      assertBooleanTrue(workflow.governanceWorkflowStarted, "workflowControls.governanceWorkflowStarted");
      if (status === "completed") {
        assertBooleanTrue(workflow.governanceCompletionApproved, "workflowControls.governanceCompletionApproved");
        assertNonEmptyString(workflow.governanceApprovalReference, "workflowControls.governanceApprovalReference", 180);
      }
    }
  }

  if (recordGroup === recordGroups.orchestration) {
    assertBooleanTrue(workflow.platformBoundaryVerified, "workflowControls.platformBoundaryVerified");
    assertBooleanTrue(workflow.contextBrokerPolicyChecked, "workflowControls.contextBrokerPolicyChecked");
    assertBooleanTrue(workflow.eventRouterAuditable, "workflowControls.eventRouterAuditable");
    assertBooleanTrue(workflow.decisionRegistryControlled, "workflowControls.decisionRegistryControlled");
    assertBooleanTrue(workflow.workflowControllerApproved, "workflowControls.workflowControllerApproved");
  }

  if (recordGroup === recordGroups.safetyControl) {
    assertBooleanTrue(workflow.preventionActive, "workflowControls.preventionActive");
    assertBooleanTrue(workflow.unsafeRecommendationBlockingActive, "workflowControls.unsafeRecommendationBlockingActive");
    assertBooleanTrue(workflow.humanInLoopEnforced, "workflowControls.humanInLoopEnforced");
    assertBooleanTrue(workflow.safetyGuardrailsActive, "workflowControls.safetyGuardrailsActive");
    assertBooleanTrue(workflow.policyViolationDetectionActive, "workflowControls.policyViolationDetectionActive");
    if (recordType === "emergency_stop_controls") assertBooleanTrue(workflow.emergencyStopTested, "workflowControls.emergencyStopTested");
  }

  if (recordGroup === recordGroups.traceability) {
    assertBooleanTrue(workflow.traceCreated, "workflowControls.traceCreated");
    assertBooleanTrue(workflow.evidenceLinked, "workflowControls.evidenceLinked");
    assertBooleanTrue(workflow.policyTraceLinked, "workflowControls.policyTraceLinked");
    assertBooleanTrue(workflow.approvalTraceLinked, "workflowControls.approvalTraceLinked");
    if (recordType === "governance_audit_package") assertBooleanTrue(workflow.governanceAuditPackageReviewed, "workflowControls.governanceAuditPackageReviewed");
  }

  return workflow;
}

export function validateCreateIntelligenceRecordInput(input) {
  const candidate = validatePlainObject(input, "input");
  validateNoProhibitedAutonomy(candidate);
  const recordGroup = assertNonEmptyString(candidate.recordGroup, "recordGroup", 120);
  const recordType = assertNonEmptyString(candidate.recordType, "recordType", 160);
  if (!isKnownRecordType(recordGroup, recordType)) {
    throw new IntelligenceValidationError("recordType is not supported for recordGroup", { recordGroup, recordType });
  }
  const status = validateEnum(candidate.status, intelligenceStatuses, "status");
  return {
    tenantId: assertNonEmptyString(candidate.tenantId, "tenantId", 128),
    recordGroup,
    recordType,
    status,
    title: assertNonEmptyString(candidate.title, "title", 240),
    description: optionalString(candidate.description, "description", 2000),
    countryCode: validateCountryCode(candidate.countryCode),
    regionCode: optionalString(candidate.regionCode, "regionCode", 80),
    jurisdictionCode: assertNonEmptyString(candidate.jurisdictionCode, "jurisdictionCode", 120),
    organizationId: optionalString(candidate.organizationId, "organizationId", 160),
    intelligenceId: optionalString(candidate.intelligenceId, "intelligenceId", 160),
    capabilityId: optionalString(candidate.capabilityId, "capabilityId", 160),
    policyId: optionalString(candidate.policyId, "policyId", 160),
    runtimeGovernanceId: optionalString(candidate.runtimeGovernanceId, "runtimeGovernanceId", 160),
    safetyLayerId: optionalString(candidate.safetyLayerId, "safetyLayerId", 160),
    approvalWorkflowId: optionalString(candidate.approvalWorkflowId, "approvalWorkflowId", 160),
    recommendationId: optionalString(candidate.recommendationId, "recommendationId", 160),
    reviewRuleId: optionalString(candidate.reviewRuleId, "reviewRuleId", 160),
    escalationRuleId: optionalString(candidate.escalationRuleId, "escalationRuleId", 160),
    overrideId: optionalString(candidate.overrideId, "overrideId", 160),
    orchestratorId: optionalString(candidate.orchestratorId, "orchestratorId", 160),
    contextBrokerId: optionalString(candidate.contextBrokerId, "contextBrokerId", 160),
    eventRouterId: optionalString(candidate.eventRouterId, "eventRouterId", 160),
    decisionRegistryId: optionalString(candidate.decisionRegistryId, "decisionRegistryId", 160),
    workflowControllerId: optionalString(candidate.workflowControllerId, "workflowControllerId", 160),
    traceId: optionalString(candidate.traceId, "traceId", 160),
    evidenceTraceId: optionalString(candidate.evidenceTraceId, "evidenceTraceId", 160),
    approvalTraceId: optionalString(candidate.approvalTraceId, "approvalTraceId", 160),
    auditPackageId: optionalString(candidate.auditPackageId, "auditPackageId", 160),
    emergencyStopId: optionalString(candidate.emergencyStopId, "emergencyStopId", 160),
    ownerId: optionalString(candidate.ownerId, "ownerId", 160),
    approverId: optionalString(candidate.approverId, "approverId", 160),
    priority: candidate.priority ? validateEnum(candidate.priority, priorities, "priority") : null,
    riskLevel: candidate.riskLevel ? validateEnum(candidate.riskLevel, riskLevels, "riskLevel") : null,
    riskScore: validateNumber(candidate.riskScore, "riskScore"),
    safetyScore: validateNumber(candidate.safetyScore, "safetyScore"),
    governanceScore: validateNumber(candidate.governanceScore, "governanceScore"),
    traceabilityScore: validateNumber(candidate.traceabilityScore, "traceabilityScore"),
    startedAt: validateDate(candidate.startedAt, "startedAt"),
    completedAt: validateDate(candidate.completedAt, "completedAt"),
    approvedAt: validateDate(candidate.approvedAt, "approvedAt"),
    blockedAt: validateDate(candidate.blockedAt, "blockedAt"),
    stoppedAt: validateDate(candidate.stoppedAt, "stoppedAt"),
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
    intelligenceResourceType: assertNonEmptyString(candidate.intelligenceResourceType, "intelligenceResourceType", 160),
    intelligenceResourceId: assertNonEmptyString(candidate.intelligenceResourceId, "intelligenceResourceId", 180),
    countryCode: validateCountryCode(candidate.countryCode),
    metadata: optionalObject(candidate.metadata, "metadata")
  };
}
