import { GlobalLegalService } from "../../services/global-legal-contracting-risk-governance-platform/src/application/legal-service.mjs";

export function createRepositoryDouble() {
  return {
    records: [],
    events: [],
    references: [],
    audits: [],
    async saveLegalRecord(record, event) {
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
  const service = new GlobalLegalService({
    repository,
    clock: () => new Date("2026-06-30T12:00:00.000Z")
  });
  return { service, repository };
}

export function principal(overrides = {}) {
  return {
    tenantId: "tenant-global-legal",
    actorId: "legal-governance-officer-1",
    subjectType: "user",
    roles: ["global-legal-admin"],
    permissions: ["global_legal.*"],
    countryCodes: ["KW", "SA"],
    ...overrides
  };
}

export function baseRecord(overrides = {}) {
  return {
    tenantId: "tenant-global-legal",
    status: "active",
    title: "Governed legal governance record",
    description: "Auditable enterprise legal, contracting, risk, and governance workflow record",
    countryCode: "KW",
    regionCode: "KW-AH",
    jurisdictionCode: "KW-MOJ",
    organizationId: "org-panacea-kw",
    facilityId: "facility-kuwait-1",
    departmentId: "department-governance",
    legalMatterId: "matter-001",
    legalCaseId: "case-001",
    legalDocumentId: "document-001",
    contractId: "contract-001",
    contractTemplateId: "template-001",
    contractObligationId: "obligation-001",
    vendorId: "vendor-001",
    insuranceProviderId: "insurer-001",
    employeeId: "employee-001",
    clinicalServiceId: "clinical-service-001",
    riskId: "risk-001",
    mitigationPlanId: "mitigation-001",
    boardId: "board-001",
    committeeId: "committee-001",
    meetingId: "meeting-001",
    decisionId: "decision-001",
    policyId: "policy-001",
    policyVersionId: "policy-version-001",
    regulatoryObligationId: "regulatory-obligation-001",
    regulatorySubmissionId: "regulatory-submission-001",
    evidenceRepositoryId: "evidence-repository-001",
    effectiveDate: "2026-07-01",
    expirationDate: "2027-07-01",
    reviewDueDate: "2026-12-01",
    submittedAt: "2026-06-30T10:00:00.000Z",
    approvedAt: "2026-06-30T11:00:00.000Z",
    riskScore: 72,
    riskLevel: "high",
    amount: 50000,
    currencyCode: "KWD",
    policyControls: {
      policyId: "legal-governance-policy",
      policyVersion: "3.0.0",
      policyApproved: true,
      humanApprovalRequired: true,
      auditPolicyApplied: true,
      legalDataPrivacyApplied: true,
      contractAccessApplied: true,
      governanceAccessApplied: true,
      regulatoryAccessApplied: true,
      approvalReference: "board-approval-2026-06",
      governingBody: "Global Legal Governance Committee",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
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
      approvedCountries: ["KW", "SA"],
      governingAuthorityIds: ["kw-moj", "enterprise-board"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      policyChecked: true,
      legalDataPrivacyVerified: true,
      contractAccessVerified: true,
      governanceAccessVerified: true,
      regulatoryAccessVerified: true,
      legalReviewCompleted: true,
      legalReviewReference: "legal-review-001",
      legalApprovalCompleted: true,
      legalApprovalReference: "legal-approval-001",
      contractLifecycleControlled: true,
      contractLifecycleReference: "contract-lifecycle-001",
      contractApproved: true,
      contractApprovalReference: "contract-approval-001",
      expirationMonitored: true,
      renewalOwner: "contract-owner-001",
      riskAssessed: true,
      riskOwner: "risk-owner-001",
      mitigationApproved: true,
      mitigationReference: "mitigation-reference-001",
      governanceBodyVerified: true,
      decisionTraceabilityEnabled: true,
      governanceReference: "governance-reference-001",
      policyOwnerVerified: true,
      policyVersionControlled: true,
      policyReference: "policy-reference-001",
      policyApprovedForPublication: true,
      attestationTracked: true,
      regulatoryObligationMapped: true,
      evidenceLinked: true,
      regulatoryReference: "regulatory-reference-001",
      submissionAuthorized: true,
      submissionReference: "submission-reference-001"
    },
    evidence: [
      {
        evidenceType: "governance_approval",
        reference: "evidence://legal/approval/001",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "audit_service"
      }
    ],
    metrics: {
      reviewLatencyHours: 4,
      complianceScore: 98
    },
    metadata: {
      source: "sprint_74_test"
    },
    ...overrides
  };
}
