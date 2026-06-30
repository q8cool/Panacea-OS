import { GlobalComplianceService } from "../../services/global-compliance-automation-regulatory-intelligence-platform/src/application/compliance-service.mjs";

export function createRepositoryDouble() {
  return {
    records: [],
    events: [],
    references: [],
    audits: [],
    async saveComplianceRecord(record, event) {
      this.records.push(record);
      this.events.push(event);
    },
    async saveIntegrationReference(reference) {
      this.references.push(reference);
    },
    async saveAuditEntry(entry) {
      this.audits.push(entry);
    }
  };
}

export function createServiceWithRepository(repository = createRepositoryDouble()) {
  const service = new GlobalComplianceService({
    repository,
    clock: () => new Date("2026-06-30T12:00:00.000Z")
  });
  return { service, repository };
}

export function principal(overrides = {}) {
  return {
    tenantId: "tenant-global-compliance",
    actorId: "compliance-admin-1",
    subjectType: "user",
    roles: ["global-compliance-admin"],
    permissions: ["global_compliance.*"],
    countryCodes: ["KW", "SA"],
    ...overrides
  };
}

export function baseRecord(overrides = {}) {
  return {
    tenantId: "tenant-global-compliance",
    status: "active",
    title: "Governed compliance automation record",
    description: "Auditable enterprise compliance automation, regulatory intelligence, audit, certification, policy, and reporting workflow record",
    countryCode: "KW",
    regionCode: "KW-AH",
    jurisdictionCode: "KW-COMPLIANCE",
    organizationId: "org-panacea-kw",
    frameworkId: "framework-001",
    regulationId: "regulation-001",
    requirementId: "requirement-001",
    changeId: "change-001",
    impactAssessmentId: "impact-001",
    calendarId: "calendar-001",
    ruleId: "rule-001",
    checklistId: "checklist-001",
    evidenceId: "evidence-001",
    gapId: "gap-001",
    remediationId: "remediation-001",
    dashboardId: "dashboard-001",
    auditPlanId: "audit-plan-001",
    auditScheduleId: "audit-schedule-001",
    auditScopeId: "audit-scope-001",
    auditFindingId: "audit-finding-001",
    correctiveActionPlanId: "cap-001",
    certificationId: "certification-001",
    certificationRequirementId: "cert-requirement-001",
    policyId: "policy-001",
    attestationId: "attestation-001",
    exceptionId: "exception-001",
    violationId: "violation-001",
    reviewId: "review-001",
    reportTemplateId: "report-template-001",
    reportId: "report-001",
    submissionId: "submission-001",
    correspondenceId: "correspondence-001",
    ownerId: "owner-001",
    approvalId: "approval-001",
    priority: "high",
    severity: "high",
    complianceScore: 91,
    riskScore: 21,
    readinessScore: 86,
    impactScore: 78,
    effectiveAt: "2026-07-01T12:00:00.000Z",
    dueAt: "2026-07-15T12:00:00.000Z",
    scheduledAt: "2026-07-03T12:00:00.000Z",
    completedAt: "2026-07-20T12:00:00.000Z",
    expiresAt: "2027-06-30T12:00:00.000Z",
    submittedAt: "2026-07-21T12:00:00.000Z",
    policyControls: {
      policyId: "compliance-automation-governance-policy",
      policyVersion: "3.0.0",
      policyApproved: true,
      humanApprovalRequired: true,
      auditPolicyApplied: true,
      complianceRolePermissionApplied: true,
      regulatoryAccessControlApplied: true,
      evidenceRepositoryAccessApplied: true,
      policyControlledAutomationApplied: true,
      approvalReference: "compliance-board-approval-2026-06",
      governingBody: "Global Compliance Governance Committee",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
      humanGovernanceRequired: true,
      policyControlled: true,
      auditRequired: true,
      tenantIsolationRequired: true,
      noClinicalDecisioning: true,
      complianceRoleControlled: true,
      regulatoryAccessControlled: true,
      evidenceRepositoryAccessControlled: true,
      multiCountryGovernanceChecked: true,
      approvedCountries: ["KW", "SA"],
      governingAuthorityIds: ["compliance-board", "regulatory-board", "audit-board"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      policyChecked: true,
      complianceRoleVerified: true,
      regulatoryAccessVerified: true,
      evidenceRepositoryAccessVerified: true,
      regulatoryOwnerAssigned: true,
      regulatoryMappingVerified: true,
      regulatoryChangeReviewed: true,
      regulatoryChangeReference: "regulatory-change-review-001",
      impactAssessmentApproved: true,
      complianceRuleReviewed: true,
      checklistGoverned: true,
      evidenceValidationCompleted: true,
      gapReviewCompleted: true,
      gapReference: "gap-review-001",
      remediationApproved: true,
      remediationReference: "remediation-approval-001",
      auditOwnerAssigned: true,
      auditScopeApproved: true,
      findingReviewCompleted: true,
      auditClosureApproved: true,
      auditClosureReference: "audit-closure-001",
      correctiveActionPlanApproved: true,
      certificationOwnerAssigned: true,
      certificationRequirementVerified: true,
      expirationAlertReviewed: true,
      renewalPlanApproved: true,
      policyMappingVerified: true,
      attestationGoverned: true,
      exceptionApproved: true,
      violationReviewCompleted: true,
      violationReference: "violation-review-001",
      complianceReviewApproved: true,
      reportTemplateApproved: true,
      reportingAuthorityVerified: true,
      reportGenerationValidated: true,
      reportSubmissionApproved: true,
      reportApprovalCompleted: true,
      reportApprovalReference: "report-approval-001"
    },
    evidence: [
      {
        evidenceType: "governance_approval",
        reference: "evidence://global-compliance/approval/001",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "audit_service"
      }
    ],
    metrics: {
      complianceScore: 91,
      readinessScore: 86
    },
    metadata: {
      source: "sprint_77_test"
    },
    ...overrides
  };
}
