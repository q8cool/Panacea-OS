import { RealTimeGlobalCommandIntelligenceService } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/application/command-service.mjs";

export function createRepositoryDouble() {
  return {
    records: [],
    events: [],
    references: [],
    audits: [],
    readModels: [],
    writeWorkflows: [],
    writeWorkflowEvents: [],
    async saveCommandRecord(record, event) {
      this.records.push(record);
      this.events.push(event);
    },
    async saveIntegrationReference(reference) {
      this.references.push(reference);
    },
    async saveWriteWorkflow(record, event, auditEntry) {
      this.writeWorkflows.push(record);
      this.writeWorkflowEvents.push(event);
      this.audits.push(auditEntry);
    },
    async listReadModels({ tenantId, workspace, modelKey, subjectId, limit, offset }) {
      const filtered = this.readModels.filter((record) => (
        record.tenantId === tenantId &&
        record.workspace === workspace &&
        record.modelKey === modelKey &&
        (!subjectId || record.subjectId === subjectId)
      ));
      return {
        total: filtered.length,
        items: filtered.slice(offset, offset + limit)
      };
    },
    async saveAuditEntry(entry) {
      this.audits.push(entry);
    }
  };
}

export function createServiceWithRepository(repository = createRepositoryDouble()) {
  const service = new RealTimeGlobalCommandIntelligenceService({
    repository,
    clock: () => new Date("2026-06-30T12:00:00.000Z")
  });
  return { service, repository };
}

export function principal(overrides = {}) {
  return {
    tenantId: "tenant-global-command",
    actorId: "command-admin-1",
    subjectType: "user",
    roles: ["global-command-intelligence-admin"],
    permissions: ["global_command_intelligence.*"],
    countryCodes: ["KW", "SA"],
    regionCodes: ["GCC", "MENA"],
    ...overrides
  };
}

export function baseRecord(overrides = {}) {
  return {
    tenantId: "tenant-global-command",
    status: "active",
    title: "Governed real-time command intelligence record",
    description: "Auditable advisory command intelligence record for real-time global operations, alerts, crisis coordination, recommendations, and executive views",
    countryCode: "KW",
    regionCode: "GCC",
    jurisdictionCode: "KW-HEALTH-COMMAND",
    organizationId: "org-panacea-kw",
    commandCenterId: "command-center-001",
    commandEventId: "command-event-001",
    situationId: "situation-001",
    alertId: "alert-001",
    crisisEventId: "crisis-001",
    coordinationId: "coordination-001",
    recommendationId: "recommendation-001",
    briefingId: "briefing-001",
    facilityId: "facility-001",
    departmentId: "department-001",
    ownerId: "owner-001",
    approverId: "approver-001",
    priority: "high",
    riskLevel: "high",
    severity: "high",
    confidenceScore: 91,
    riskScore: 68,
    urgencyScore: 82,
    capacityImpactScore: 73,
    startedAt: "2026-07-01T12:00:00.000Z",
    updatedAtSignal: "2026-07-01T12:01:00.000Z",
    escalatedAt: "2026-07-01T12:05:00.000Z",
    resolvedAt: "2026-07-01T13:00:00.000Z",
    generatedAt: "2026-07-01T12:02:00.000Z",
    policyControls: {
      policyId: "v4-global-command-policy",
      policyVersion: "4.0.0",
      policyApproved: true,
      humanApprovalRequired: true,
      governanceApprovalRequired: true,
      clinicalApprovalProtected: true,
      auditPolicyApplied: true,
      tenantIsolationApplied: true,
      regionalGovernanceApplied: true,
      countryPolicyApplied: true,
      emergencyAccessGoverned: true,
      autonomousExecutionBlocked: true,
      approvalReference: "global-command-board-approval-001",
      governingBody: "Global Healthcare Command Governance Board",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
      advisoryOnly: true,
      noAutonomousDiagnosis: true,
      noAutonomousTreatment: true,
      noAutonomousEmergencyEnforcement: true,
      clinicianApprovalProtected: true,
      governanceApprovalEnforced: true,
      explainabilityRequired: true,
      auditRequired: true,
      tenantIsolationRequired: true,
      multiCountryGovernanceChecked: true,
      regionalPolicyChecked: true,
      countryPolicyChecked: true,
      approvedCountries: ["KW", "SA"],
      approvedRegions: ["GCC", "MENA"],
      governingAuthorityIds: ["global-command-board", "regional-operations-board"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      governanceApprovalRequired: true,
      policyChecked: true,
      explainabilityEnabled: true,
      autonomousExecutionPrevented: true,
      notificationPolicyApplied: true,
      commandScopeVerified: true,
      situationAwarenessValidated: true,
      timelineEventSequenced: true,
      realTimeSignalValidated: true,
      operationalSourceVerified: true,
      capacityImpactReviewed: true,
      alertSourceVerified: true,
      alertReviewRequired: true,
      alertCorrelationReviewed: true,
      escalationApproved: true,
      suppressionRuleApproved: true,
      resolutionEvidenceCaptured: true,
      crisisAuthorityVerified: true,
      emergencyAccessGoverned: true,
      crossBoundaryCoordinationApproved: true,
      emergencyWorkflowApproved: true,
      massCasualtyGovernanceChecked: true,
      recommendationIsAdvisory: true,
      recommendationExplainabilityCaptured: true,
      noAutonomousExecution: true,
      governanceReviewQueued: true,
      executiveViewApproved: true,
      kpiSourceVerified: true,
      riskSummaryReviewed: true,
      briefingReviewed: true
    },
    evidence: [
      {
        evidenceType: "command_governance_approval",
        reference: "evidence://global-command/governance/001",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "audit_service"
      }
    ],
    metrics: {
      confidenceScore: 91,
      urgencyScore: 82
    },
    metadata: {
      source: "sprint_85_test"
    },
    ...overrides
  };
}

export function baseWriteWorkflow(overrides = {}) {
  return {
    tenantId: "tenant-global-command",
    title: "Live governed write workflow",
    subjectId: "subject-001",
    reason: "Operator-approved transactional validation",
    idempotencyKey: "write-workflow-validation-001",
    payload: {
      detail: "Tenant-scoped live write workflow validation",
      source: "sprint_113_validation"
    },
    workflowControls: {
      liveMode: true,
      demoData: false,
      auditRequired: true,
      tenantIsolationConfirmed: true,
      humanUserConfirmed: true,
      noAutonomousDiagnosis: true,
      noAutonomousTreatment: true,
      noAiGeneratedClinicalDecision: true,
      patientClinicalRecordModificationBlocked: true,
      documentedMedicationSafetyRulesApplied: true,
      sourceBoundary: "foundation-authenticated-live-workflow"
    },
    requestContext: {
      channel: "test"
    },
    ...overrides
  };
}
