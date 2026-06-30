import { GlobalCustomerSuccessService } from "../../services/global-customer-success-support-service-management-platform/src/application/customer-success-service.mjs";

export function createRepositoryDouble() {
  return {
    records: [],
    events: [],
    references: [],
    audits: [],
    async saveCustomerSuccessRecord(record, event) {
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
  const service = new GlobalCustomerSuccessService({
    repository,
    clock: () => new Date("2026-06-30T12:00:00.000Z")
  });
  return { service, repository };
}

export function principal(overrides = {}) {
  return {
    tenantId: "tenant-global-customer-success",
    actorId: "customer-success-admin-1",
    subjectType: "user",
    roles: ["global-customer-success-admin"],
    permissions: ["global_customer_success.*"],
    countryCodes: ["KW", "SA"],
    ...overrides
  };
}

export function baseRecord(overrides = {}) {
  return {
    tenantId: "tenant-global-customer-success",
    status: "active",
    title: "Governed customer success record",
    description: "Auditable enterprise customer success, support, and service management workflow record",
    countryCode: "KW",
    regionCode: "KW-AH",
    jurisdictionCode: "KW-COM",
    organizationId: "org-panacea-kw",
    accountId: "account-001",
    customerId: "customer-001",
    customerHealthScoreId: "health-score-001",
    successPlanId: "success-plan-001",
    milestoneId: "milestone-001",
    supportTicketId: "ticket-001",
    incidentId: "incident-001",
    problemId: "problem-001",
    changeId: "change-001",
    serviceRequestId: "service-request-001",
    knowledgeBaseArticleId: "kb-001",
    serviceCatalogId: "catalog-001",
    implementationProjectId: "implementation-001",
    onboardingId: "onboarding-001",
    communicationId: "communication-001",
    feedbackId: "feedback-001",
    surveyId: "survey-001",
    releaseId: "release-001",
    maintenanceWindowId: "maintenance-001",
    slaId: "sla-001",
    escalationId: "escalation-001",
    assignmentId: "assignment-001",
    supportAgentId: "agent-001",
    priority: "high",
    severity: "high",
    healthScore: 72,
    satisfactionScore: 91,
    adoptionScore: 84,
    dueAt: "2026-07-01T12:00:00.000Z",
    targetResolutionAt: "2026-07-01T18:00:00.000Z",
    resolvedAt: "2026-07-01T17:00:00.000Z",
    startAt: "2026-06-30T12:00:00.000Z",
    completedAt: "2026-07-02T12:00:00.000Z",
    policyControls: {
      policyId: "customer-success-governance-policy",
      policyVersion: "3.0.0",
      policyApproved: true,
      humanApprovalRequired: true,
      auditPolicyApplied: true,
      customerDataAccessApplied: true,
      supportRolePermissionApplied: true,
      sensitiveIncidentControlApplied: true,
      serviceManagementPolicyApplied: true,
      approvalReference: "board-approval-2026-06",
      governingBody: "Global Customer Success Governance Committee",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
      humanGovernanceRequired: true,
      policyControlled: true,
      auditRequired: true,
      tenantIsolationRequired: true,
      noClinicalDecisioning: true,
      customerDataAccessControlled: true,
      supportRolePermissionControlled: true,
      sensitiveIncidentControlled: true,
      multiCountryGovernanceChecked: true,
      approvedCountries: ["KW", "SA"],
      governingAuthorityIds: ["customer-success-board", "service-management-board"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      policyChecked: true,
      customerDataAccessVerified: true,
      supportRoleVerified: true,
      sensitiveIncidentControlsVerified: true,
      accountOwnerAssigned: true,
      customerSuccessPlanReviewed: true,
      healthScoreReviewed: true,
      healthScoreReference: "health-score-review-001",
      supportQueueAuthorized: true,
      slaPolicyChecked: true,
      priorityClassified: true,
      assignmentAuthorized: true,
      escalationApproved: true,
      escalationReference: "escalation-reference-001",
      resolutionValidated: true,
      resolutionReference: "resolution-reference-001",
      serviceManagementAuthorized: true,
      incidentImpactAssessed: true,
      changeApprovalReference: "change-approval-001",
      serviceRequestApproved: true,
      rootCauseDocumented: true,
      postIncidentReviewCompleted: true,
      implementationGovernanceApproved: true,
      onboardingOwnerAssigned: true,
      onboardingKickoffApproved: true,
      goLiveReadinessApproved: true,
      postGoLiveSupportAssigned: true,
      communicationApproved: true,
      communicationAudienceVerified: true,
      feedbackConsentVerified: true,
      analyticsDataGoverned: true,
      aggregationReviewed: true,
      piiSuppressionApplied: true
    },
    evidence: [
      {
        evidenceType: "governance_approval",
        reference: "evidence://customer-success/approval/001",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "audit_service"
      }
    ],
    metrics: {
      responseTimeHours: 2,
      slaCompliance: 99
    },
    metadata: {
      source: "sprint_75_test"
    },
    ...overrides
  };
}
