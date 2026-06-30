import {
  aiAssuranceStatuses,
  integrationSources,
  isKnownGroup,
  isKnownRecordType,
  permissionAllows,
  permissionsByGroup,
  prohibitedClinicalAutomationPhrases,
  recordGroups
} from "./ai-assurance-domain.mjs";

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const countryCodePattern = /^[A-Z]{2}$/;
const priorities = Object.freeze(["low", "medium", "high", "critical"]);
const severities = Object.freeze(["low", "medium", "high", "critical"]);
const riskLevels = Object.freeze(["minimal", "low", "moderate", "high", "critical"]);

export class AiAssuranceValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "AiAssuranceValidationError";
    this.details = details;
  }
}

export class AiAssuranceAuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "AiAssuranceAuthorizationError";
    this.details = details;
  }
}

export function assertNonEmptyString(value, fieldName, maxLength = 512) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new AiAssuranceValidationError(`${fieldName} is required`, { fieldName });
  }
  if (value.length > maxLength) {
    throw new AiAssuranceValidationError(`${fieldName} exceeds ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new AiAssuranceValidationError(`${fieldName} must be true`, { fieldName });
  }
}

function optionalString(value, fieldName, maxLength = 512) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return assertNonEmptyString(value, fieldName, maxLength);
}

function validatePlainObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AiAssuranceValidationError(`${fieldName} must be an object`, { fieldName });
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
    throw new AiAssuranceValidationError(`${fieldName} must be an array`, { fieldName });
  }
  return value;
}

function validateDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 64);
  if (!isoDatePattern.test(raw) && !isoDateTimePattern.test(raw)) {
    throw new AiAssuranceValidationError(`${fieldName} must be an ISO date or ISO date-time`, { fieldName });
  }
  return raw;
}

function validateCountryCode(value, fieldName = "countryCode") {
  const raw = assertNonEmptyString(value, fieldName, 2).toUpperCase();
  if (!countryCodePattern.test(raw)) {
    throw new AiAssuranceValidationError(`${fieldName} must be an ISO 3166-1 alpha-2 country code`, { fieldName });
  }
  return raw;
}

function validateNumber(value, fieldName, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, nullable = true } = {}) {
  if ((value === undefined || value === null || value === "") && nullable) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new AiAssuranceValidationError(`${fieldName} must be a number between ${min} and ${max}`, { fieldName });
  }
  return value;
}

function validateEnum(value, allowed, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 80);
  if (!allowed.includes(raw)) {
    throw new AiAssuranceValidationError(`${fieldName} is not supported`, { [fieldName]: raw });
  }
  return raw;
}

function collectStrings(value, output = []) {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStrings(item, output);
    }
    return output;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectStrings(item, output);
    }
  }
  return output;
}

function validateNoProhibitedClinicalAutomation(input) {
  const joined = collectStrings(input).join(" ").toLowerCase();
  for (const phrase of prohibitedClinicalAutomationPhrases) {
    if (joined.includes(phrase)) {
      throw new AiAssuranceValidationError("AI assurance input contains prohibited clinical automation language", { phrase });
    }
  }
}

export function validatePrincipal(principal) {
  const actor = validatePlainObject(principal, "principal");
  const permissions = optionalArray(actor.permissions, "principal.permissions").map((permission, index) =>
    assertNonEmptyString(permission, `principal.permissions[${index}]`, 180)
  );
  if (permissions.length === 0) {
    throw new AiAssuranceAuthorizationError("principal.permissions must include at least one permission");
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
    throw new AiAssuranceAuthorizationError("principal is not authorized for this AI assurance action", {
      requiredPermission,
      recordGroup
    });
  }
  return normalized;
}

function validatePolicyControls(value) {
  const policy = validatePlainObject(value, "policyControls");
  assertBooleanTrue(policy.policyApproved, "policyControls.policyApproved");
  assertBooleanTrue(policy.humanApprovalRequired, "policyControls.humanApprovalRequired");
  assertBooleanTrue(policy.auditPolicyApplied, "policyControls.auditPolicyApplied");
  assertBooleanTrue(policy.aiGovernanceApplied, "policyControls.aiGovernanceApplied");
  assertBooleanTrue(policy.modelApprovalApplied, "policyControls.modelApprovalApplied");
  assertBooleanTrue(policy.promptApprovalApplied, "policyControls.promptApprovalApplied");
  assertBooleanTrue(policy.agentApprovalApplied, "policyControls.agentApprovalApplied");
  assertBooleanTrue(policy.regulatoryAccessApplied, "policyControls.regulatoryAccessApplied");
  assertBooleanTrue(policy.productionPromotionBlockedWithoutApproval, "policyControls.productionPromotionBlockedWithoutApproval");
  return {
    policyId: assertNonEmptyString(policy.policyId, "policyControls.policyId", 160),
    policyVersion: assertNonEmptyString(policy.policyVersion, "policyControls.policyVersion", 80),
    policyApproved: true,
    humanApprovalRequired: true,
    auditPolicyApplied: true,
    aiGovernanceApplied: true,
    modelApprovalApplied: true,
    promptApprovalApplied: true,
    agentApprovalApplied: true,
    regulatoryAccessApplied: true,
    productionPromotionBlockedWithoutApproval: true,
    approvalReference: assertNonEmptyString(policy.approvalReference, "policyControls.approvalReference", 180),
    governingBody: assertNonEmptyString(policy.governingBody, "policyControls.governingBody", 180),
    effectiveDate: validateDate(policy.effectiveDate, "policyControls.effectiveDate"),
    expiresAt: validateDate(policy.expiresAt, "policyControls.expiresAt")
  };
}

function validateGovernanceContext(value) {
  const context = validatePlainObject(value, "governanceContext");
  assertBooleanTrue(context.humanGovernanceRequired, "governanceContext.humanGovernanceRequired");
  assertBooleanTrue(context.policyControlled, "governanceContext.policyControlled");
  assertBooleanTrue(context.auditRequired, "governanceContext.auditRequired");
  assertBooleanTrue(context.tenantIsolationRequired, "governanceContext.tenantIsolationRequired");
  assertBooleanTrue(context.noClinicalDecisioning, "governanceContext.noClinicalDecisioning");
  assertBooleanTrue(context.aiGovernanceControlled, "governanceContext.aiGovernanceControlled");
  assertBooleanTrue(context.modelApprovalControlled, "governanceContext.modelApprovalControlled");
  assertBooleanTrue(context.promptApprovalControlled, "governanceContext.promptApprovalControlled");
  assertBooleanTrue(context.agentApprovalControlled, "governanceContext.agentApprovalControlled");
  assertBooleanTrue(context.regulatoryAccessControlled, "governanceContext.regulatoryAccessControlled");
  assertBooleanTrue(context.productionPromotionRequiresApproval, "governanceContext.productionPromotionRequiresApproval");
  assertBooleanTrue(context.multiCountryGovernanceChecked, "governanceContext.multiCountryGovernanceChecked");
  return {
    humanGovernanceRequired: true,
    policyControlled: true,
    auditRequired: true,
    tenantIsolationRequired: true,
    noClinicalDecisioning: true,
    aiGovernanceControlled: true,
    modelApprovalControlled: true,
    promptApprovalControlled: true,
    agentApprovalControlled: true,
    regulatoryAccessControlled: true,
    productionPromotionRequiresApproval: true,
    multiCountryGovernanceChecked: true,
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
    throw new AiAssuranceValidationError("evidence must include at least one item");
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
  assertBooleanTrue(workflow.auditEnabled, "workflowControls.auditEnabled");
  assertBooleanTrue(workflow.tenantIsolationVerified, "workflowControls.tenantIsolationVerified");
  assertBooleanTrue(workflow.humanReviewRequired, "workflowControls.humanReviewRequired");
  assertBooleanTrue(workflow.policyChecked, "workflowControls.policyChecked");
  assertBooleanTrue(workflow.aiGovernanceVerified, "workflowControls.aiGovernanceVerified");
  assertBooleanTrue(workflow.modelApprovalVerified, "workflowControls.modelApprovalVerified");
  assertBooleanTrue(workflow.promptApprovalVerified, "workflowControls.promptApprovalVerified");
  assertBooleanTrue(workflow.agentApprovalVerified, "workflowControls.agentApprovalVerified");
  assertBooleanTrue(workflow.regulatoryAccessVerified, "workflowControls.regulatoryAccessVerified");
  assertBooleanTrue(workflow.productionPromotionApprovalRequired, "workflowControls.productionPromotionApprovalRequired");

  if (recordGroup === recordGroups.aiAssurance) {
    assertBooleanTrue(workflow.assuranceOwnerAssigned, "workflowControls.assuranceOwnerAssigned");
    assertBooleanTrue(workflow.aiSystemInventoryVerified, "workflowControls.aiSystemInventoryVerified");
    if (recordType === "ai_risk_classification") {
      assertBooleanTrue(workflow.riskClassificationReviewed, "workflowControls.riskClassificationReviewed");
    }
    if (recordType === "ai_safety_assessment") {
      assertBooleanTrue(workflow.safetyAssessmentCompleted, "workflowControls.safetyAssessmentCompleted");
    }
    if (recordType === "ai_assurance_workflow" && status === "approved") {
      assertBooleanTrue(workflow.assuranceReviewApproved, "workflowControls.assuranceReviewApproved");
      assertNonEmptyString(workflow.assuranceReviewReference, "workflowControls.assuranceReviewReference", 180);
    }
  }

  if (recordGroup === recordGroups.modelRiskManagement) {
    assertBooleanTrue(workflow.modelOwnerAssigned, "workflowControls.modelOwnerAssigned");
    assertBooleanTrue(workflow.modelRiskReviewed, "workflowControls.modelRiskReviewed");
    if (recordType === "model_validation_workflow") {
      assertBooleanTrue(workflow.validationProtocolApproved, "workflowControls.validationProtocolApproved");
      if (status === "completed" || status === "validated") {
        assertBooleanTrue(workflow.validationCompleted, "workflowControls.validationCompleted");
        assertNonEmptyString(workflow.validationReference, "workflowControls.validationReference", 180);
      }
    }
    if (recordType === "model_approval_workflow" && (status === "approved" || status === "rejected")) {
      assertBooleanTrue(workflow.modelApprovalBoardReviewed, "workflowControls.modelApprovalBoardReviewed");
      assertNonEmptyString(workflow.modelApprovalReference, "workflowControls.modelApprovalReference", 180);
    }
    if (recordType === "model_retirement_workflow") {
      assertBooleanTrue(workflow.retirementApproved, "workflowControls.retirementApproved");
    }
  }

  if (recordGroup === recordGroups.aiSafetyTesting) {
    assertBooleanTrue(workflow.safetyTestOwnerAssigned, "workflowControls.safetyTestOwnerAssigned");
    assertBooleanTrue(workflow.testProtocolApproved, "workflowControls.testProtocolApproved");
    if (recordType === "clinical_safety_test_cases") {
      assertBooleanTrue(workflow.clinicalSafetyReviewed, "workflowControls.clinicalSafetyReviewed");
    }
    if (recordType === "safety_test_reports" || status === "completed" || status === "validated") {
      assertBooleanTrue(workflow.safetyTestCompleted, "workflowControls.safetyTestCompleted");
      assertNonEmptyString(workflow.safetyTestReference, "workflowControls.safetyTestReference", 180);
    }
  }

  if (recordGroup === recordGroups.promptAgentAssurance) {
    assertBooleanTrue(workflow.promptAgentOwnerAssigned, "workflowControls.promptAgentOwnerAssigned");
    assertBooleanTrue(workflow.promptRiskReviewed, "workflowControls.promptRiskReviewed");
    assertBooleanTrue(workflow.agentRiskReviewed, "workflowControls.agentRiskReviewed");
    if (recordType === "prompt_approval_workflow" && status === "approved") {
      assertBooleanTrue(workflow.promptApprovalCompleted, "workflowControls.promptApprovalCompleted");
      assertNonEmptyString(workflow.promptApprovalReference, "workflowControls.promptApprovalReference", 180);
    }
    if (recordType === "agent_runtime_approval" && status === "approved") {
      assertBooleanTrue(workflow.agentApprovalCompleted, "workflowControls.agentApprovalCompleted");
      assertNonEmptyString(workflow.agentApprovalReference, "workflowControls.agentApprovalReference", 180);
    }
    if (recordType === "agent_permission_review") {
      assertBooleanTrue(workflow.agentPermissionReviewCompleted, "workflowControls.agentPermissionReviewCompleted");
    }
  }

  if (recordGroup === recordGroups.aiMonitoring) {
    assertBooleanTrue(workflow.monitoringOwnerAssigned, "workflowControls.monitoringOwnerAssigned");
    assertBooleanTrue(workflow.monitoringThresholdsApproved, "workflowControls.monitoringThresholdsApproved");
    if (recordType === "unsafe_output_monitoring" || recordType === "hallucination_monitoring") {
      assertBooleanTrue(workflow.unsafeOutputReviewRequired, "workflowControls.unsafeOutputReviewRequired");
    }
    if (recordType === "drift_monitoring" || recordType === "bias_monitoring") {
      assertBooleanTrue(workflow.driftBiasReviewRequired, "workflowControls.driftBiasReviewRequired");
    }
  }

  if (recordGroup === recordGroups.aiIncidentManagement) {
    assertBooleanTrue(workflow.incidentOwnerAssigned, "workflowControls.incidentOwnerAssigned");
    assertBooleanTrue(workflow.incidentSeverityReviewed, "workflowControls.incidentSeverityReviewed");
    if (recordType === "ai_incident_investigation") {
      assertBooleanTrue(workflow.investigationCompleted, "workflowControls.investigationCompleted");
    }
    if (recordType === "ai_incident_closure" || status === "closed") {
      assertBooleanTrue(workflow.incidentClosureApproved, "workflowControls.incidentClosureApproved");
      assertNonEmptyString(workflow.incidentClosureReference, "workflowControls.incidentClosureReference", 180);
    }
  }

  if (recordGroup === recordGroups.regulatoryAiGovernance) {
    assertBooleanTrue(workflow.aiRegulatoryMappingVerified, "workflowControls.aiRegulatoryMappingVerified");
    assertBooleanTrue(workflow.aiEvidenceRepositoryControlled, "workflowControls.aiEvidenceRepositoryControlled");
    if (recordType === "ai_audit_package_generation" || status === "generated") {
      assertBooleanTrue(workflow.auditPackageReviewed, "workflowControls.auditPackageReviewed");
      assertNonEmptyString(workflow.auditPackageReference, "workflowControls.auditPackageReference", 180);
    }
    if (recordType === "ai_governance_decisions") {
      assertBooleanTrue(workflow.governanceDecisionRecorded, "workflowControls.governanceDecisionRecorded");
    }
  }

  return workflow;
}

export function validateCreateAiAssuranceRecordInput(input) {
  const recordInput = validatePlainObject(input, "input");
  validateNoProhibitedClinicalAutomation(recordInput);

  const tenantId = assertNonEmptyString(recordInput.tenantId, "tenantId", 128);
  const recordGroup = assertNonEmptyString(recordInput.recordGroup, "recordGroup", 80);
  const recordType = assertNonEmptyString(recordInput.recordType, "recordType", 120);
  if (!isKnownGroup(recordGroup)) {
    throw new AiAssuranceValidationError("recordGroup is not supported", { recordGroup });
  }
  if (!isKnownRecordType(recordGroup, recordType)) {
    throw new AiAssuranceValidationError("recordType is not valid for recordGroup", { recordGroup, recordType });
  }
  const status = assertNonEmptyString(recordInput.status, "status", 80);
  if (!aiAssuranceStatuses.includes(status)) {
    throw new AiAssuranceValidationError("status is not supported", { status });
  }

  return {
    tenantId,
    recordGroup,
    recordType,
    status,
    title: assertNonEmptyString(recordInput.title, "title", 240),
    description: optionalString(recordInput.description, "description", 2000),
    countryCode: validateCountryCode(recordInput.countryCode),
    regionCode: optionalString(recordInput.regionCode, "regionCode", 120),
    jurisdictionCode: assertNonEmptyString(recordInput.jurisdictionCode, "jurisdictionCode", 160),
    organizationId: optionalString(recordInput.organizationId, "organizationId", 160),
    aiSystemId: optionalString(recordInput.aiSystemId, "aiSystemId", 160),
    aiUseCaseId: optionalString(recordInput.aiUseCaseId, "aiUseCaseId", 160),
    assuranceId: optionalString(recordInput.assuranceId, "assuranceId", 160),
    riskClassificationId: optionalString(recordInput.riskClassificationId, "riskClassificationId", 160),
    safetyAssessmentId: optionalString(recordInput.safetyAssessmentId, "safetyAssessmentId", 160),
    impactAssessmentId: optionalString(recordInput.impactAssessmentId, "impactAssessmentId", 160),
    modelId: optionalString(recordInput.modelId, "modelId", 160),
    modelVersionId: optionalString(recordInput.modelVersionId, "modelVersionId", 160),
    modelRiskId: optionalString(recordInput.modelRiskId, "modelRiskId", 160),
    validationId: optionalString(recordInput.validationId, "validationId", 160),
    limitationId: optionalString(recordInput.limitationId, "limitationId", 160),
    testId: optionalString(recordInput.testId, "testId", 160),
    testCaseId: optionalString(recordInput.testCaseId, "testCaseId", 160),
    testReportId: optionalString(recordInput.testReportId, "testReportId", 160),
    promptId: optionalString(recordInput.promptId, "promptId", 160),
    promptVersionId: optionalString(recordInput.promptVersionId, "promptVersionId", 160),
    agentId: optionalString(recordInput.agentId, "agentId", 160),
    agentVersionId: optionalString(recordInput.agentVersionId, "agentVersionId", 160),
    permissionReviewId: optionalString(recordInput.permissionReviewId, "permissionReviewId", 160),
    behaviorEvaluationId: optionalString(recordInput.behaviorEvaluationId, "behaviorEvaluationId", 160),
    runtimeApprovalId: optionalString(recordInput.runtimeApprovalId, "runtimeApprovalId", 160),
    monitoringId: optionalString(recordInput.monitoringId, "monitoringId", 160),
    recommendationMonitorId: optionalString(recordInput.recommendationMonitorId, "recommendationMonitorId", 160),
    driftMonitorId: optionalString(recordInput.driftMonitorId, "driftMonitorId", 160),
    biasMonitorId: optionalString(recordInput.biasMonitorId, "biasMonitorId", 160),
    hallucinationMonitorId: optionalString(recordInput.hallucinationMonitorId, "hallucinationMonitorId", 160),
    unsafeOutputMonitorId: optionalString(recordInput.unsafeOutputMonitorId, "unsafeOutputMonitorId", 160),
    performanceMonitorId: optionalString(recordInput.performanceMonitorId, "performanceMonitorId", 160),
    incidentId: optionalString(recordInput.incidentId, "incidentId", 160),
    investigationId: optionalString(recordInput.investigationId, "investigationId", 160),
    correctiveActionId: optionalString(recordInput.correctiveActionId, "correctiveActionId", 160),
    regulatoryRequirementId: optionalString(recordInput.regulatoryRequirementId, "regulatoryRequirementId", 160),
    complianceMappingId: optionalString(recordInput.complianceMappingId, "complianceMappingId", 160),
    evidenceRepositoryId: optionalString(recordInput.evidenceRepositoryId, "evidenceRepositoryId", 160),
    auditPackageId: optionalString(recordInput.auditPackageId, "auditPackageId", 160),
    governanceDecisionId: optionalString(recordInput.governanceDecisionId, "governanceDecisionId", 160),
    attestationId: optionalString(recordInput.attestationId, "attestationId", 160),
    ownerId: optionalString(recordInput.ownerId, "ownerId", 160),
    approvalId: optionalString(recordInput.approvalId, "approvalId", 160),
    priority: validateEnum(recordInput.priority, priorities, "priority"),
    severity: validateEnum(recordInput.severity, severities, "severity"),
    riskLevel: validateEnum(recordInput.riskLevel, riskLevels, "riskLevel"),
    riskScore: validateNumber(recordInput.riskScore, "riskScore", { min: 0, max: 100 }),
    safetyScore: validateNumber(recordInput.safetyScore, "safetyScore", { min: 0, max: 100 }),
    validationScore: validateNumber(recordInput.validationScore, "validationScore", { min: 0, max: 100 }),
    biasScore: validateNumber(recordInput.biasScore, "biasScore", { min: 0, max: 100 }),
    driftScore: validateNumber(recordInput.driftScore, "driftScore", { min: 0, max: 100 }),
    performanceScore: validateNumber(recordInput.performanceScore, "performanceScore", { min: 0, max: 100 }),
    readinessScore: validateNumber(recordInput.readinessScore, "readinessScore", { min: 0, max: 100 }),
    impactScore: validateNumber(recordInput.impactScore, "impactScore", { min: 0, max: 100 }),
    startedAt: validateDate(recordInput.startedAt, "startedAt"),
    completedAt: validateDate(recordInput.completedAt, "completedAt"),
    approvedAt: validateDate(recordInput.approvedAt, "approvedAt"),
    rejectedAt: validateDate(recordInput.rejectedAt, "rejectedAt"),
    retiredAt: validateDate(recordInput.retiredAt, "retiredAt"),
    detectedAt: validateDate(recordInput.detectedAt, "detectedAt"),
    closedAt: validateDate(recordInput.closedAt, "closedAt"),
    generatedAt: validateDate(recordInput.generatedAt, "generatedAt"),
    policyControls: validatePolicyControls(recordInput.policyControls),
    governanceContext: validateGovernanceContext(recordInput.governanceContext),
    workflowControls: validateWorkflowControls(recordInput.workflowControls, recordGroup, recordType, status),
    evidence: validateEvidence(recordInput.evidence),
    metrics: optionalObject(recordInput.metrics, "metrics"),
    metadata: optionalObject(recordInput.metadata, "metadata")
  };
}

export function validateIntegrationReferenceInput(input) {
  const value = validatePlainObject(input, "input");
  validateNoProhibitedClinicalAutomation(value);
  const sourceSystem = assertNonEmptyString(value.sourceSystem, "sourceSystem", 120);
  if (!integrationSources.includes(sourceSystem)) {
    throw new AiAssuranceValidationError("sourceSystem is not supported", { sourceSystem });
  }
  return {
    tenantId: assertNonEmptyString(value.tenantId, "tenantId", 128),
    sourceSystem,
    sourceResourceType: assertNonEmptyString(value.sourceResourceType, "sourceResourceType", 160),
    sourceResourceId: assertNonEmptyString(value.sourceResourceId, "sourceResourceId", 180),
    aiAssuranceResourceType: assertNonEmptyString(value.aiAssuranceResourceType, "aiAssuranceResourceType", 160),
    aiAssuranceResourceId: assertNonEmptyString(value.aiAssuranceResourceId, "aiAssuranceResourceId", 180),
    countryCode: validateCountryCode(value.countryCode),
    metadata: optionalObject(value.metadata, "metadata")
  };
}
