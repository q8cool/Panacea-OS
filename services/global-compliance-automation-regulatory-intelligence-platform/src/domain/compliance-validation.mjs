import {
  complianceStatuses,
  integrationSources,
  isKnownGroup,
  isKnownRecordType,
  permissionAllows,
  permissionsByGroup,
  prohibitedClinicalAutomationPhrases,
  recordGroups
} from "./compliance-domain.mjs";

const isoDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const countryCodePattern = /^[A-Z]{2}$/;
const priorities = Object.freeze(["low", "medium", "high", "critical"]);
const severities = Object.freeze(["low", "medium", "high", "critical"]);

export class ComplianceValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ComplianceValidationError";
    this.details = details;
  }
}

export class ComplianceAuthorizationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ComplianceAuthorizationError";
    this.details = details;
  }
}

export function assertNonEmptyString(value, fieldName, maxLength = 512) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ComplianceValidationError(`${fieldName} is required`, { fieldName });
  }
  if (value.length > maxLength) {
    throw new ComplianceValidationError(`${fieldName} exceeds ${maxLength} characters`, { fieldName });
  }
  return value.trim();
}

function assertBooleanTrue(value, fieldName) {
  if (value !== true) {
    throw new ComplianceValidationError(`${fieldName} must be true`, { fieldName });
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
    throw new ComplianceValidationError(`${fieldName} must be an object`, { fieldName });
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
    throw new ComplianceValidationError(`${fieldName} must be an array`, { fieldName });
  }
  return value;
}

function validateDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 64);
  if (!isoDatePattern.test(raw) && !isoDateTimePattern.test(raw)) {
    throw new ComplianceValidationError(`${fieldName} must be an ISO date or ISO date-time`, { fieldName });
  }
  return raw;
}

function validateCountryCode(value, fieldName = "countryCode") {
  const raw = assertNonEmptyString(value, fieldName, 2).toUpperCase();
  if (!countryCodePattern.test(raw)) {
    throw new ComplianceValidationError(`${fieldName} must be an ISO 3166-1 alpha-2 country code`, { fieldName });
  }
  return raw;
}

function validateNumber(value, fieldName, { min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, nullable = true } = {}) {
  if ((value === undefined || value === null || value === "") && nullable) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new ComplianceValidationError(`${fieldName} must be a number between ${min} and ${max}`, { fieldName });
  }
  return value;
}

function validateEnum(value, allowed, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const raw = assertNonEmptyString(value, fieldName, 80);
  if (!allowed.includes(raw)) {
    throw new ComplianceValidationError(`${fieldName} is not supported`, { [fieldName]: raw });
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
      throw new ComplianceValidationError("Compliance input contains prohibited clinical automation language", { phrase });
    }
  }
}

export function validatePrincipal(principal) {
  const actor = validatePlainObject(principal, "principal");
  const permissions = optionalArray(actor.permissions, "principal.permissions").map((permission, index) =>
    assertNonEmptyString(permission, `principal.permissions[${index}]`, 180)
  );
  if (permissions.length === 0) {
    throw new ComplianceAuthorizationError("principal.permissions must include at least one permission");
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
    throw new ComplianceAuthorizationError("principal is not authorized for this compliance action", {
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
  assertBooleanTrue(policy.complianceRolePermissionApplied, "policyControls.complianceRolePermissionApplied");
  assertBooleanTrue(policy.regulatoryAccessControlApplied, "policyControls.regulatoryAccessControlApplied");
  assertBooleanTrue(policy.evidenceRepositoryAccessApplied, "policyControls.evidenceRepositoryAccessApplied");
  assertBooleanTrue(policy.policyControlledAutomationApplied, "policyControls.policyControlledAutomationApplied");
  return {
    policyId: assertNonEmptyString(policy.policyId, "policyControls.policyId", 160),
    policyVersion: assertNonEmptyString(policy.policyVersion, "policyControls.policyVersion", 80),
    policyApproved: true,
    humanApprovalRequired: true,
    auditPolicyApplied: true,
    complianceRolePermissionApplied: true,
    regulatoryAccessControlApplied: true,
    evidenceRepositoryAccessApplied: true,
    policyControlledAutomationApplied: true,
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
  assertBooleanTrue(context.complianceRoleControlled, "governanceContext.complianceRoleControlled");
  assertBooleanTrue(context.regulatoryAccessControlled, "governanceContext.regulatoryAccessControlled");
  assertBooleanTrue(context.evidenceRepositoryAccessControlled, "governanceContext.evidenceRepositoryAccessControlled");
  assertBooleanTrue(context.multiCountryGovernanceChecked, "governanceContext.multiCountryGovernanceChecked");
  return {
    humanGovernanceRequired: true,
    policyControlled: true,
    auditRequired: true,
    tenantIsolationRequired: true,
    noClinicalDecisioning: true,
    complianceRoleControlled: true,
    regulatoryAccessControlled: true,
    evidenceRepositoryAccessControlled: true,
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
    throw new ComplianceValidationError("evidence must include at least one item");
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
  assertBooleanTrue(workflow.complianceRoleVerified, "workflowControls.complianceRoleVerified");
  assertBooleanTrue(workflow.regulatoryAccessVerified, "workflowControls.regulatoryAccessVerified");
  assertBooleanTrue(workflow.evidenceRepositoryAccessVerified, "workflowControls.evidenceRepositoryAccessVerified");

  if (recordGroup === recordGroups.regulatoryIntelligence) {
    assertBooleanTrue(workflow.regulatoryOwnerAssigned, "workflowControls.regulatoryOwnerAssigned");
    assertBooleanTrue(workflow.regulatoryMappingVerified, "workflowControls.regulatoryMappingVerified");
    if (recordType === "regulatory_change_tracking" || status === "updated" || status === "changed") {
      assertBooleanTrue(workflow.regulatoryChangeReviewed, "workflowControls.regulatoryChangeReviewed");
      assertNonEmptyString(workflow.regulatoryChangeReference, "workflowControls.regulatoryChangeReference", 180);
    }
    if (recordType === "regulatory_impact_assessment") {
      assertBooleanTrue(workflow.impactAssessmentApproved, "workflowControls.impactAssessmentApproved");
    }
  }

  if (recordGroup === recordGroups.complianceAutomation) {
    assertBooleanTrue(workflow.complianceRuleReviewed, "workflowControls.complianceRuleReviewed");
    assertBooleanTrue(workflow.checklistGoverned, "workflowControls.checklistGoverned");
    if (recordType === "evidence_validation") {
      assertBooleanTrue(workflow.evidenceValidationCompleted, "workflowControls.evidenceValidationCompleted");
    }
    if (recordType === "compliance_gap_detection") {
      assertBooleanTrue(workflow.gapReviewCompleted, "workflowControls.gapReviewCompleted");
      assertNonEmptyString(workflow.gapReference, "workflowControls.gapReference", 180);
    }
    if (recordType === "compliance_remediation_workflow" && (status === "completed" || status === "remediated")) {
      assertBooleanTrue(workflow.remediationApproved, "workflowControls.remediationApproved");
      assertNonEmptyString(workflow.remediationReference, "workflowControls.remediationReference", 180);
    }
  }

  if (recordGroup === recordGroups.auditManagement) {
    assertBooleanTrue(workflow.auditOwnerAssigned, "workflowControls.auditOwnerAssigned");
    assertBooleanTrue(workflow.auditScopeApproved, "workflowControls.auditScopeApproved");
    if (recordType === "audit_findings") {
      assertBooleanTrue(workflow.findingReviewCompleted, "workflowControls.findingReviewCompleted");
    }
    if (recordType === "audit_closure_workflow" || status === "completed") {
      assertBooleanTrue(workflow.auditClosureApproved, "workflowControls.auditClosureApproved");
      assertNonEmptyString(workflow.auditClosureReference, "workflowControls.auditClosureReference", 180);
    }
    if (recordType === "corrective_action_plans") {
      assertBooleanTrue(workflow.correctiveActionPlanApproved, "workflowControls.correctiveActionPlanApproved");
    }
  }

  if (recordGroup === recordGroups.certificationManagement) {
    assertBooleanTrue(workflow.certificationOwnerAssigned, "workflowControls.certificationOwnerAssigned");
    assertBooleanTrue(workflow.certificationRequirementVerified, "workflowControls.certificationRequirementVerified");
    if (recordType === "certification_expiration_alerts" || status === "expiring") {
      assertBooleanTrue(workflow.expirationAlertReviewed, "workflowControls.expirationAlertReviewed");
    }
    if (recordType === "certification_renewal_tracking") {
      assertBooleanTrue(workflow.renewalPlanApproved, "workflowControls.renewalPlanApproved");
    }
  }

  if (recordGroup === recordGroups.policyCompliance) {
    assertBooleanTrue(workflow.policyMappingVerified, "workflowControls.policyMappingVerified");
    assertBooleanTrue(workflow.attestationGoverned, "workflowControls.attestationGoverned");
    if (recordType === "policy_exception_management") {
      assertBooleanTrue(workflow.exceptionApproved, "workflowControls.exceptionApproved");
    }
    if (recordType === "policy_violation_tracking" || status === "detected") {
      assertBooleanTrue(workflow.violationReviewCompleted, "workflowControls.violationReviewCompleted");
      assertNonEmptyString(workflow.violationReference, "workflowControls.violationReference", 180);
    }
    if (recordType === "compliance_review_workflow") {
      assertBooleanTrue(workflow.complianceReviewApproved, "workflowControls.complianceReviewApproved");
    }
  }

  if (recordGroup === recordGroups.regulatoryReporting) {
    assertBooleanTrue(workflow.reportTemplateApproved, "workflowControls.reportTemplateApproved");
    assertBooleanTrue(workflow.reportingAuthorityVerified, "workflowControls.reportingAuthorityVerified");
    if (recordType === "report_generation" || status === "generated") {
      assertBooleanTrue(workflow.reportGenerationValidated, "workflowControls.reportGenerationValidated");
    }
    if (recordType === "report_submission_tracking" || status === "submitted") {
      assertBooleanTrue(workflow.reportSubmissionApproved, "workflowControls.reportSubmissionApproved");
    }
    if (recordType === "report_approval_workflow" || status === "approved") {
      assertBooleanTrue(workflow.reportApprovalCompleted, "workflowControls.reportApprovalCompleted");
      assertNonEmptyString(workflow.reportApprovalReference, "workflowControls.reportApprovalReference", 180);
    }
  }

  return workflow;
}

export function validateCreateComplianceRecordInput(input) {
  const recordInput = validatePlainObject(input, "input");
  validateNoProhibitedClinicalAutomation(recordInput);

  const tenantId = assertNonEmptyString(recordInput.tenantId, "tenantId", 128);
  const recordGroup = assertNonEmptyString(recordInput.recordGroup, "recordGroup", 80);
  const recordType = assertNonEmptyString(recordInput.recordType, "recordType", 120);
  if (!isKnownGroup(recordGroup)) {
    throw new ComplianceValidationError("recordGroup is not supported", { recordGroup });
  }
  if (!isKnownRecordType(recordGroup, recordType)) {
    throw new ComplianceValidationError("recordType is not valid for recordGroup", { recordGroup, recordType });
  }
  const status = assertNonEmptyString(recordInput.status, "status", 80);
  if (!complianceStatuses.includes(status)) {
    throw new ComplianceValidationError("status is not supported", { status });
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
    frameworkId: optionalString(recordInput.frameworkId, "frameworkId", 160),
    regulationId: optionalString(recordInput.regulationId, "regulationId", 160),
    requirementId: optionalString(recordInput.requirementId, "requirementId", 160),
    changeId: optionalString(recordInput.changeId, "changeId", 160),
    impactAssessmentId: optionalString(recordInput.impactAssessmentId, "impactAssessmentId", 160),
    calendarId: optionalString(recordInput.calendarId, "calendarId", 160),
    ruleId: optionalString(recordInput.ruleId, "ruleId", 160),
    checklistId: optionalString(recordInput.checklistId, "checklistId", 160),
    evidenceId: optionalString(recordInput.evidenceId, "evidenceId", 160),
    gapId: optionalString(recordInput.gapId, "gapId", 160),
    remediationId: optionalString(recordInput.remediationId, "remediationId", 160),
    dashboardId: optionalString(recordInput.dashboardId, "dashboardId", 160),
    auditPlanId: optionalString(recordInput.auditPlanId, "auditPlanId", 160),
    auditScheduleId: optionalString(recordInput.auditScheduleId, "auditScheduleId", 160),
    auditScopeId: optionalString(recordInput.auditScopeId, "auditScopeId", 160),
    auditFindingId: optionalString(recordInput.auditFindingId, "auditFindingId", 160),
    correctiveActionPlanId: optionalString(recordInput.correctiveActionPlanId, "correctiveActionPlanId", 160),
    certificationId: optionalString(recordInput.certificationId, "certificationId", 160),
    certificationRequirementId: optionalString(recordInput.certificationRequirementId, "certificationRequirementId", 160),
    policyId: optionalString(recordInput.policyId, "policyId", 160),
    attestationId: optionalString(recordInput.attestationId, "attestationId", 160),
    exceptionId: optionalString(recordInput.exceptionId, "exceptionId", 160),
    violationId: optionalString(recordInput.violationId, "violationId", 160),
    reviewId: optionalString(recordInput.reviewId, "reviewId", 160),
    reportTemplateId: optionalString(recordInput.reportTemplateId, "reportTemplateId", 160),
    reportId: optionalString(recordInput.reportId, "reportId", 160),
    submissionId: optionalString(recordInput.submissionId, "submissionId", 160),
    correspondenceId: optionalString(recordInput.correspondenceId, "correspondenceId", 160),
    ownerId: optionalString(recordInput.ownerId, "ownerId", 160),
    approvalId: optionalString(recordInput.approvalId, "approvalId", 160),
    priority: validateEnum(recordInput.priority, priorities, "priority"),
    severity: validateEnum(recordInput.severity, severities, "severity"),
    complianceScore: validateNumber(recordInput.complianceScore, "complianceScore", { min: 0, max: 100 }),
    riskScore: validateNumber(recordInput.riskScore, "riskScore", { min: 0, max: 100 }),
    readinessScore: validateNumber(recordInput.readinessScore, "readinessScore", { min: 0, max: 100 }),
    impactScore: validateNumber(recordInput.impactScore, "impactScore", { min: 0, max: 100 }),
    effectiveAt: validateDate(recordInput.effectiveAt, "effectiveAt"),
    dueAt: validateDate(recordInput.dueAt, "dueAt"),
    scheduledAt: validateDate(recordInput.scheduledAt, "scheduledAt"),
    completedAt: validateDate(recordInput.completedAt, "completedAt"),
    expiresAt: validateDate(recordInput.expiresAt, "expiresAt"),
    submittedAt: validateDate(recordInput.submittedAt, "submittedAt"),
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
    throw new ComplianceValidationError("sourceSystem is not supported", { sourceSystem });
  }
  return {
    tenantId: assertNonEmptyString(value.tenantId, "tenantId", 128),
    sourceSystem,
    sourceResourceType: assertNonEmptyString(value.sourceResourceType, "sourceResourceType", 160),
    sourceResourceId: assertNonEmptyString(value.sourceResourceId, "sourceResourceId", 180),
    complianceResourceType: assertNonEmptyString(value.complianceResourceType, "complianceResourceType", 160),
    complianceResourceId: assertNonEmptyString(value.complianceResourceId, "complianceResourceId", 180),
    countryCode: validateCountryCode(value.countryCode),
    metadata: optionalObject(value.metadata, "metadata")
  };
}
