import { AutonomousHealthcareIntelligenceService } from "../../services/autonomous-healthcare-intelligence-foundation/src/application/intelligence-service.mjs";

export function createRepositoryDouble() {
  return {
    records: [],
    events: [],
    references: [],
    audits: [],
    async saveIntelligenceRecord(record, event) {
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
  const service = new AutonomousHealthcareIntelligenceService({
    repository,
    clock: () => new Date("2026-06-30T12:00:00.000Z")
  });
  return { service, repository };
}

export function principal(overrides = {}) {
  return {
    tenantId: "tenant-autonomous-intelligence",
    actorId: "intelligence-governance-admin-1",
    subjectType: "user",
    roles: ["autonomous-intelligence-governance-admin"],
    permissions: ["autonomous_intelligence.*"],
    countryCodes: ["KW", "SA"],
    ...overrides
  };
}

export function baseRecord(overrides = {}) {
  return {
    tenantId: "tenant-autonomous-intelligence",
    status: "active",
    title: "Governed advisory intelligence record",
    description: "Auditable advisory intelligence governance record with clinician approval, safety controls, traceability, and policy enforcement",
    countryCode: "KW",
    regionCode: "KW-AH",
    jurisdictionCode: "KW-HEALTH-AI",
    organizationId: "org-panacea-kw",
    intelligenceId: "intelligence-001",
    capabilityId: "capability-001",
    policyId: "policy-001",
    runtimeGovernanceId: "runtime-governance-001",
    safetyLayerId: "safety-layer-001",
    approvalWorkflowId: "approval-workflow-001",
    recommendationId: "recommendation-001",
    reviewRuleId: "review-rule-001",
    escalationRuleId: "escalation-rule-001",
    overrideId: "override-001",
    orchestratorId: "orchestrator-001",
    contextBrokerId: "context-broker-001",
    eventRouterId: "event-router-001",
    decisionRegistryId: "decision-registry-001",
    workflowControllerId: "workflow-controller-001",
    traceId: "trace-001",
    evidenceTraceId: "evidence-trace-001",
    approvalTraceId: "approval-trace-001",
    auditPackageId: "audit-package-001",
    emergencyStopId: "emergency-stop-001",
    ownerId: "owner-001",
    approverId: "approver-001",
    priority: "high",
    riskLevel: "high",
    riskScore: 72,
    safetyScore: 96,
    governanceScore: 94,
    traceabilityScore: 95,
    startedAt: "2026-07-01T12:00:00.000Z",
    completedAt: "2026-07-02T12:00:00.000Z",
    approvedAt: "2026-07-03T12:00:00.000Z",
    blockedAt: "2026-07-04T12:00:00.000Z",
    stoppedAt: "2026-07-05T12:00:00.000Z",
    policyControls: {
      policyId: "v4-autonomous-intelligence-policy",
      policyVersion: "4.0.0",
      policyApproved: true,
      humanApprovalRequired: true,
      clinicianApprovalRequired: true,
      auditPolicyApplied: true,
      tenantIsolationApplied: true,
      aiGovernanceApplied: true,
      clinicalApprovalApplied: true,
      emergencyStopAuthorized: true,
      autonomousActionBlocked: true,
      approvalReference: "v4-governance-board-approval-001",
      governingBody: "Panacea Global Intelligence Governance Board",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
      advisoryOnly: true,
      noAutonomousDiagnosis: true,
      noAutonomousTreatment: true,
      clinicianApprovalEnforced: true,
      explainabilityRequired: true,
      auditRequired: true,
      tenantIsolationRequired: true,
      multiCountryGovernanceChecked: true,
      privacyConsentChecked: true,
      approvedCountries: ["KW", "SA"],
      governingAuthorityIds: ["global-intelligence-board", "clinical-safety-board"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      policyChecked: true,
      aiGovernanceVerified: true,
      clinicalApprovalVerified: true,
      autonomousActionPreventionEnabled: true,
      unsafeRecommendationBlockingEnabled: true,
      traceabilityEnabled: true,
      emergencyStopAvailable: true,
      capabilityOwnerAssigned: true,
      riskClassificationReviewed: true,
      runtimeGovernanceApproved: true,
      approvalWorkflowConfigured: true,
      clinicalReviewRuleApproved: true,
      humanApprovalRuleEnforced: true,
      recommendationLifecycleTracked: true,
      safetyEscalationConfigured: true,
      overrideRequiresReason: true,
      governanceWorkflowStarted: true,
      governanceCompletionApproved: true,
      governanceApprovalReference: "recommendation-governance-approval-001",
      platformBoundaryVerified: true,
      contextBrokerPolicyChecked: true,
      eventRouterAuditable: true,
      decisionRegistryControlled: true,
      workflowControllerApproved: true,
      preventionActive: true,
      unsafeRecommendationBlockingActive: true,
      humanInLoopEnforced: true,
      safetyGuardrailsActive: true,
      policyViolationDetectionActive: true,
      emergencyStopTested: true,
      traceCreated: true,
      evidenceLinked: true,
      policyTraceLinked: true,
      approvalTraceLinked: true,
      governanceAuditPackageReviewed: true
    },
    evidence: [
      {
        evidenceType: "governance_approval",
        reference: "evidence://autonomous-intelligence/governance/001",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "audit_service"
      }
    ],
    metrics: {
      safetyScore: 96,
      traceabilityScore: 95
    },
    metadata: {
      source: "sprint_84_test"
    },
    ...overrides
  };
}
