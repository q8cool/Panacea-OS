import { GlobalWorkforceService } from "../../services/global-workforce-hr-credentialing-staff-experience-platform/src/application/workforce-service.mjs";

export function createRepositoryDouble() {
  return {
    records: [],
    events: [],
    references: [],
    audits: [],
    async saveWorkforceRecord(record, event) {
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
  const service = new GlobalWorkforceService({
    repository,
    clock: () => new Date("2026-06-30T12:00:00.000Z")
  });
  return { service, repository };
}

export function principal(overrides = {}) {
  return {
    tenantId: "tenant-global-workforce",
    actorId: "hr-governance-officer-1",
    subjectType: "user",
    roles: ["global-workforce-admin"],
    permissions: ["global_workforce.*"],
    countryCodes: ["KW", "SA"],
    ...overrides
  };
}

export function baseRecord(overrides = {}) {
  return {
    tenantId: "tenant-global-workforce",
    status: "active",
    title: "Governed workforce record",
    description: "Auditable global workforce workflow record",
    countryCode: "KW",
    regionCode: "KW-AH",
    jurisdictionCode: "KW-MOH",
    facilityId: "facility-kuwait-1",
    departmentId: "department-emergency",
    staffId: "staff-001",
    employeeId: "employee-001",
    providerId: "provider-001",
    credentialId: "credential-001",
    licenseId: "license-001",
    certificationId: "certification-001",
    privilegeId: "privilege-001",
    shiftId: "shift-001",
    scheduleId: "schedule-001",
    leaveRequestId: "leave-001",
    trainingAssignmentId: "training-001",
    complianceRequirementId: "compliance-001",
    payrollReferenceId: "payroll-001",
    effectiveDate: "2026-07-01",
    expirationDate: "2027-07-01",
    reviewDueDate: "2026-12-01",
    scheduledStartAt: "2026-07-01T08:00:00.000Z",
    scheduledEndAt: "2026-07-01T16:00:00.000Z",
    fte: 1,
    hours: 8,
    costAmount: 250,
    currencyCode: "KWD",
    policyControls: {
      policyId: "workforce-governance-policy",
      policyVersion: "3.0.0",
      policyApproved: true,
      humanApprovalRequired: true,
      auditPolicyApplied: true,
      hrDataPrivacyApplied: true,
      credentialingAccessApplied: true,
      staffSelfServicePolicyApplied: true,
      approvalReference: "board-approval-2026-06",
      governingBody: "Global Workforce Governance Committee",
      effectiveDate: "2026-06-30",
      expiresAt: "2027-06-30"
    },
    governanceContext: {
      humanGovernanceRequired: true,
      policyControlled: true,
      auditRequired: true,
      tenantIsolationRequired: true,
      noClinicalDecisioning: true,
      hrDataPrivacyControlled: true,
      credentialingAccessControlled: true,
      staffSelfServicePermissionChecked: true,
      multiCountryGovernanceChecked: true,
      approvedCountries: ["KW", "SA"],
      governingAuthorityIds: ["kw-moh", "gcc-workforce-board"]
    },
    workflowControls: {
      auditEnabled: true,
      tenantIsolationVerified: true,
      humanReviewRequired: true,
      policyChecked: true,
      hrDataPrivacyVerified: true,
      staffRecordAuthorized: true,
      credentialingAccessVerified: true,
      primarySourceVerificationCompleted: true,
      credentialingCommitteeReviewCompleted: true,
      schedulingPolicyChecked: true,
      fatigueRiskChecked: true,
      coverageApproved: true,
      leavePolicyChecked: true,
      managerApprovalReference: "manager-approval-001",
      trainingRequirementMapped: true,
      complianceReviewed: true,
      hrWorkflowAuthorized: true
    },
    evidence: [
      {
        evidenceType: "governance_approval",
        reference: "evidence://workforce/approval/001",
        recordedAt: "2026-06-30T12:00:00.000Z",
        source: "audit_service"
      }
    ],
    metrics: {
      workflowLatencyHours: 2,
      complianceScore: 99
    },
    metadata: {
      source: "sprint_73_test"
    },
    ...overrides
  };
}
