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
    writeWorkflowProjections: [],
    async saveCommandRecord(record, event) {
      this.records.push(record);
      this.events.push(event);
    },
    async saveIntegrationReference(reference) {
      this.references.push(reference);
    },
    async saveWriteWorkflow(record, event, auditEntry, projections = []) {
      this.writeWorkflows.push(record);
      this.writeWorkflowEvents.push(event);
      for (const projection of projections) {
        const readIndex = this.readModels.findIndex((item) => item.id === projection.readModel.id);
        if (readIndex >= 0) this.readModels[readIndex] = projection.readModel;
        else this.readModels.push(projection.readModel);
        const projectionRecord = { ...projection, status: projection.projectionStatus };
        const projectionIndex = this.writeWorkflowProjections.findIndex((item) => (
          item.tenantId === projection.tenantId &&
          item.eventId === projection.eventId &&
          item.projectionTarget === projection.projectionTarget
        ));
        if (projectionIndex >= 0) this.writeWorkflowProjections[projectionIndex] = { ...projectionRecord, projectionStatus: "replayed", status: "replayed" };
        else this.writeWorkflowProjections.push(projectionRecord);
      }
      this.audits.push(auditEntry);
    },
    async listWriteWorkflowEvents({ tenantId, eventType, limit, offset }) {
      const filtered = this.writeWorkflowEvents.filter((event) => (
        event.tenantId === tenantId &&
        (!eventType || event.eventType === eventType)
      ));
      return {
        total: filtered.length,
        items: filtered.slice(offset, offset + limit).map((event) => {
          const workflow = this.writeWorkflows.find((record) => record.id === event.aggregateId);
          return {
            ...event,
            workflowGroup: workflow?.workflowGroup,
            workflowKey: workflow?.workflowKey,
            workflowStatus: workflow?.status,
            subjectId: workflow?.subjectId,
            title: workflow?.title,
            requestContext: workflow?.requestContext,
            projections: this.writeWorkflowProjections
              .filter((projection) => projection.tenantId === tenantId && projection.eventId === event.id)
              .map((projection) => ({
                id: projection.id,
                projectionTarget: projection.projectionTarget,
                readModelId: projection.readModelId,
                status: projection.projectionStatus,
                processedAt: projection.processedAt,
                failureReason: projection.failureReason,
                retryCount: projection.retryCount
              }))
          };
        })
      };
    },
    async listWriteWorkflowProjections({ tenantId, status, eventType, limit, offset }) {
      const filtered = this.writeWorkflowProjections.filter((projection) => (
        projection.tenantId === tenantId &&
        (!status || projection.projectionStatus === status) &&
        (!eventType || projection.eventType === eventType)
      ));
      return {
        total: filtered.length,
        items: filtered.slice(offset, offset + limit)
      };
    },
    async getWriteWorkflowProjection({ tenantId, projectionId }) {
      return this.writeWorkflowProjections.find((projection) => projection.tenantId === tenantId && projection.id === projectionId) ?? null;
    },
    async retryWriteWorkflowProjection(projection, auditEntry, replayedAt) {
      const targetReadModel = projection.payload.targetReadModel;
      const readIndex = this.readModels.findIndex((item) => item.id === targetReadModel.id);
      if (readIndex >= 0) this.readModels[readIndex] = { ...targetReadModel, updatedAt: replayedAt };
      else this.readModels.push({ ...targetReadModel, updatedAt: replayedAt });
      const index = this.writeWorkflowProjections.findIndex((item) => item.id === projection.id);
      const updated = {
        ...projection,
        projectionStatus: "replayed",
        status: "replayed",
        processedAt: replayedAt,
        failureReason: null,
        retryCount: projection.retryCount + 1,
        updatedBy: auditEntry.actorId,
        updatedAt: replayedAt
      };
      this.writeWorkflowProjections[index] = updated;
      this.audits.push(auditEntry);
      return updated;
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
