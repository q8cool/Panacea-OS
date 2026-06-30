import {
  integrationSources,
  isKnownGroup,
  isKnownRecordType,
  permissionAllows,
  permissionsByGroup,
  privacyStatuses,
  prohibitedPolicyBoundaryPhrases,
  recordGroups
} from "./privacy-domain.mjs";

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const countryCodePattern = /^[A-Z]{2}$/;
const priorities = Object.freeze(["low", "medium", "high", "critical"]);
const severities = Object.freeze(["low", "medium", "high", "critical"]);
const riskLevels = Object.freeze(["minimal", "low", "moderate", "high", "critical"]);

export class PrivacyValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "PrivacyValidationError";
    this.details = details;
  }
}

export class PrivacyAuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "PrivacyAuthorizationError";
    this.details = details;
  }
}

export function assertNonEmptyString(value, fieldName, maxLength = 512) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new PrivacyValidationError(`${fieldName} is required`, { fieldName });
  }
  if (value.length > maxLength) {
    throw new PrivacyValidationError(`${fieldName} exceeds ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new PrivacyValidationError(`${fieldName} must be true`, { fieldName });
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
    throw new PrivacyValidationError(`${fieldName} must be an object`, { fieldName });
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
    throw new PrivacyValidationError(`${fieldName} must be an array`, { fieldName });
  }
  return value;
}

function validateDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 64);
  if (!isoDatePattern.test(raw) && !isoDateTimePattern.test(raw)) {
    throw new PrivacyValidationError(`${fieldName} must be an ISO date or ISO date-time`, { fieldName });
  }
  return raw;
}

function validateCountryCode(value, fieldName = "countryCode") {
  const raw = assertNonEmptyString(value, fieldName, 2).toUpperCase();
  if (!countryCodePattern.test(raw)) {
    throw new PrivacyValidationError(`${fieldName} must be an ISO 3166-1 alpha-2 country code`, { fieldName });
  }
  return raw;
}

function validateNumber(value, fieldName, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, nullable = true } = {}) {
  if ((value === undefined || value === null || value === "") && nullable) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new PrivacyValidationError(`${fieldName} must be a number between ${min} and ${max}`, { fieldName });
  }
  return value;
}

function validateEnum(value, allowed, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 80);
  if (!allowed.includes(raw)) {
    throw new PrivacyValidationError(`${fieldName} is not supported`, { [fieldName]: raw });
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

function validateNoProhibitedPolicyBoundaryLanguage(input) {
  const joined = collectStrings(input).join(" ").toLowerCase();
  for (const phrase of prohibitedPolicyBoundaryPhrases) {
    if (joined.includes(phrase)) {
      throw new PrivacyValidationError("privacy input contains prohibited clinical automation or policy-boundary language", { phrase });
    }
  }
}

export function validatePrincipal(principal) {
  const actor = validatePlainObject(principal, "principal");
  const permissions = optionalArray(actor.permissions, "principal.permissions").map((permission, index) =>
    assertNonEmptyString(permission, `principal.permissions[${index}]`, 180)
  );
  if (permissions.length === 0) {
    throw new PrivacyAuthorizationError("principal.permissions must include at least one permission");
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
    throw new PrivacyAuthorizationError("principal is not authorized for this privacy action", {
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
  assertBooleanTrue(policy.purposeAccessControlApplied, "policyControls.purposeAccessControlApplied");
  assertBooleanTrue(policy.consentEnforcementApplied, "policyControls.consentEnforcementApplied");
  assertBooleanTrue(policy.dataResidencyApplied, "policyControls.dataResidencyApplied");
  assertBooleanTrue(policy.crossBorderPolicyApplied, "policyControls.crossBorderPolicyApplied");
  assertBooleanTrue(policy.dataMinimizationApplied, "policyControls.dataMinimizationApplied");
  assertBooleanTrue(policy.retentionPolicyApplied, "policyControls.retentionPolicyApplied");
  assertBooleanTrue(policy.noUnauthorizedDisclosure, "policyControls.noUnauthorizedDisclosure");
  return {
    policyId: assertNonEmptyString(policy.policyId, "policyControls.policyId", 160),
    policyVersion: assertNonEmptyString(policy.policyVersion, "policyControls.policyVersion", 80),
    policyApproved: true,
    humanApprovalRequired: true,
    auditPolicyApplied: true,
    purposeAccessControlApplied: true,
    consentEnforcementApplied: true,
    dataResidencyApplied: true,
    crossBorderPolicyApplied: true,
    dataMinimizationApplied: true,
    retentionPolicyApplied: true,
    noUnauthorizedDisclosure: true,
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
  assertBooleanTrue(context.consentRequired, "governanceContext.consentRequired");
  assertBooleanTrue(context.purposeBoundProcessing, "governanceContext.purposeBoundProcessing");
  assertBooleanTrue(context.dataResidencyChecked, "governanceContext.dataResidencyChecked");
  assertBooleanTrue(context.crossBorderPolicyChecked, "governanceContext.crossBorderPolicyChecked");
  assertBooleanTrue(context.dataMinimizationRequired, "governanceContext.dataMinimizationRequired");
  assertBooleanTrue(context.noExternalSharingOutsidePolicy, "governanceContext.noExternalSharingOutsidePolicy");
  assertBooleanTrue(context.multiCountryGovernanceChecked, "governanceContext.multiCountryGovernanceChecked");
  return {
    humanGovernanceRequired: true,
    policyControlled: true,
    auditRequired: true,
    tenantIsolationRequired: true,
    noClinicalDecisioning: true,
    consentRequired: true,
    purposeBoundProcessing: true,
    dataResidencyChecked: true,
    crossBorderPolicyChecked: true,
    dataMinimizationRequired: true,
    noExternalSharingOutsidePolicy: true,
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
    throw new PrivacyValidationError("evidence must include at least one item");
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

function validateWorkflowCommon(value) {
  const workflow = validatePlainObject(value, "workflowControls");
  assertBooleanTrue(workflow.auditEnabled, "workflowControls.auditEnabled");
  assertBooleanTrue(workflow.tenantIsolationVerified, "workflowControls.tenantIsolationVerified");
  assertBooleanTrue(workflow.humanReviewRequired, "workflowControls.humanReviewRequired");
  assertBooleanTrue(workflow.policyChecked, "workflowControls.policyChecked");
  assertBooleanTrue(workflow.consentChecked, "workflowControls.consentChecked");
  assertBooleanTrue(workflow.purposeAccessVerified, "workflowControls.purposeAccessVerified");
  assertBooleanTrue(workflow.dataResidencyVerified, "workflowControls.dataResidencyVerified");
  assertBooleanTrue(workflow.crossBorderPolicyVerified, "workflowControls.crossBorderPolicyVerified");
  assertBooleanTrue(workflow.dataMinimizationVerified, "workflowControls.dataMinimizationVerified");
  assertBooleanTrue(workflow.noExternalExposureVerified, "workflowControls.noExternalExposureVerified");
  return workflow;
}

function requireControl(workflow, fieldName) {
  assertBooleanTrue(workflow[fieldName], `workflowControls.${fieldName}`);
}

function requireStringControl(workflow, fieldName) {
  return assertNonEmptyString(workflow[fieldName], `workflowControls.${fieldName}`, 220);
}

function validateGroupControls(recordGroup, recordType, status, workflow) {
  if (recordGroup === recordGroups.globalConsent) {
    requireControl(workflow, "consentOwnerAssigned");
    requireControl(workflow, "consentScopeDefined");
    if (recordType === "consent_withdrawal" || status === "withdrawn") {
      requireControl(workflow, "withdrawalVerified");
      requireStringControl(workflow, "withdrawalReference");
    }
    if (recordType === "consent_expiration" || status === "expired") {
      requireControl(workflow, "expirationChecked");
    }
    if (recordType === "consent_scope_management") {
      requireControl(workflow, "scopeApproved");
      requireStringControl(workflow, "scopeApprovalReference");
    }
  }

  if (recordGroup === recordGroups.patientDataRights) {
    requireControl(workflow, "requestOwnerAssigned");
    requireControl(workflow, "identityVerified");
    requireControl(workflow, "legalBasisReviewed");
    requireControl(workflow, "fulfillmentTracked");
    if (recordType === "data_deletion_requests") {
      requireControl(workflow, "legalDeletionPermitted");
      requireStringControl(workflow, "legalDeletionReference");
    }
    if (recordType === "data_export_requests" && (status === "completed" || status === "fulfilled")) {
      requireControl(workflow, "exportCompleted");
      requireStringControl(workflow, "exportPackageReference");
    }
  }

  if (recordGroup === recordGroups.privacyPolicyEngine) {
    requireControl(workflow, "policyOwnerAssigned");
    requireControl(workflow, "policyRuleApproved");
    requireControl(workflow, "purposeAccessControlVerified");
    requireControl(workflow, "retentionPolicyVerified");
    if (recordType === "privacy_exception_workflow" && status === "approved") {
      requireControl(workflow, "exceptionApproved");
      requireStringControl(workflow, "exceptionApprovalReference");
    }
  }

  if (recordGroup === recordGroups.dataSharingGovernance) {
    requireControl(workflow, "sharingOwnerAssigned");
    requireControl(workflow, "sharingPurposeApproved");
    requireControl(workflow, "recipientTrustVerified");
    requireControl(workflow, "agreementApproved");
    if (recordType === "cross_border_sharing_controls") {
      requireStringControl(workflow, "crossBorderApprovalReference");
    }
    if (recordType === "research_sharing_controls") {
      requireStringControl(workflow, "researchApprovalReference");
    }
    if (recordType === "ai_data_use_controls") {
      requireStringControl(workflow, "aiDataUseApprovalReference");
    }
  }

  if (recordGroup === recordGroups.trustPlatform) {
    requireControl(workflow, "trustOwnerAssigned");
    requireControl(workflow, "trustVerificationCompleted");
    if (recordType === "trust_expiration_tracking" || status === "expired") {
      requireControl(workflow, "expirationNoticeSent");
    }
  }

  if (recordGroup === recordGroups.privacyMonitoring) {
    requireControl(workflow, "monitoringOwnerAssigned");
    requireControl(workflow, "monitoringThresholdsApproved");
    if (recordType === "consent_violation_detection" || recordType === "policy_violation_detection") {
      requireControl(workflow, "violationReviewed");
      requireStringControl(workflow, "violationReviewReference");
    }
    if (recordType === "privacy_incident_registry") {
      requireControl(workflow, "incidentOwnerAssigned");
      requireControl(workflow, "incidentSeverityReviewed");
    }
  }
}

export function validateCreatePrivacyRecordInput(input) {
  const value = validatePlainObject(input, "input");
  validateNoProhibitedPolicyBoundaryLanguage(value);

  const recordGroup = assertNonEmptyString(value.recordGroup, "recordGroup", 80);
  if (!isKnownGroup(recordGroup)) {
    throw new PrivacyValidationError("recordGroup is not supported", { recordGroup });
  }
  const recordType = assertNonEmptyString(value.recordType, "recordType", 120);
  if (!isKnownRecordType(recordGroup, recordType)) {
    throw new PrivacyValidationError("recordType is not supported for recordGroup", { recordGroup, recordType });
  }
  const status = assertNonEmptyString(value.status, "status", 80);
  if (!privacyStatuses.includes(status)) {
    throw new PrivacyValidationError("status is not supported", { status });
  }
  const countryCode = validateCountryCode(value.countryCode);
  const governanceContext = validateGovernanceContext(value.governanceContext);
  if (governanceContext.approvedCountries.length > 0 && !governanceContext.approvedCountries.includes(countryCode)) {
    throw new PrivacyValidationError("countryCode must be included in governanceContext.approvedCountries", {
      countryCode,
      approvedCountries: governanceContext.approvedCountries
    });
  }
  const workflowControls = validateWorkflowCommon(value.workflowControls);
  validateGroupControls(recordGroup, recordType, status, workflowControls);

  return {
    tenantId: assertNonEmptyString(value.tenantId, "tenantId", 128),
    recordGroup,
    recordType,
    status,
    title: assertNonEmptyString(value.title, "title", 240),
    description: optionalString(value.description, "description", 2000),
    countryCode,
    regionCode: optionalString(value.regionCode, "regionCode", 120),
    jurisdictionCode: assertNonEmptyString(value.jurisdictionCode, "jurisdictionCode", 120),
    organizationId: optionalString(value.organizationId, "organizationId", 160),
    dataSubjectId: optionalString(value.dataSubjectId, "dataSubjectId", 180),
    patientId: optionalString(value.patientId, "patientId", 180),
    consentId: optionalString(value.consentId, "consentId", 180),
    consentVersionId: optionalString(value.consentVersionId, "consentVersionId", 180),
    consentScopeId: optionalString(value.consentScopeId, "consentScopeId", 180),
    dataRightsRequestId: optionalString(value.dataRightsRequestId, "dataRightsRequestId", 180),
    privacyPolicyId: optionalString(value.privacyPolicyId, "privacyPolicyId", 180),
    purposeId: optionalString(value.purposeId, "purposeId", 180),
    minimizationRuleId: optionalString(value.minimizationRuleId, "minimizationRuleId", 180),
    retentionPolicyId: optionalString(value.retentionPolicyId, "retentionPolicyId", 180),
    privacyExceptionId: optionalString(value.privacyExceptionId, "privacyExceptionId", 180),
    sharingAgreementId: optionalString(value.sharingAgreementId, "sharingAgreementId", 180),
    sharingPurposeId: optionalString(value.sharingPurposeId, "sharingPurposeId", 180),
    sharingApprovalId: optionalString(value.sharingApprovalId, "sharingApprovalId", 180),
    sourceOrganizationId: optionalString(value.sourceOrganizationId, "sourceOrganizationId", 180),
    recipientOrganizationId: optionalString(value.recipientOrganizationId, "recipientOrganizationId", 180),
    trustRelationshipId: optionalString(value.trustRelationshipId, "trustRelationshipId", 180),
    trustProfileId: optionalString(value.trustProfileId, "trustProfileId", 180),
    dataProcessorId: optionalString(value.dataProcessorId, "dataProcessorId", 180),
    dataControllerId: optionalString(value.dataControllerId, "dataControllerId", 180),
    trustedPartnerId: optionalString(value.trustedPartnerId, "trustedPartnerId", 180),
    verificationId: optionalString(value.verificationId, "verificationId", 180),
    monitoringId: optionalString(value.monitoringId, "monitoringId", 180),
    violationId: optionalString(value.violationId, "violationId", 180),
    privacyIncidentId: optionalString(value.privacyIncidentId, "privacyIncidentId", 180),
    riskAssessmentId: optionalString(value.riskAssessmentId, "riskAssessmentId", 180),
    ownerId: optionalString(value.ownerId, "ownerId", 180),
    reviewerId: optionalString(value.reviewerId, "reviewerId", 180),
    approvalId: optionalString(value.approvalId, "approvalId", 180),
    priority: validateEnum(value.priority, priorities, "priority"),
    severity: validateEnum(value.severity, severities, "severity"),
    riskLevel: validateEnum(value.riskLevel, riskLevels, "riskLevel"),
    riskScore: validateNumber(value.riskScore, "riskScore", { min: 0, max: 100 }),
    complianceScore: validateNumber(value.complianceScore, "complianceScore", { min: 0, max: 100 }),
    consentCoverageScore: validateNumber(value.consentCoverageScore, "consentCoverageScore", { min: 0, max: 100 }),
    trustScore: validateNumber(value.trustScore, "trustScore", { min: 0, max: 100 }),
    fulfillmentScore: validateNumber(value.fulfillmentScore, "fulfillmentScore", { min: 0, max: 100 }),
    startedAt: validateDate(value.startedAt, "startedAt"),
    completedAt: validateDate(value.completedAt, "completedAt"),
    approvedAt: validateDate(value.approvedAt, "approvedAt"),
    requestedAt: validateDate(value.requestedAt, "requestedAt"),
    fulfilledAt: validateDate(value.fulfilledAt, "fulfilledAt"),
    withdrawnAt: validateDate(value.withdrawnAt, "withdrawnAt"),
    expiresAt: validateDate(value.expiresAt, "expiresAt"),
    detectedAt: validateDate(value.detectedAt, "detectedAt"),
    closedAt: validateDate(value.closedAt, "closedAt"),
    generatedAt: validateDate(value.generatedAt, "generatedAt"),
    policyControls: validatePolicyControls(value.policyControls),
    governanceContext,
    workflowControls: { ...workflowControls },
    evidence: validateEvidence(value.evidence),
    metrics: optionalObject(value.metrics, "metrics"),
    metadata: optionalObject(value.metadata, "metadata")
  };
}

export function validateIntegrationReferenceInput(input) {
  const value = validatePlainObject(input, "input");
  validateNoProhibitedPolicyBoundaryLanguage(value);
  const sourceSystem = assertNonEmptyString(value.sourceSystem, "sourceSystem", 120);
  if (!integrationSources.includes(sourceSystem)) {
    throw new PrivacyValidationError("sourceSystem is not supported", { sourceSystem });
  }
  return {
    tenantId: assertNonEmptyString(value.tenantId, "tenantId", 128),
    sourceSystem,
    sourceResourceType: assertNonEmptyString(value.sourceResourceType, "sourceResourceType", 160),
    sourceResourceId: assertNonEmptyString(value.sourceResourceId, "sourceResourceId", 180),
    privacyResourceType: assertNonEmptyString(value.privacyResourceType, "privacyResourceType", 160),
    privacyResourceId: assertNonEmptyString(value.privacyResourceId, "privacyResourceId", 180),
    countryCode: validateCountryCode(value.countryCode),
    metadata: optionalObject(value.metadata, "metadata")
  };
}
