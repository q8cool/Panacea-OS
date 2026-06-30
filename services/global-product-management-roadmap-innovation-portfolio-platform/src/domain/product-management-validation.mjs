import {
  integrationSources,
  isKnownGroup,
  isKnownRecordType,
  permissionAllows,
  permissionsByGroup,
  productManagementStatuses,
  prohibitedClinicalAutomationPhrases,
  recordGroups
} from "./product-management-domain.mjs";

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const countryCodePattern = /^[A-Z]{2}$/;
const priorities = Object.freeze(["low", "medium", "high", "critical"]);

export class ProductManagementValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ProductManagementValidationError";
    this.details = details;
  }
}

export class ProductManagementAuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ProductManagementAuthorizationError";
    this.details = details;
  }
}

export function assertNonEmptyString(value, fieldName, maxLength = 512) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ProductManagementValidationError(`${fieldName} is required`, { fieldName });
  }
  if (value.length > maxLength) {
    throw new ProductManagementValidationError(`${fieldName} exceeds ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new ProductManagementValidationError(`${fieldName} must be true`, { fieldName });
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
    throw new ProductManagementValidationError(`${fieldName} must be an object`, { fieldName });
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
    throw new ProductManagementValidationError(`${fieldName} must be an array`, { fieldName });
  }
  return value;
}

function validateDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 64);
  if (!isoDatePattern.test(raw) && !isoDateTimePattern.test(raw)) {
    throw new ProductManagementValidationError(`${fieldName} must be an ISO date or ISO date-time`, { fieldName });
  }
  return raw;
}

function validateCountryCode(value, fieldName = "countryCode") {
  const raw = assertNonEmptyString(value, fieldName, 2).toUpperCase();
  if (!countryCodePattern.test(raw)) {
    throw new ProductManagementValidationError(`${fieldName} must be an ISO 3166-1 alpha-2 country code`, { fieldName });
  }
  return raw;
}

function validateNumber(value, fieldName, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, nullable = true } = {}) {
  if ((value === undefined || value === null || value === "") && nullable) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new ProductManagementValidationError(`${fieldName} must be a number between ${min} and ${max}`, { fieldName });
  }
  return value;
}

function validateEnum(value, allowed, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 80);
  if (!allowed.includes(raw)) {
    throw new ProductManagementValidationError(`${fieldName} is not supported`, { [fieldName]: raw });
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
      throw new ProductManagementValidationError("Product management input contains prohibited clinical automation language", { phrase });
    }
  }
}

export function validatePrincipal(principal) {
  const actor = validatePlainObject(principal, "principal");
  const permissions = optionalArray(actor.permissions, "principal.permissions").map((permission, index) =>
    assertNonEmptyString(permission, `principal.permissions[${index}]`, 180)
  );
  if (permissions.length === 0) {
    throw new ProductManagementAuthorizationError("principal.permissions must include at least one permission");
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
    throw new ProductManagementAuthorizationError("principal is not authorized for this product management action", {
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
  assertBooleanTrue(policy.productGovernanceApplied, "policyControls.productGovernanceApplied");
  assertBooleanTrue(policy.roadmapApprovalApplied, "policyControls.roadmapApprovalApplied");
  assertBooleanTrue(policy.innovationReviewApplied, "policyControls.innovationReviewApplied");
  assertBooleanTrue(policy.releaseGovernanceApplied, "policyControls.releaseGovernanceApplied");
  return {
    policyId: assertNonEmptyString(policy.policyId, "policyControls.policyId", 160),
    policyVersion: assertNonEmptyString(policy.policyVersion, "policyControls.policyVersion", 80),
    policyApproved: true,
    humanApprovalRequired: true,
    auditPolicyApplied: true,
    productGovernanceApplied: true,
    roadmapApprovalApplied: true,
    innovationReviewApplied: true,
    releaseGovernanceApplied: true,
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
  assertBooleanTrue(context.productGovernanceControlled, "governanceContext.productGovernanceControlled");
  assertBooleanTrue(context.roadmapApprovalControlled, "governanceContext.roadmapApprovalControlled");
  assertBooleanTrue(context.innovationReviewControlled, "governanceContext.innovationReviewControlled");
  assertBooleanTrue(context.releaseGovernanceControlled, "governanceContext.releaseGovernanceControlled");
  assertBooleanTrue(context.multiCountryGovernanceChecked, "governanceContext.multiCountryGovernanceChecked");
  return {
    humanGovernanceRequired: true,
    policyControlled: true,
    auditRequired: true,
    tenantIsolationRequired: true,
    noClinicalDecisioning: true,
    productGovernanceControlled: true,
    roadmapApprovalControlled: true,
    innovationReviewControlled: true,
    releaseGovernanceControlled: true,
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
    throw new ProductManagementValidationError("evidence must include at least one item");
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
  assertBooleanTrue(workflow.productGovernanceVerified, "workflowControls.productGovernanceVerified");
  assertBooleanTrue(workflow.roadmapApprovalVerified, "workflowControls.roadmapApprovalVerified");
  assertBooleanTrue(workflow.innovationReviewVerified, "workflowControls.innovationReviewVerified");

  if (recordGroup === recordGroups.productManagement) {
    assertBooleanTrue(workflow.productOwnerAssigned, "workflowControls.productOwnerAssigned");
    assertBooleanTrue(workflow.featureOwnershipVerified, "workflowControls.featureOwnershipVerified");
    if ((recordType === "feature_lifecycle" || recordType === "feature_status_tracking") && status === "approved") {
      assertBooleanTrue(workflow.featureApprovalCompleted, "workflowControls.featureApprovalCompleted");
      assertNonEmptyString(workflow.featureApprovalReference, "workflowControls.featureApprovalReference", 180);
    }
  }

  if (recordGroup === recordGroups.roadmapManagement) {
    assertBooleanTrue(workflow.roadmapOwnerAssigned, "workflowControls.roadmapOwnerAssigned");
    assertBooleanTrue(workflow.dependencyReviewCompleted, "workflowControls.dependencyReviewCompleted");
    if (recordType === "roadmap_approval_workflow" || status === "approved") {
      assertBooleanTrue(workflow.roadmapApprovalCompleted, "workflowControls.roadmapApprovalCompleted");
      assertNonEmptyString(workflow.roadmapApprovalReference, "workflowControls.roadmapApprovalReference", 180);
    }
    if (recordType === "milestone_planning" && status === "completed") {
      assertBooleanTrue(workflow.milestoneCompletionVerified, "workflowControls.milestoneCompletionVerified");
    }
  }

  if (recordGroup === recordGroups.innovationPortfolio) {
    assertBooleanTrue(workflow.innovationReviewCompleted, "workflowControls.innovationReviewCompleted");
    assertBooleanTrue(workflow.innovationScoringCompleted, "workflowControls.innovationScoringCompleted");
    if (recordType === "innovation_approval_workflow" || status === "approved") {
      assertBooleanTrue(workflow.innovationApprovalCompleted, "workflowControls.innovationApprovalCompleted");
      assertNonEmptyString(workflow.innovationApprovalReference, "workflowControls.innovationApprovalReference", 180);
    }
    if (recordType === "innovation_experiment_registry") {
      assertBooleanTrue(workflow.experimentGovernanceApproved, "workflowControls.experimentGovernanceApproved");
    }
  }

  if (recordGroup === recordGroups.requirementsManagement) {
    assertBooleanTrue(workflow.requirementOwnerAssigned, "workflowControls.requirementOwnerAssigned");
    assertBooleanTrue(workflow.traceabilityVerified, "workflowControls.traceabilityVerified");
    if (recordType === "requirement_approval" || status === "approved") {
      assertBooleanTrue(workflow.requirementApprovalCompleted, "workflowControls.requirementApprovalCompleted");
    }
    if (recordType === "requirement_change_control") {
      assertBooleanTrue(workflow.changeControlApproved, "workflowControls.changeControlApproved");
    }
  }

  if (recordGroup === recordGroups.productFeedback) {
    assertBooleanTrue(workflow.feedbackConsentOrSourceVerified, "workflowControls.feedbackConsentOrSourceVerified");
    assertBooleanTrue(workflow.feedbackTriageCompleted, "workflowControls.feedbackTriageCompleted");
    if (recordType === "feedback_to_roadmap_linking") {
      assertBooleanTrue(workflow.roadmapLinkageVerified, "workflowControls.roadmapLinkageVerified");
    }
  }

  if (recordGroup === recordGroups.releaseGovernance) {
    assertBooleanTrue(workflow.releaseGovernanceVerified, "workflowControls.releaseGovernanceVerified");
    assertBooleanTrue(workflow.releaseRiskAssessed, "workflowControls.releaseRiskAssessed");
    if (recordType === "release_approval_workflow" || status === "approved") {
      assertBooleanTrue(workflow.releaseApprovalCompleted, "workflowControls.releaseApprovalCompleted");
      assertNonEmptyString(workflow.releaseApprovalReference, "workflowControls.releaseApprovalReference", 180);
    }
    if (recordType === "release_readiness_checklist") {
      assertBooleanTrue(workflow.readinessChecklistVerified, "workflowControls.readinessChecklistVerified");
    }
  }

  return workflow;
}

export function validateCreateProductManagementRecordInput(input) {
  const recordInput = validatePlainObject(input, "input");
  validateNoProhibitedClinicalAutomation(recordInput);

  const tenantId = assertNonEmptyString(recordInput.tenantId, "tenantId", 128);
  const recordGroup = assertNonEmptyString(recordInput.recordGroup, "recordGroup", 80);
  const recordType = assertNonEmptyString(recordInput.recordType, "recordType", 120);
  if (!isKnownGroup(recordGroup)) {
    throw new ProductManagementValidationError("recordGroup is not supported", { recordGroup });
  }
  if (!isKnownRecordType(recordGroup, recordType)) {
    throw new ProductManagementValidationError("recordType is not valid for recordGroup", { recordGroup, recordType });
  }
  const status = assertNonEmptyString(recordInput.status, "status", 80);
  if (!productManagementStatuses.includes(status)) {
    throw new ProductManagementValidationError("status is not supported", { status });
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
    productId: optionalString(recordInput.productId, "productId", 160),
    moduleId: optionalString(recordInput.moduleId, "moduleId", 160),
    capabilityId: optionalString(recordInput.capabilityId, "capabilityId", 160),
    featureId: optionalString(recordInput.featureId, "featureId", 160),
    dependencyId: optionalString(recordInput.dependencyId, "dependencyId", 160),
    roadmapId: optionalString(recordInput.roadmapId, "roadmapId", 160),
    versionId: optionalString(recordInput.versionId, "versionId", 160),
    releaseId: optionalString(recordInput.releaseId, "releaseId", 160),
    milestoneId: optionalString(recordInput.milestoneId, "milestoneId", 160),
    sprintId: optionalString(recordInput.sprintId, "sprintId", 160),
    innovationIdeaId: optionalString(recordInput.innovationIdeaId, "innovationIdeaId", 160),
    experimentId: optionalString(recordInput.experimentId, "experimentId", 160),
    requirementId: optionalString(recordInput.requirementId, "requirementId", 160),
    traceabilityId: optionalString(recordInput.traceabilityId, "traceabilityId", 160),
    feedbackId: optionalString(recordInput.feedbackId, "feedbackId", 160),
    customerId: optionalString(recordInput.customerId, "customerId", 160),
    clinicianId: optionalString(recordInput.clinicianId, "clinicianId", 160),
    patientId: optionalString(recordInput.patientId, "patientId", 160),
    releaseCandidateId: optionalString(recordInput.releaseCandidateId, "releaseCandidateId", 160),
    ownerId: optionalString(recordInput.ownerId, "ownerId", 160),
    approvalId: optionalString(recordInput.approvalId, "approvalId", 160),
    priority: validateEnum(recordInput.priority, priorities, "priority"),
    impactScore: validateNumber(recordInput.impactScore, "impactScore", { min: 0, max: 100 }),
    effortScore: validateNumber(recordInput.effortScore, "effortScore", { min: 0, max: 100 }),
    valueScore: validateNumber(recordInput.valueScore, "valueScore", { min: 0, max: 100 }),
    riskScore: validateNumber(recordInput.riskScore, "riskScore", { min: 0, max: 100 }),
    coveragePercent: validateNumber(recordInput.coveragePercent, "coveragePercent", { min: 0, max: 100 }),
    plannedStartAt: validateDate(recordInput.plannedStartAt, "plannedStartAt"),
    plannedEndAt: validateDate(recordInput.plannedEndAt, "plannedEndAt"),
    approvedAt: validateDate(recordInput.approvedAt, "approvedAt"),
    completedAt: validateDate(recordInput.completedAt, "completedAt"),
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
    throw new ProductManagementValidationError("sourceSystem is not supported", { sourceSystem });
  }
  return {
    tenantId: assertNonEmptyString(value.tenantId, "tenantId", 128),
    sourceSystem,
    sourceResourceType: assertNonEmptyString(value.sourceResourceType, "sourceResourceType", 160),
    sourceResourceId: assertNonEmptyString(value.sourceResourceId, "sourceResourceId", 180),
    productManagementResourceType: assertNonEmptyString(value.productManagementResourceType, "productManagementResourceType", 160),
    productManagementResourceId: assertNonEmptyString(value.productManagementResourceId, "productManagementResourceId", 180),
    countryCode: validateCountryCode(value.countryCode),
    metadata: optionalObject(value.metadata, "metadata")
  };
}
