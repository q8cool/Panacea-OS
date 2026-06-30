import { GlobalProductManagementService } from "../../services/global-product-management-roadmap-innovation-portfolio-platform/src/application/product-management-service.mjs";

export function createRepositoryDouble() {
  return {
    records: [],
    events: [],
    references: [],
    audits: [],
    async saveProductManagementRecord(record, event) {
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
  const service = new GlobalProductManagementService({
    repository,
    clock: () => new Date("2026-06-30T12:00:00.000Z")
  });
  return { service, repository };
}

export function principal(overrides = {}) {
  return {
    tenantId: "tenant-global-product",
    actorId: "product-governance-admin-1",
    subjectType: "user",
    roles: ["global-product-governance-admin"],
    permissions: ["global_product_management.*"],
    countryCodes: ["KW", "SA"],
    ...overrides
  };
}

export function baseRecord(overrides = {}) {
  return {
    tenantId: "tenant-global-product",
    status: "active",
    title: "Governed product management record",
    description: "Auditable enterprise product management, roadmap, innovation, requirements, feedback, and release governance workflow record",
    countryCode: "KW",
    regionCode: "KW-AH",
    jurisdictionCode: "KW-PRODUCT",
    organizationId: "org-panacea-kw",
    productId: "product-panacea-os",
    moduleId: "module-product-governance",
    capabilityId: "capability-roadmap",
    featureId: "feature-001",
    dependencyId: "dependency-001",
    roadmapId: "roadmap-v3",
    versionId: "version-3.0",
    releaseId: "release-3.0-ga",
    milestoneId: "milestone-076",
    sprintId: "sprint-076",
    innovationIdeaId: "innovation-idea-001",
    experimentId: "experiment-001",
    requirementId: "requirement-001",
    traceabilityId: "traceability-001",
    feedbackId: "feedback-001",
    customerId: "customer-001",
    clinicianId: "clinician-001",
    patientId: "patient-001",
    releaseCandidateId: "rc-3.0-001",
    ownerId: "owner-001",
    approvalId: "approval-001",
    priority: "high",
    impactScore: 88,
    effortScore: 34,
    valueScore: 92,
    riskScore: 22,
    coveragePercent: 96,
    plannedStartAt: "2026-07-01T12:00:00.000Z",
    plannedEndAt: "2026-08-01T12:00:00.000Z",
    approvedAt: "2026-06-30T12:00:00.000Z",
    completedAt: "2026-08-02T12:00:00.000Z",
    policyControls: {
      policyId: "product-governance-policy",
      policyVersion: "3.0.0",
      policyApproved: true,
      humanApprovalRequired: true,
      auditPolicyApplied: true,
      productGovernanceApplied: true,
      roadmapApprovalApplied: true,
      innovationReviewApplied: true,
      releaseGovernanceApplied: true,
      approvalReference: "product-board-approval-2026-06",
      governingBody: "Global Product Governance Committee",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
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
      approvedCountries: ["KW", "SA"],
      governingAuthorityIds: ["product-board", "roadmap-board", "innovation-board"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      policyChecked: true,
      productGovernanceVerified: true,
      roadmapApprovalVerified: true,
      innovationReviewVerified: true,
      productOwnerAssigned: true,
      featureOwnershipVerified: true,
      featureApprovalCompleted: true,
      featureApprovalReference: "feature-approval-001",
      roadmapOwnerAssigned: true,
      dependencyReviewCompleted: true,
      roadmapApprovalCompleted: true,
      roadmapApprovalReference: "roadmap-approval-001",
      milestoneCompletionVerified: true,
      innovationReviewCompleted: true,
      innovationScoringCompleted: true,
      innovationApprovalCompleted: true,
      innovationApprovalReference: "innovation-approval-001",
      experimentGovernanceApproved: true,
      requirementOwnerAssigned: true,
      traceabilityVerified: true,
      requirementApprovalCompleted: true,
      changeControlApproved: true,
      feedbackConsentOrSourceVerified: true,
      feedbackTriageCompleted: true,
      roadmapLinkageVerified: true,
      releaseGovernanceVerified: true,
      releaseRiskAssessed: true,
      releaseApprovalCompleted: true,
      releaseApprovalReference: "release-approval-001",
      readinessChecklistVerified: true
    },
    evidence: [
      {
        evidenceType: "governance_approval",
        reference: "evidence://product-management/approval/001",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "audit_service"
      }
    ],
    metrics: {
      roadmapCoveragePercent: 96,
      innovationValueScore: 92
    },
    metadata: {
      source: "sprint_76_test"
    },
    ...overrides
  };
}
