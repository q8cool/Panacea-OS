import {
  integrationSources,
  isKnownGroup,
  isKnownRecordType,
  legalStatuses,
  permissionAllows,
  permissionsByGroup,
  prohibitedClinicalAutomationPhrases,
  recordGroups
} from "./legal-domain.mjs";

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const countryCodePattern = /^[A-Z]{2}$/;
const currencyCodePattern = /^[A-Z]{3}$/;
const riskLevels = Object.freeze(["low", "medium", "high", "critical"]);

export class LegalValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "LegalValidationError";
    this.details = details;
  }
}

export class LegalAuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "LegalAuthorizationError";
    this.details = details;
  }
}

export function assertNonEmptyString(value, fieldName, maxLength = 512) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new LegalValidationError(`${fieldName} is required`, { fieldName });
  }
  if (value.length > maxLength) {
    throw new LegalValidationError(`${fieldName} exceeds ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new LegalValidationError(`${fieldName} must be true`, { fieldName });
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
    throw new LegalValidationError(`${fieldName} must be an object`, { fieldName });
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
    throw new LegalValidationError(`${fieldName} must be an array`, { fieldName });
  }
  return value;
}

function validateDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 64);
  if (!isoDatePattern.test(raw) && !isoDateTimePattern.test(raw)) {
    throw new LegalValidationError(`${fieldName} must be an ISO date or ISO date-time`, { fieldName });
  }
  return raw;
}

function validateCountryCode(value, fieldName = "countryCode") {
  const raw = assertNonEmptyString(value, fieldName, 2).toUpperCase();
  if (!countryCodePattern.test(raw)) {
    throw new LegalValidationError(`${fieldName} must be an ISO 3166-1 alpha-2 country code`, { fieldName });
  }
  return raw;
}

function validateCurrency(value, fieldName = "currencyCode") {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 3).toUpperCase();
  if (!currencyCodePattern.test(raw)) {
    throw new LegalValidationError(`${fieldName} must be an ISO 4217 currency code`, { fieldName });
  }
  return raw;
}

function validateNumber(value, fieldName, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, nullable = true } = {}) {
  if ((value === undefined || value === null || value === "") && nullable) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new LegalValidationError(`${fieldName} must be a number between ${min} and ${max}`, { fieldName });
  }
  return value;
}

function validateRiskLevel(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, "riskLevel", 40);
  if (!riskLevels.includes(raw)) {
    throw new LegalValidationError("riskLevel is not supported", { riskLevel: raw });
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
      throw new LegalValidationError("Legal governance input contains prohibited clinical automation language", { phrase });
    }
  }
}

export function validatePrincipal(principal) {
  const actor = validatePlainObject(principal, "principal");
  const permissions = optionalArray(actor.permissions, "principal.permissions").map((permission, index) =>
    assertNonEmptyString(permission, `principal.permissions[${index}]`, 160)
  );
  if (permissions.length === 0) {
    throw new LegalAuthorizationError("principal.permissions must include at least one permission");
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
    throw new LegalAuthorizationError("principal is not authorized for this legal governance action", {
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
  assertBooleanTrue(policy.legalDataPrivacyApplied, "policyControls.legalDataPrivacyApplied");
  assertBooleanTrue(policy.contractAccessApplied, "policyControls.contractAccessApplied");
  assertBooleanTrue(policy.governanceAccessApplied, "policyControls.governanceAccessApplied");
  assertBooleanTrue(policy.regulatoryAccessApplied, "policyControls.regulatoryAccessApplied");
  return {
    policyId: assertNonEmptyString(policy.policyId, "policyControls.policyId", 160),
    policyVersion: assertNonEmptyString(policy.policyVersion, "policyControls.policyVersion", 80),
    policyApproved: true,
    humanApprovalRequired: true,
    auditPolicyApplied: true,
    legalDataPrivacyApplied: true,
    contractAccessApplied: true,
    governanceAccessApplied: true,
    regulatoryAccessApplied: true,
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
  assertBooleanTrue(context.legalDataPrivacyControlled, "governanceContext.legalDataPrivacyControlled");
  assertBooleanTrue(context.contractAccessControlled, "governanceContext.contractAccessControlled");
  assertBooleanTrue(context.governanceAccessControlled, "governanceContext.governanceAccessControlled");
  assertBooleanTrue(context.regulatoryAccessControlled, "governanceContext.regulatoryAccessControlled");
  assertBooleanTrue(context.multiCountryGovernanceChecked, "governanceContext.multiCountryGovernanceChecked");
  return {
    humanGovernanceRequired: true,
    policyControlled: true,
    auditRequired: true,
    tenantIsolationRequired: true,
    noClinicalDecisioning: true,
    legalDataPrivacyControlled: true,
    contractAccessControlled: true,
    governanceAccessControlled: true,
    regulatoryAccessControlled: true,
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
    throw new LegalValidationError("evidence must include at least one item");
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
  assertBooleanTrue(workflow.legalDataPrivacyVerified, "workflowControls.legalDataPrivacyVerified");
  assertBooleanTrue(workflow.contractAccessVerified, "workflowControls.contractAccessVerified");
  assertBooleanTrue(workflow.governanceAccessVerified, "workflowControls.governanceAccessVerified");
  assertBooleanTrue(workflow.regulatoryAccessVerified, "workflowControls.regulatoryAccessVerified");

  if (recordGroup === recordGroups.legalManagement) {
    assertBooleanTrue(workflow.legalReviewCompleted, "workflowControls.legalReviewCompleted");
    assertNonEmptyString(workflow.legalReviewReference, "workflowControls.legalReviewReference", 180);
    if (recordType === "legal_approval_workflow" || status === "approved") {
      assertBooleanTrue(workflow.legalApprovalCompleted, "workflowControls.legalApprovalCompleted");
      assertNonEmptyString(workflow.legalApprovalReference, "workflowControls.legalApprovalReference", 180);
    }
  }

  if (recordGroup === recordGroups.contractManagement) {
    assertBooleanTrue(workflow.contractLifecycleControlled, "workflowControls.contractLifecycleControlled");
    assertNonEmptyString(workflow.contractLifecycleReference, "workflowControls.contractLifecycleReference", 180);
    if (recordType === "contract_approval_workflow" || status === "approved") {
      assertBooleanTrue(workflow.contractApproved, "workflowControls.contractApproved");
      assertNonEmptyString(workflow.contractApprovalReference, "workflowControls.contractApprovalReference", 180);
    }
    if (recordType === "contract_expiration_tracking" || status === "expiring") {
      assertBooleanTrue(workflow.expirationMonitored, "workflowControls.expirationMonitored");
      assertNonEmptyString(workflow.renewalOwner, "workflowControls.renewalOwner", 180);
    }
  }

  if (recordGroup === recordGroups.enterpriseRiskManagement) {
    assertBooleanTrue(workflow.riskAssessed, "workflowControls.riskAssessed");
    assertNonEmptyString(workflow.riskOwner, "workflowControls.riskOwner", 180);
    if (recordType === "risk_mitigation_plan" || status === "mitigated") {
      assertBooleanTrue(workflow.mitigationApproved, "workflowControls.mitigationApproved");
      assertNonEmptyString(workflow.mitigationReference, "workflowControls.mitigationReference", 180);
    }
  }

  if (recordGroup === recordGroups.governance) {
    assertBooleanTrue(workflow.governanceBodyVerified, "workflowControls.governanceBodyVerified");
    assertBooleanTrue(workflow.decisionTraceabilityEnabled, "workflowControls.decisionTraceabilityEnabled");
    assertNonEmptyString(workflow.governanceReference, "workflowControls.governanceReference", 180);
  }

  if (recordGroup === recordGroups.policyManagement) {
    assertBooleanTrue(workflow.policyOwnerVerified, "workflowControls.policyOwnerVerified");
    assertBooleanTrue(workflow.policyVersionControlled, "workflowControls.policyVersionControlled");
    assertNonEmptyString(workflow.policyReference, "workflowControls.policyReference", 180);
    if (recordType === "policy_approval" || recordType === "policy_publication" || status === "approved" || status === "published") {
      assertBooleanTrue(workflow.policyApprovedForPublication, "workflowControls.policyApprovedForPublication");
      assertBooleanTrue(workflow.attestationTracked, "workflowControls.attestationTracked");
    }
  }

  if (recordGroup === recordGroups.complianceRegulatory) {
    assertBooleanTrue(workflow.regulatoryObligationMapped, "workflowControls.regulatoryObligationMapped");
    assertBooleanTrue(workflow.evidenceLinked, "workflowControls.evidenceLinked");
    assertNonEmptyString(workflow.regulatoryReference, "workflowControls.regulatoryReference", 180);
    if (recordType === "regulatory_submission_tracking" || status === "submitted") {
      assertBooleanTrue(workflow.submissionAuthorized, "workflowControls.submissionAuthorized");
      assertNonEmptyString(workflow.submissionReference, "workflowControls.submissionReference", 180);
    }
  }

  return workflow;
}

export function validateCreateLegalRecordInput(input) {
  const recordInput = validatePlainObject(input, "input");
  validateNoProhibitedClinicalAutomation(recordInput);

  const tenantId = assertNonEmptyString(recordInput.tenantId, "tenantId", 128);
  const recordGroup = assertNonEmptyString(recordInput.recordGroup, "recordGroup", 80);
  const recordType = assertNonEmptyString(recordInput.recordType, "recordType", 120);
  if (!isKnownGroup(recordGroup)) {
    throw new LegalValidationError("recordGroup is not supported", { recordGroup });
  }
  if (!isKnownRecordType(recordGroup, recordType)) {
    throw new LegalValidationError("recordType is not valid for recordGroup", { recordGroup, recordType });
  }
  const status = assertNonEmptyString(recordInput.status, "status", 80);
  if (!legalStatuses.includes(status)) {
    throw new LegalValidationError("status is not supported", { status });
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
    facilityId: optionalString(recordInput.facilityId, "facilityId", 160),
    departmentId: optionalString(recordInput.departmentId, "departmentId", 160),
    legalMatterId: optionalString(recordInput.legalMatterId, "legalMatterId", 160),
    legalCaseId: optionalString(recordInput.legalCaseId, "legalCaseId", 160),
    legalDocumentId: optionalString(recordInput.legalDocumentId, "legalDocumentId", 160),
    contractId: optionalString(recordInput.contractId, "contractId", 160),
    contractTemplateId: optionalString(recordInput.contractTemplateId, "contractTemplateId", 160),
    contractObligationId: optionalString(recordInput.contractObligationId, "contractObligationId", 160),
    vendorId: optionalString(recordInput.vendorId, "vendorId", 160),
    insuranceProviderId: optionalString(recordInput.insuranceProviderId, "insuranceProviderId", 160),
    employeeId: optionalString(recordInput.employeeId, "employeeId", 160),
    clinicalServiceId: optionalString(recordInput.clinicalServiceId, "clinicalServiceId", 160),
    riskId: optionalString(recordInput.riskId, "riskId", 160),
    mitigationPlanId: optionalString(recordInput.mitigationPlanId, "mitigationPlanId", 160),
    boardId: optionalString(recordInput.boardId, "boardId", 160),
    committeeId: optionalString(recordInput.committeeId, "committeeId", 160),
    meetingId: optionalString(recordInput.meetingId, "meetingId", 160),
    decisionId: optionalString(recordInput.decisionId, "decisionId", 160),
    policyId: optionalString(recordInput.policyId, "policyId", 160),
    policyVersionId: optionalString(recordInput.policyVersionId, "policyVersionId", 160),
    regulatoryObligationId: optionalString(recordInput.regulatoryObligationId, "regulatoryObligationId", 160),
    regulatorySubmissionId: optionalString(recordInput.regulatorySubmissionId, "regulatorySubmissionId", 160),
    evidenceRepositoryId: optionalString(recordInput.evidenceRepositoryId, "evidenceRepositoryId", 160),
    effectiveDate: validateDate(recordInput.effectiveDate, "effectiveDate"),
    expirationDate: validateDate(recordInput.expirationDate, "expirationDate"),
    reviewDueDate: validateDate(recordInput.reviewDueDate, "reviewDueDate"),
    submittedAt: validateDate(recordInput.submittedAt, "submittedAt"),
    approvedAt: validateDate(recordInput.approvedAt, "approvedAt"),
    riskScore: validateNumber(recordInput.riskScore, "riskScore", { min: 0, max: 100 }),
    riskLevel: validateRiskLevel(recordInput.riskLevel),
    amount: validateNumber(recordInput.amount, "amount", { min: 0 }),
    currencyCode: validateCurrency(recordInput.currencyCode),
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
    throw new LegalValidationError("sourceSystem is not supported", { sourceSystem });
  }
  return {
    tenantId: assertNonEmptyString(value.tenantId, "tenantId", 128),
    sourceSystem,
    sourceResourceType: assertNonEmptyString(value.sourceResourceType, "sourceResourceType", 160),
    sourceResourceId: assertNonEmptyString(value.sourceResourceId, "sourceResourceId", 180),
    legalResourceType: assertNonEmptyString(value.legalResourceType, "legalResourceType", 160),
    legalResourceId: assertNonEmptyString(value.legalResourceId, "legalResourceId", 180),
    countryCode: validateCountryCode(value.countryCode),
    metadata: optionalObject(value.metadata, "metadata")
  };
}
