import { GlobalAiAssuranceService } from "../../services/global-ai-assurance-safety-model-risk-management-platform/src/application/ai-assurance-service.mjs";

export function createRepositoryDouble() {
  return {
    records: [],
    events: [],
    references: [],
    audits: [],
    async saveAiAssuranceRecord(record, event) {
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
  const service = new GlobalAiAssuranceService({
    repository,
    clock: () => new Date("2026-06-30T12:00:00.000Z")
  });
  return { service, repository };
}

export function principal(overrides = {}) {
  return {
    tenantId: "tenant-global-ai-assurance",
    actorId: "ai-assurance-admin-1",
    subjectType: "user",
    roles: ["global-ai-assurance-admin"],
    permissions: ["global_ai_assurance.*"],
    countryCodes: ["KW", "SA"],
    ...overrides
  };
}

export function baseRecord(overrides = {}) {
  return {
    tenantId: "tenant-global-ai-assurance",
    status: "active",
    title: "Governed AI assurance record",
    description: "Auditable enterprise AI assurance, safety, model risk, prompt, agent, monitoring, incident, and regulatory governance workflow record",
    countryCode: "KW",
    regionCode: "KW-AH",
    jurisdictionCode: "KW-AI-GOV",
    organizationId: "org-panacea-kw",
    aiSystemId: "ai-system-001",
    aiUseCaseId: "ai-use-case-001",
    assuranceId: "assurance-001",
    riskClassificationId: "risk-classification-001",
    safetyAssessmentId: "safety-assessment-001",
    impactAssessmentId: "impact-assessment-001",
    modelId: "model-001",
    modelVersionId: "model-version-001",
    modelRiskId: "model-risk-001",
    validationId: "validation-001",
    limitationId: "limitation-001",
    testId: "test-001",
    testCaseId: "test-case-001",
    testReportId: "test-report-001",
    promptId: "prompt-001",
    promptVersionId: "prompt-version-001",
    agentId: "agent-001",
    agentVersionId: "agent-version-001",
    permissionReviewId: "permission-review-001",
    behaviorEvaluationId: "behavior-evaluation-001",
    runtimeApprovalId: "runtime-approval-001",
    monitoringId: "monitoring-001",
    recommendationMonitorId: "recommendation-monitor-001",
    driftMonitorId: "drift-monitor-001",
    biasMonitorId: "bias-monitor-001",
    hallucinationMonitorId: "hallucination-monitor-001",
    unsafeOutputMonitorId: "unsafe-output-monitor-001",
    performanceMonitorId: "performance-monitor-001",
    incidentId: "incident-001",
    investigationId: "investigation-001",
    correctiveActionId: "corrective-action-001",
    regulatoryRequirementId: "regulatory-requirement-001",
    complianceMappingId: "compliance-mapping-001",
    evidenceRepositoryId: "evidence-repository-001",
    auditPackageId: "audit-package-001",
    governanceDecisionId: "governance-decision-001",
    attestationId: "attestation-001",
    ownerId: "owner-001",
    approvalId: "approval-001",
    priority: "high",
    severity: "high",
    riskLevel: "high",
    riskScore: 71,
    safetyScore: 93,
    validationScore: 89,
    biasScore: 12,
    driftScore: 9,
    performanceScore: 91,
    readinessScore: 88,
    impactScore: 76,
    startedAt: "2026-07-01T12:00:00.000Z",
    completedAt: "2026-07-15T12:00:00.000Z",
    approvedAt: "2026-07-16T12:00:00.000Z",
    rejectedAt: "2026-07-17T12:00:00.000Z",
    retiredAt: "2027-07-01T12:00:00.000Z",
    detectedAt: "2026-07-02T12:00:00.000Z",
    closedAt: "2026-07-20T12:00:00.000Z",
    generatedAt: "2026-07-21T12:00:00.000Z",
    policyControls: {
      policyId: "ai-assurance-governance-policy",
      policyVersion: "3.0.0",
      policyApproved: true,
      humanApprovalRequired: true,
      auditPolicyApplied: true,
      aiGovernanceApplied: true,
      modelApprovalApplied: true,
      promptApprovalApplied: true,
      agentApprovalApplied: true,
      regulatoryAccessApplied: true,
      productionPromotionBlockedWithoutApproval: true,
      approvalReference: "ai-governance-board-approval-2026-06",
      governingBody: "Global AI Governance Review Board",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
      humanGovernanceRequired: true,
      policyControlled: true,
      auditRequired: true,
      tenantIsolationRequired: true,
      noClinicalDecisioning: true,
      aiGovernanceControlled: true,
      modelApprovalControlled: true,
      promptApprovalControlled: true,
      agentApprovalControlled: true,
      regulatoryAccessControlled: true,
      productionPromotionRequiresApproval: true,
      multiCountryGovernanceChecked: true,
      approvedCountries: ["KW", "SA"],
      governingAuthorityIds: ["ai-governance-board", "model-risk-board", "ai-safety-board"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      policyChecked: true,
      aiGovernanceVerified: true,
      modelApprovalVerified: true,
      promptApprovalVerified: true,
      agentApprovalVerified: true,
      regulatoryAccessVerified: true,
      productionPromotionApprovalRequired: true,
      assuranceOwnerAssigned: true,
      aiSystemInventoryVerified: true,
      riskClassificationReviewed: true,
      safetyAssessmentCompleted: true,
      assuranceReviewApproved: true,
      assuranceReviewReference: "assurance-review-001",
      modelOwnerAssigned: true,
      modelRiskReviewed: true,
      validationProtocolApproved: true,
      validationCompleted: true,
      validationReference: "validation-report-001",
      modelApprovalBoardReviewed: true,
      modelApprovalReference: "model-board-approval-001",
      retirementApproved: true,
      safetyTestOwnerAssigned: true,
      testProtocolApproved: true,
      clinicalSafetyReviewed: true,
      safetyTestCompleted: true,
      safetyTestReference: "safety-test-report-001",
      promptAgentOwnerAssigned: true,
      promptRiskReviewed: true,
      agentRiskReviewed: true,
      promptApprovalCompleted: true,
      promptApprovalReference: "prompt-approval-001",
      agentApprovalCompleted: true,
      agentApprovalReference: "agent-approval-001",
      agentPermissionReviewCompleted: true,
      monitoringOwnerAssigned: true,
      monitoringThresholdsApproved: true,
      unsafeOutputReviewRequired: true,
      driftBiasReviewRequired: true,
      incidentOwnerAssigned: true,
      incidentSeverityReviewed: true,
      investigationCompleted: true,
      incidentClosureApproved: true,
      incidentClosureReference: "incident-closure-001",
      aiRegulatoryMappingVerified: true,
      aiEvidenceRepositoryControlled: true,
      auditPackageReviewed: true,
      auditPackageReference: "audit-package-review-001",
      governanceDecisionRecorded: true
    },
    evidence: [
      {
        evidenceType: "ai_governance_approval",
        reference: "evidence://global-ai-assurance/approval/001",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "audit_service"
      }
    ],
    metrics: {
      safetyScore: 93,
      validationScore: 89
    },
    metadata: {
      source: "sprint_78_test"
    },
    ...overrides
  };
}
