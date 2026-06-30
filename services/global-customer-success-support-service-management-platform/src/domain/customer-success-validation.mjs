import {
  customerSuccessStatuses,
  integrationSources,
  isKnownGroup,
  isKnownRecordType,
  permissionAllows,
  permissionsByGroup,
  prohibitedClinicalAutomationPhrases,
  recordGroups
} from "./customer-success-domain.mjs";

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const countryCodePattern = /^[A-Z]{2}$/;
const priorities = Object.freeze(["low", "medium", "high", "urgent", "critical"]);
const severities = Object.freeze(["low", "medium", "high", "critical"]);

export class CustomerSuccessValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CustomerSuccessValidationError";
    this.details = details;
  }
}

export class CustomerSuccessAuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CustomerSuccessAuthorizationError";
    this.details = details;
  }
}

export function assertNonEmptyString(value, fieldName, maxLength = 512) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new CustomerSuccessValidationError(`${fieldName} is required`, { fieldName });
  }
  if (value.length > maxLength) {
    throw new CustomerSuccessValidationError(`${fieldName} exceeds ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new CustomerSuccessValidationError(`${fieldName} must be true`, { fieldName });
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
    throw new CustomerSuccessValidationError(`${fieldName} must be an object`, { fieldName });
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
    throw new CustomerSuccessValidationError(`${fieldName} must be an array`, { fieldName });
  }
  return value;
}

function validateDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 64);
  if (!isoDatePattern.test(raw) && !isoDateTimePattern.test(raw)) {
    throw new CustomerSuccessValidationError(`${fieldName} must be an ISO date or ISO date-time`, { fieldName });
  }
  return raw;
}

function validateCountryCode(value, fieldName = "countryCode") {
  const raw = assertNonEmptyString(value, fieldName, 2).toUpperCase();
  if (!countryCodePattern.test(raw)) {
    throw new CustomerSuccessValidationError(`${fieldName} must be an ISO 3166-1 alpha-2 country code`, { fieldName });
  }
  return raw;
}

function validateNumber(value, fieldName, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, nullable = true } = {}) {
  if ((value === undefined || value === null || value === "") && nullable) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new CustomerSuccessValidationError(`${fieldName} must be a number between ${min} and ${max}`, { fieldName });
  }
  return value;
}

function validateEnum(value, allowed, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 40);
  if (!allowed.includes(raw)) {
    throw new CustomerSuccessValidationError(`${fieldName} is not supported`, { [fieldName]: raw });
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
      throw new CustomerSuccessValidationError("Customer success input contains prohibited clinical automation language", { phrase });
    }
  }
}

export function validatePrincipal(principal) {
  const actor = validatePlainObject(principal, "principal");
  const permissions = optionalArray(actor.permissions, "principal.permissions").map((permission, index) =>
    assertNonEmptyString(permission, `principal.permissions[${index}]`, 180)
  );
  if (permissions.length === 0) {
    throw new CustomerSuccessAuthorizationError("principal.permissions must include at least one permission");
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
    throw new CustomerSuccessAuthorizationError("principal is not authorized for this customer success action", {
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
  assertBooleanTrue(policy.customerDataAccessApplied, "policyControls.customerDataAccessApplied");
  assertBooleanTrue(policy.supportRolePermissionApplied, "policyControls.supportRolePermissionApplied");
  assertBooleanTrue(policy.sensitiveIncidentControlApplied, "policyControls.sensitiveIncidentControlApplied");
  assertBooleanTrue(policy.serviceManagementPolicyApplied, "policyControls.serviceManagementPolicyApplied");
  return {
    policyId: assertNonEmptyString(policy.policyId, "policyControls.policyId", 160),
    policyVersion: assertNonEmptyString(policy.policyVersion, "policyControls.policyVersion", 80),
    policyApproved: true,
    humanApprovalRequired: true,
    auditPolicyApplied: true,
    customerDataAccessApplied: true,
    supportRolePermissionApplied: true,
    sensitiveIncidentControlApplied: true,
    serviceManagementPolicyApplied: true,
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
  assertBooleanTrue(context.customerDataAccessControlled, "governanceContext.customerDataAccessControlled");
  assertBooleanTrue(context.supportRolePermissionControlled, "governanceContext.supportRolePermissionControlled");
  assertBooleanTrue(context.sensitiveIncidentControlled, "governanceContext.sensitiveIncidentControlled");
  assertBooleanTrue(context.multiCountryGovernanceChecked, "governanceContext.multiCountryGovernanceChecked");
  return {
    humanGovernanceRequired: true,
    policyControlled: true,
    auditRequired: true,
    tenantIsolationRequired: true,
    noClinicalDecisioning: true,
    customerDataAccessControlled: true,
    supportRolePermissionControlled: true,
    sensitiveIncidentControlled: true,
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
    throw new CustomerSuccessValidationError("evidence must include at least one item");
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
  assertBooleanTrue(workflow.customerDataAccessVerified, "workflowControls.customerDataAccessVerified");
  assertBooleanTrue(workflow.supportRoleVerified, "workflowControls.supportRoleVerified");
  assertBooleanTrue(workflow.sensitiveIncidentControlsVerified, "workflowControls.sensitiveIncidentControlsVerified");

  if (recordGroup === recordGroups.customerSuccess) {
    assertBooleanTrue(workflow.accountOwnerAssigned, "workflowControls.accountOwnerAssigned");
    assertBooleanTrue(workflow.customerSuccessPlanReviewed, "workflowControls.customerSuccessPlanReviewed");
    if (recordType === "customer_health_score" || status === "at_risk") {
      assertBooleanTrue(workflow.healthScoreReviewed, "workflowControls.healthScoreReviewed");
      assertNonEmptyString(workflow.healthScoreReference, "workflowControls.healthScoreReference", 180);
    }
  }

  if (recordGroup === recordGroups.enterpriseSupport) {
    assertBooleanTrue(workflow.supportQueueAuthorized, "workflowControls.supportQueueAuthorized");
    assertBooleanTrue(workflow.slaPolicyChecked, "workflowControls.slaPolicyChecked");
    assertBooleanTrue(workflow.priorityClassified, "workflowControls.priorityClassified");
    assertBooleanTrue(workflow.assignmentAuthorized, "workflowControls.assignmentAuthorized");
    if (recordType === "escalation_workflow" || status === "escalated") {
      assertBooleanTrue(workflow.escalationApproved, "workflowControls.escalationApproved");
      assertNonEmptyString(workflow.escalationReference, "workflowControls.escalationReference", 180);
    }
    if (status === "resolved" || recordType === "support_history") {
      assertBooleanTrue(workflow.resolutionValidated, "workflowControls.resolutionValidated");
      assertNonEmptyString(workflow.resolutionReference, "workflowControls.resolutionReference", 180);
    }
  }

  if (recordGroup === recordGroups.serviceManagement) {
    assertBooleanTrue(workflow.serviceManagementAuthorized, "workflowControls.serviceManagementAuthorized");
    assertBooleanTrue(workflow.incidentImpactAssessed, "workflowControls.incidentImpactAssessed");
    if (recordType === "change_management") {
      assertNonEmptyString(workflow.changeApprovalReference, "workflowControls.changeApprovalReference", 180);
    }
    if (recordType === "service_request_management") {
      assertBooleanTrue(workflow.serviceRequestApproved, "workflowControls.serviceRequestApproved");
    }
    if (recordType === "root_cause_analysis" || recordType === "post_incident_review" || status === "resolved") {
      assertBooleanTrue(workflow.rootCauseDocumented, "workflowControls.rootCauseDocumented");
      assertBooleanTrue(workflow.postIncidentReviewCompleted, "workflowControls.postIncidentReviewCompleted");
    }
  }

  if (recordGroup === recordGroups.implementationOnboarding) {
    assertBooleanTrue(workflow.implementationGovernanceApproved, "workflowControls.implementationGovernanceApproved");
    assertBooleanTrue(workflow.onboardingOwnerAssigned, "workflowControls.onboardingOwnerAssigned");
    if (recordType === "customer_onboarding_workflow" && status === "started") {
      assertBooleanTrue(workflow.onboardingKickoffApproved, "workflowControls.onboardingKickoffApproved");
    }
    if (recordType === "customer_onboarding_workflow" && status === "completed") {
      assertBooleanTrue(workflow.goLiveReadinessApproved, "workflowControls.goLiveReadinessApproved");
      assertBooleanTrue(workflow.postGoLiveSupportAssigned, "workflowControls.postGoLiveSupportAssigned");
    }
  }

  if (recordGroup === recordGroups.customerCommunication) {
    assertBooleanTrue(workflow.communicationApproved, "workflowControls.communicationApproved");
    assertBooleanTrue(workflow.communicationAudienceVerified, "workflowControls.communicationAudienceVerified");
    if (recordType === "customer_feedback" || recordType === "customer_surveys") {
      assertBooleanTrue(workflow.feedbackConsentVerified, "workflowControls.feedbackConsentVerified");
    }
  }

  if (recordGroup === recordGroups.supportAnalytics) {
    assertBooleanTrue(workflow.analyticsDataGoverned, "workflowControls.analyticsDataGoverned");
    assertBooleanTrue(workflow.aggregationReviewed, "workflowControls.aggregationReviewed");
    assertBooleanTrue(workflow.piiSuppressionApplied, "workflowControls.piiSuppressionApplied");
  }

  return workflow;
}

export function validateCreateCustomerSuccessRecordInput(input) {
  const recordInput = validatePlainObject(input, "input");
  validateNoProhibitedClinicalAutomation(recordInput);

  const tenantId = assertNonEmptyString(recordInput.tenantId, "tenantId", 128);
  const recordGroup = assertNonEmptyString(recordInput.recordGroup, "recordGroup", 80);
  const recordType = assertNonEmptyString(recordInput.recordType, "recordType", 120);
  if (!isKnownGroup(recordGroup)) {
    throw new CustomerSuccessValidationError("recordGroup is not supported", { recordGroup });
  }
  if (!isKnownRecordType(recordGroup, recordType)) {
    throw new CustomerSuccessValidationError("recordType is not valid for recordGroup", { recordGroup, recordType });
  }
  const status = assertNonEmptyString(recordInput.status, "status", 80);
  if (!customerSuccessStatuses.includes(status)) {
    throw new CustomerSuccessValidationError("status is not supported", { status });
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
    accountId: optionalString(recordInput.accountId, "accountId", 160),
    customerId: optionalString(recordInput.customerId, "customerId", 160),
    customerHealthScoreId: optionalString(recordInput.customerHealthScoreId, "customerHealthScoreId", 160),
    successPlanId: optionalString(recordInput.successPlanId, "successPlanId", 160),
    milestoneId: optionalString(recordInput.milestoneId, "milestoneId", 160),
    supportTicketId: optionalString(recordInput.supportTicketId, "supportTicketId", 160),
    incidentId: optionalString(recordInput.incidentId, "incidentId", 160),
    problemId: optionalString(recordInput.problemId, "problemId", 160),
    changeId: optionalString(recordInput.changeId, "changeId", 160),
    serviceRequestId: optionalString(recordInput.serviceRequestId, "serviceRequestId", 160),
    knowledgeBaseArticleId: optionalString(recordInput.knowledgeBaseArticleId, "knowledgeBaseArticleId", 160),
    serviceCatalogId: optionalString(recordInput.serviceCatalogId, "serviceCatalogId", 160),
    implementationProjectId: optionalString(recordInput.implementationProjectId, "implementationProjectId", 160),
    onboardingId: optionalString(recordInput.onboardingId, "onboardingId", 160),
    communicationId: optionalString(recordInput.communicationId, "communicationId", 160),
    feedbackId: optionalString(recordInput.feedbackId, "feedbackId", 160),
    surveyId: optionalString(recordInput.surveyId, "surveyId", 160),
    releaseId: optionalString(recordInput.releaseId, "releaseId", 160),
    maintenanceWindowId: optionalString(recordInput.maintenanceWindowId, "maintenanceWindowId", 160),
    slaId: optionalString(recordInput.slaId, "slaId", 160),
    escalationId: optionalString(recordInput.escalationId, "escalationId", 160),
    assignmentId: optionalString(recordInput.assignmentId, "assignmentId", 160),
    supportAgentId: optionalString(recordInput.supportAgentId, "supportAgentId", 160),
    priority: validateEnum(recordInput.priority, priorities, "priority"),
    severity: validateEnum(recordInput.severity, severities, "severity"),
    healthScore: validateNumber(recordInput.healthScore, "healthScore", { min: 0, max: 100 }),
    satisfactionScore: validateNumber(recordInput.satisfactionScore, "satisfactionScore", { min: 0, max: 100 }),
    adoptionScore: validateNumber(recordInput.adoptionScore, "adoptionScore", { min: 0, max: 100 }),
    dueAt: validateDate(recordInput.dueAt, "dueAt"),
    targetResolutionAt: validateDate(recordInput.targetResolutionAt, "targetResolutionAt"),
    resolvedAt: validateDate(recordInput.resolvedAt, "resolvedAt"),
    startAt: validateDate(recordInput.startAt, "startAt"),
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
    throw new CustomerSuccessValidationError("sourceSystem is not supported", { sourceSystem });
  }
  return {
    tenantId: assertNonEmptyString(value.tenantId, "tenantId", 128),
    sourceSystem,
    sourceResourceType: assertNonEmptyString(value.sourceResourceType, "sourceResourceType", 160),
    sourceResourceId: assertNonEmptyString(value.sourceResourceId, "sourceResourceId", 180),
    customerSuccessResourceType: assertNonEmptyString(value.customerSuccessResourceType, "customerSuccessResourceType", 160),
    customerSuccessResourceId: assertNonEmptyString(value.customerSuccessResourceId, "customerSuccessResourceId", 180),
    countryCode: validateCountryCode(value.countryCode),
    metadata: optionalObject(value.metadata, "metadata")
  };
}
