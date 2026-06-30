import { GlobalPrivacyService } from "../../services/global-enterprise-data-privacy-consent-trust-platform/src/application/privacy-service.mjs";

export function createRepositoryDouble() {
  return {
    records: [],
    events: [],
    references: [],
    audits: [],
    async savePrivacyRecord(record, event) {
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
  const service = new GlobalPrivacyService({
    repository,
    clock: () => new Date("2026-06-30T12:00:00.000Z")
  });
  return { service, repository };
}

export function principal(overrides = {}) {
  return {
    tenantId: "tenant-global-privacy",
    actorId: "privacy-admin-1",
    subjectType: "user",
    roles: ["global-privacy-admin"],
    permissions: ["global_privacy.*"],
    countryCodes: ["KW", "SA"],
    ...overrides
  };
}

export function baseRecord(overrides = {}) {
  return {
    tenantId: "tenant-global-privacy",
    status: "active",
    title: "Governed privacy record",
    description: "Auditable privacy, consent, data rights, policy, sharing, trust, and monitoring workflow record",
    countryCode: "KW",
    regionCode: "KW-AH",
    jurisdictionCode: "KW-PRIVACY",
    organizationId: "org-panacea-kw",
    dataSubjectId: "data-subject-001",
    patientId: "patient-001",
    consentId: "consent-001",
    consentVersionId: "consent-version-001",
    consentScopeId: "consent-scope-001",
    dataRightsRequestId: "data-rights-request-001",
    privacyPolicyId: "privacy-policy-001",
    purposeId: "care-coordination-purpose",
    minimizationRuleId: "minimization-rule-001",
    retentionPolicyId: "retention-policy-001",
    privacyExceptionId: "privacy-exception-001",
    sharingAgreementId: "sharing-agreement-001",
    sharingPurposeId: "sharing-purpose-001",
    sharingApprovalId: "sharing-approval-001",
    sourceOrganizationId: "org-panacea-kw",
    recipientOrganizationId: "org-partner-sa",
    trustRelationshipId: "trust-relationship-001",
    trustProfileId: "trust-profile-001",
    dataProcessorId: "processor-001",
    dataControllerId: "controller-001",
    trustedPartnerId: "trusted-partner-001",
    verificationId: "verification-001",
    monitoringId: "monitoring-001",
    violationId: "violation-001",
    privacyIncidentId: "privacy-incident-001",
    riskAssessmentId: "privacy-risk-001",
    ownerId: "privacy-owner-001",
    reviewerId: "privacy-reviewer-001",
    approvalId: "privacy-approval-001",
    priority: "high",
    severity: "high",
    riskLevel: "high",
    riskScore: 64,
    complianceScore: 94,
    consentCoverageScore: 97,
    trustScore: 91,
    fulfillmentScore: 88,
    startedAt: "2026-07-01T12:00:00.000Z",
    completedAt: "2026-07-15T12:00:00.000Z",
    approvedAt: "2026-07-16T12:00:00.000Z",
    requestedAt: "2026-07-02T12:00:00.000Z",
    fulfilledAt: "2026-07-10T12:00:00.000Z",
    withdrawnAt: "2026-07-18T12:00:00.000Z",
    expiresAt: "2027-07-01T12:00:00.000Z",
    detectedAt: "2026-07-04T12:00:00.000Z",
    closedAt: "2026-07-20T12:00:00.000Z",
    generatedAt: "2026-07-21T12:00:00.000Z",
    policyControls: {
      policyId: "global-privacy-governance-policy",
      policyVersion: "3.0.0",
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
      approvalReference: "privacy-board-approval-2026-06",
      governingBody: "Global Privacy Governance Board",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
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
      approvedCountries: ["KW", "SA"],
      governingAuthorityIds: ["privacy-board", "data-protection-office"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      policyChecked: true,
      consentChecked: true,
      purposeAccessVerified: true,
      dataResidencyVerified: true,
      crossBorderPolicyVerified: true,
      dataMinimizationVerified: true,
      noExternalExposureVerified: true,
      consentOwnerAssigned: true,
      consentScopeDefined: true,
      withdrawalVerified: true,
      withdrawalReference: "withdrawal-review-001",
      expirationChecked: true,
      scopeApproved: true,
      scopeApprovalReference: "scope-approval-001",
      requestOwnerAssigned: true,
      identityVerified: true,
      legalBasisReviewed: true,
      fulfillmentTracked: true,
      legalDeletionPermitted: true,
      legalDeletionReference: "legal-deletion-approval-001",
      exportCompleted: true,
      exportPackageReference: "export-package-001",
      policyOwnerAssigned: true,
      policyRuleApproved: true,
      purposeAccessControlVerified: true,
      retentionPolicyVerified: true,
      exceptionApproved: true,
      exceptionApprovalReference: "exception-approval-001",
      sharingOwnerAssigned: true,
      sharingPurposeApproved: true,
      recipientTrustVerified: true,
      agreementApproved: true,
      crossBorderApprovalReference: "cross-border-approval-001",
      researchApprovalReference: "research-sharing-approval-001",
      aiDataUseApprovalReference: "ai-data-use-approval-001",
      trustOwnerAssigned: true,
      trustVerificationCompleted: true,
      expirationNoticeSent: true,
      monitoringOwnerAssigned: true,
      monitoringThresholdsApproved: true,
      violationReviewed: true,
      violationReviewReference: "violation-review-001",
      incidentOwnerAssigned: true,
      incidentSeverityReviewed: true
    },
    evidence: [
      {
        evidenceType: "privacy_governance_approval",
        reference: "evidence://global-privacy/approval/001",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "audit_service"
      }
    ],
    metrics: {
      complianceScore: 94,
      consentCoverageScore: 97
    },
    metadata: {
      source: "sprint_79_test"
    },
    ...overrides
  };
}
