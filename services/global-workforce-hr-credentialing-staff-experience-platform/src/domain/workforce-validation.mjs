import {
  integrationSources,
  isKnownGroup,
  isKnownRecordType,
  permissionsByGroup,
  permissionAllows,
  prohibitedClinicalAutomationPhrases,
  recordGroups,
  workforceStatuses
} from "./workforce-domain.mjs";

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const countryCodePattern = /^[A-Z]{2}$/;
const currencyCodePattern = /^[A-Z]{3}$/;

export class WorkforceValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "WorkforceValidationError";
    this.details = details;
  }
}

export class WorkforceAuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "WorkforceAuthorizationError";
    this.details = details;
  }
}

export function assertNonEmptyString(value, fieldName, maxLength = 512) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new WorkforceValidationError(`${fieldName} is required`, { fieldName });
  }
  if (value.length > maxLength) {
    throw new WorkforceValidationError(`${fieldName} exceeds ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new WorkforceValidationError(`${fieldName} must be true`, { fieldName });
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
    throw new WorkforceValidationError(`${fieldName} must be an object`, { fieldName });
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
    throw new WorkforceValidationError(`${fieldName} must be an array`, { fieldName });
  }
  return value;
}

function validateDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 64);
  if (!isoDatePattern.test(raw) && !isoDateTimePattern.test(raw)) {
    throw new WorkforceValidationError(`${fieldName} must be an ISO date or ISO date-time`, { fieldName });
  }
  return raw;
}

function validateCountryCode(value, fieldName = "countryCode") {
  const raw = assertNonEmptyString(value, fieldName, 2).toUpperCase();
  if (!countryCodePattern.test(raw)) {
    throw new WorkforceValidationError(`${fieldName} must be an ISO 3166-1 alpha-2 country code`, { fieldName });
  }
  return raw;
}

function validateCurrency(value, fieldName = "currencyCode") {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 3).toUpperCase();
  if (!currencyCodePattern.test(raw)) {
    throw new WorkforceValidationError(`${fieldName} must be an ISO 4217 currency code`, { fieldName });
  }
  return raw;
}

function validateNumber(value, fieldName, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, nullable = true } = {}) {
  if ((value === undefined || value === null || value === "") && nullable) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new WorkforceValidationError(`${fieldName} must be a number between ${min} and ${max}`, { fieldName });
  }
  return value;
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
      throw new WorkforceValidationError("Workforce platform input contains prohibited clinical automation language", {
        phrase
      });
    }
  }
}

export function validatePrincipal(principal) {
  const actor = validatePlainObject(principal, "principal");
  const tenantId = assertNonEmptyString(actor.tenantId, "principal.tenantId", 128);
  const actorId = assertNonEmptyString(actor.actorId, "principal.actorId", 128);
  const permissions = optionalArray(actor.permissions, "principal.permissions").map((permission, index) =>
    assertNonEmptyString(permission, `principal.permissions[${index}]`, 160)
  );
  if (permissions.length === 0) {
    throw new WorkforceAuthorizationError("principal.permissions must include at least one permission");
  }
  return {
    tenantId,
    actorId,
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
    throw new WorkforceAuthorizationError("principal is not authorized for this workforce action", {
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
  assertBooleanTrue(policy.hrDataPrivacyApplied, "policyControls.hrDataPrivacyApplied");
  assertBooleanTrue(policy.credentialingAccessApplied, "policyControls.credentialingAccessApplied");
  assertBooleanTrue(policy.staffSelfServicePolicyApplied, "policyControls.staffSelfServicePolicyApplied");
  return {
    policyId: assertNonEmptyString(policy.policyId, "policyControls.policyId", 160),
    policyVersion: assertNonEmptyString(policy.policyVersion, "policyControls.policyVersion", 80),
    policyApproved: true,
    humanApprovalRequired: true,
    auditPolicyApplied: true,
    hrDataPrivacyApplied: true,
    credentialingAccessApplied: true,
    staffSelfServicePolicyApplied: true,
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
  assertBooleanTrue(context.hrDataPrivacyControlled, "governanceContext.hrDataPrivacyControlled");
  assertBooleanTrue(context.credentialingAccessControlled, "governanceContext.credentialingAccessControlled");
  assertBooleanTrue(context.staffSelfServicePermissionChecked, "governanceContext.staffSelfServicePermissionChecked");
  assertBooleanTrue(context.multiCountryGovernanceChecked, "governanceContext.multiCountryGovernanceChecked");
  return {
    humanGovernanceRequired: true,
    policyControlled: true,
    auditRequired: true,
    tenantIsolationRequired: true,
    noClinicalDecisioning: true,
    hrDataPrivacyControlled: true,
    credentialingAccessControlled: true,
    staffSelfServicePermissionChecked: true,
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
    throw new WorkforceValidationError("evidence must include at least one item");
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

  if (recordGroup === recordGroups.workforceManagement) {
    assertBooleanTrue(workflow.hrDataPrivacyVerified, "workflowControls.hrDataPrivacyVerified");
    assertBooleanTrue(workflow.staffRecordAuthorized, "workflowControls.staffRecordAuthorized");
  }

  if (recordGroup === recordGroups.clinicalCredentialing) {
    assertBooleanTrue(workflow.credentialingAccessVerified, "workflowControls.credentialingAccessVerified");
    if (["credential_verification_workflow", "credentialing_committee_review"].includes(recordType)) {
      assertBooleanTrue(workflow.primarySourceVerificationCompleted, "workflowControls.primarySourceVerificationCompleted");
      assertBooleanTrue(workflow.credentialingCommitteeReviewCompleted, "workflowControls.credentialingCommitteeReviewCompleted");
    }
  }

  if (["staff_scheduling", "shift_management", "shift_coverage_monitoring"].includes(recordType)) {
    assertBooleanTrue(workflow.schedulingPolicyChecked, "workflowControls.schedulingPolicyChecked");
    assertBooleanTrue(workflow.fatigueRiskChecked, "workflowControls.fatigueRiskChecked");
    assertBooleanTrue(workflow.coverageApproved, "workflowControls.coverageApproved");
  }

  if (recordType === "leave_management" && status === "approved") {
    assertBooleanTrue(workflow.leavePolicyChecked, "workflowControls.leavePolicyChecked");
    assertNonEmptyString(workflow.managerApprovalReference, "workflowControls.managerApprovalReference", 180);
  }

  if (recordGroup === recordGroups.compliance || recordType === "training_assignments") {
    assertBooleanTrue(workflow.trainingRequirementMapped, "workflowControls.trainingRequirementMapped");
    assertBooleanTrue(workflow.complianceReviewed, "workflowControls.complianceReviewed");
  }

  if (recordGroup === recordGroups.hrOperations) {
    assertBooleanTrue(workflow.hrWorkflowAuthorized, "workflowControls.hrWorkflowAuthorized");
  }

  return workflow;
}

export function validateCreateWorkforceRecordInput(input) {
  const recordInput = validatePlainObject(input, "input");
  validateNoProhibitedClinicalAutomation(recordInput);

  const tenantId = assertNonEmptyString(recordInput.tenantId, "tenantId", 128);
  const recordGroup = assertNonEmptyString(recordInput.recordGroup, "recordGroup", 80);
  const recordType = assertNonEmptyString(recordInput.recordType, "recordType", 120);
  if (!isKnownGroup(recordGroup)) {
    throw new WorkforceValidationError("recordGroup is not supported", { recordGroup });
  }
  if (!isKnownRecordType(recordGroup, recordType)) {
    throw new WorkforceValidationError("recordType is not valid for recordGroup", { recordGroup, recordType });
  }
  const status = assertNonEmptyString(recordInput.status, "status", 80);
  if (!workforceStatuses.includes(status)) {
    throw new WorkforceValidationError("status is not supported", { status });
  }

  const countryCode = validateCountryCode(recordInput.countryCode);
  const jurisdictionCode = assertNonEmptyString(recordInput.jurisdictionCode, "jurisdictionCode", 160);

  return {
    tenantId,
    recordGroup,
    recordType,
    status,
    title: assertNonEmptyString(recordInput.title, "title", 240),
    description: optionalString(recordInput.description, "description", 2000),
    countryCode,
    regionCode: optionalString(recordInput.regionCode, "regionCode", 120),
    jurisdictionCode,
    facilityId: optionalString(recordInput.facilityId, "facilityId", 160),
    departmentId: optionalString(recordInput.departmentId, "departmentId", 160),
    staffId: optionalString(recordInput.staffId, "staffId", 160),
    employeeId: optionalString(recordInput.employeeId, "employeeId", 160),
    providerId: optionalString(recordInput.providerId, "providerId", 160),
    credentialId: optionalString(recordInput.credentialId, "credentialId", 160),
    licenseId: optionalString(recordInput.licenseId, "licenseId", 160),
    certificationId: optionalString(recordInput.certificationId, "certificationId", 160),
    privilegeId: optionalString(recordInput.privilegeId, "privilegeId", 160),
    shiftId: optionalString(recordInput.shiftId, "shiftId", 160),
    scheduleId: optionalString(recordInput.scheduleId, "scheduleId", 160),
    leaveRequestId: optionalString(recordInput.leaveRequestId, "leaveRequestId", 160),
    trainingAssignmentId: optionalString(recordInput.trainingAssignmentId, "trainingAssignmentId", 160),
    complianceRequirementId: optionalString(recordInput.complianceRequirementId, "complianceRequirementId", 160),
    payrollReferenceId: optionalString(recordInput.payrollReferenceId, "payrollReferenceId", 160),
    effectiveDate: validateDate(recordInput.effectiveDate, "effectiveDate"),
    expirationDate: validateDate(recordInput.expirationDate, "expirationDate"),
    reviewDueDate: validateDate(recordInput.reviewDueDate, "reviewDueDate"),
    scheduledStartAt: validateDate(recordInput.scheduledStartAt, "scheduledStartAt"),
    scheduledEndAt: validateDate(recordInput.scheduledEndAt, "scheduledEndAt"),
    fte: validateNumber(recordInput.fte, "fte", { min: 0, max: 2 }),
    hours: validateNumber(recordInput.hours, "hours", { min: 0, max: 168 }),
    costAmount: validateNumber(recordInput.costAmount, "costAmount", { min: 0 }),
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
    throw new WorkforceValidationError("sourceSystem is not supported", { sourceSystem });
  }
  return {
    tenantId: assertNonEmptyString(value.tenantId, "tenantId", 128),
    sourceSystem,
    sourceResourceType: assertNonEmptyString(value.sourceResourceType, "sourceResourceType", 160),
    sourceResourceId: assertNonEmptyString(value.sourceResourceId, "sourceResourceId", 180),
    workforceResourceType: assertNonEmptyString(value.workforceResourceType, "workforceResourceType", 160),
    workforceResourceId: assertNonEmptyString(value.workforceResourceId, "workforceResourceId", 180),
    countryCode: validateCountryCode(value.countryCode),
    metadata: optionalObject(value.metadata, "metadata")
  };
}
