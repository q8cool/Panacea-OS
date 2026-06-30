export const SERVICE_NAME = "global-legal-contracting-risk-governance-platform";
export const API_VERSION = "v3";
export const API_BASE_PATH = "/api/v3/global-legal-governance";

export const recordGroups = Object.freeze({
  legalManagement: "legal_management",
  contractManagement: "contract_management",
  enterpriseRiskManagement: "enterprise_risk_management",
  governance: "governance",
  policyManagement: "policy_management",
  complianceRegulatory: "compliance_regulatory"
});

export const legalManagementTypes = Object.freeze([
  "legal_matter_registry",
  "legal_case_management",
  "legal_document_registry",
  "legal_review_workflow",
  "legal_approval_workflow",
  "legal_risk_register",
  "legal_calendar",
  "legal_audit_trail"
]);

export const contractManagementTypes = Object.freeze([
  "contract_registry",
  "contract_template",
  "contract_drafting_workflow",
  "contract_review_workflow",
  "contract_approval_workflow",
  "contract_renewal_tracking",
  "contract_expiration_tracking",
  "contract_obligation_tracking",
  "vendor_contract_management",
  "insurance_contract_management",
  "employment_contract_management",
  "clinical_service_contract_management"
]);

export const enterpriseRiskManagementTypes = Object.freeze([
  "enterprise_risk_register",
  "clinical_risk_register",
  "operational_risk_register",
  "financial_risk_register",
  "legal_risk_register",
  "cybersecurity_risk_register",
  "risk_scoring",
  "risk_mitigation_plan",
  "risk_review_workflow",
  "risk_dashboard"
]);

export const governanceTypes = Object.freeze([
  "board_governance_registry",
  "committee_management",
  "meeting_management",
  "agenda_management",
  "minutes_management",
  "decision_registry",
  "policy_approval_workflow",
  "governance_audit"
]);

export const policyManagementTypes = Object.freeze([
  "policy_registry",
  "policy_versioning",
  "policy_review",
  "policy_approval",
  "policy_publication",
  "policy_attestation",
  "policy_exception_workflow",
  "policy_compliance_tracking"
]);

export const complianceRegulatoryTypes = Object.freeze([
  "regulatory_obligation_registry",
  "regulatory_calendar",
  "compliance_task_management",
  "regulatory_submission_tracking",
  "evidence_repository",
  "compliance_review_workflow",
  "regulatory_risk_dashboard"
]);

export const recordTypesByGroup = Object.freeze({
  [recordGroups.legalManagement]: legalManagementTypes,
  [recordGroups.contractManagement]: contractManagementTypes,
  [recordGroups.enterpriseRiskManagement]: enterpriseRiskManagementTypes,
  [recordGroups.governance]: governanceTypes,
  [recordGroups.policyManagement]: policyManagementTypes,
  [recordGroups.complianceRegulatory]: complianceRegulatoryTypes
});

export const legalStatuses = Object.freeze([
  "draft",
  "registered",
  "active",
  "open",
  "under_review",
  "reviewed",
  "approved",
  "published",
  "attested",
  "submitted",
  "recorded",
  "scored",
  "mitigated",
  "expiring",
  "expired",
  "completed",
  "compliant",
  "non_compliant",
  "closed",
  "updated"
]);

export const integrationSources = Object.freeze([
  "foundation_platform",
  "security_platform",
  "compliance_platform",
  "quality_platform",
  "workforce_platform",
  "supply_chain_platform",
  "revenue_cycle_platform",
  "enterprise_platform",
  "audit_service",
  "notification_service"
]);

export const requiredEvents = Object.freeze([
  "legal.matter.created",
  "contract.created",
  "contract.approved",
  "contract.expiring",
  "risk.created",
  "risk.mitigated",
  "policy.created",
  "policy.approved",
  "policy.published",
  "governance.decision.recorded",
  "regulatory.obligation.updated"
]);

export const permissions = Object.freeze({
  legalWrite: "global_legal.legal.write",
  contractWrite: "global_legal.contract.write",
  riskWrite: "global_legal.risk.write",
  governanceWrite: "global_legal.governance.write",
  policyWrite: "global_legal.policy.write",
  regulatoryWrite: "global_legal.regulatory.write",
  integrationWrite: "global_legal.integration.write"
});

export const permissionsByGroup = Object.freeze({
  [recordGroups.legalManagement]: permissions.legalWrite,
  [recordGroups.contractManagement]: permissions.contractWrite,
  [recordGroups.enterpriseRiskManagement]: permissions.riskWrite,
  [recordGroups.governance]: permissions.governanceWrite,
  [recordGroups.policyManagement]: permissions.policyWrite,
  [recordGroups.complianceRegulatory]: permissions.regulatoryWrite
});

export const prohibitedClinicalAutomationPhrases = Object.freeze([
  "autonomous diagnosis",
  "autonomous treatment",
  "diagnose without clinician",
  "treat without clinician",
  "prescribe without approval",
  "replace clinician judgement",
  "automatic clinical decision"
]);

export function isKnownGroup(recordGroup) {
  return Object.values(recordGroups).includes(recordGroup);
}

export function isKnownRecordType(recordGroup, recordType) {
  return Boolean(recordTypesByGroup[recordGroup]?.includes(recordType));
}

export function deriveLegalEventType(record) {
  if (record.recordType === "legal_matter_registry") {
    return "legal.matter.created";
  }
  if (record.recordType === "contract_registry") {
    return "contract.created";
  }
  if (record.recordType === "contract_approval_workflow") {
    return "contract.approved";
  }
  if (record.recordType === "contract_expiration_tracking" || record.status === "expiring") {
    return "contract.expiring";
  }
  if (record.recordType === "risk_mitigation_plan" || record.status === "mitigated") {
    return "risk.mitigated";
  }
  if (record.recordGroup === recordGroups.enterpriseRiskManagement) {
    return "risk.created";
  }
  if (record.recordType === "policy_registry") {
    return "policy.created";
  }
  if (record.recordType === "policy_approval" || record.recordType === "policy_approval_workflow") {
    return "policy.approved";
  }
  if (record.recordType === "policy_publication") {
    return "policy.published";
  }
  if (record.recordType === "decision_registry") {
    return "governance.decision.recorded";
  }
  if (record.recordType === "regulatory_obligation_registry" || record.recordGroup === recordGroups.complianceRegulatory) {
    return "regulatory.obligation.updated";
  }
  return "legal.matter.created";
}

export function permissionAllows(grantedPermissions, requiredPermission) {
  const granted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
  if (granted.includes(requiredPermission) || granted.includes("global_legal.*") || granted.includes("*")) {
    return true;
  }
  const namespace = requiredPermission.split(".").slice(0, -1).join(".");
  return granted.includes(`${namespace}.*`);
}

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}
