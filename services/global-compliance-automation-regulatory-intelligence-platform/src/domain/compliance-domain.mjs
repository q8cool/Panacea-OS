export const SERVICE_NAME = "global-compliance-automation-regulatory-intelligence-platform";
export const API_VERSION = "v3";
export const API_BASE_PATH = "/api/v3/global-compliance";

export const recordGroups = Object.freeze({
  regulatoryIntelligence: "regulatory_intelligence",
  complianceAutomation: "compliance_automation",
  auditManagement: "audit_management",
  certificationManagement: "certification_management",
  policyCompliance: "policy_compliance",
  regulatoryReporting: "regulatory_reporting"
});

export const regulatoryIntelligenceTypes = Object.freeze([
  "regulatory_framework_registry",
  "country_regulatory_registry",
  "regional_regulatory_registry",
  "healthcare_regulation_registry",
  "regulatory_requirement_mapping",
  "regulatory_change_tracking",
  "regulatory_impact_assessment",
  "regulatory_calendar"
]);

export const complianceAutomationTypes = Object.freeze([
  "compliance_rules_engine",
  "compliance_checklist_automation",
  "evidence_collection",
  "evidence_validation",
  "compliance_status_tracking",
  "compliance_gap_detection",
  "compliance_remediation_workflow",
  "compliance_dashboard"
]);

export const auditManagementTypes = Object.freeze([
  "audit_plan_registry",
  "audit_schedule",
  "audit_scope_management",
  "audit_evidence_repository",
  "audit_findings",
  "corrective_action_plans",
  "audit_closure_workflow",
  "audit_history"
]);

export const certificationManagementTypes = Object.freeze([
  "certification_registry",
  "certification_requirements",
  "certification_evidence",
  "certification_renewal_tracking",
  "certification_expiration_alerts",
  "certification_readiness_dashboard"
]);

export const policyComplianceTypes = Object.freeze([
  "policy_compliance_mapping",
  "policy_attestation",
  "policy_exception_management",
  "policy_violation_tracking",
  "compliance_review_workflow",
  "policy_compliance_dashboard"
]);

export const regulatoryReportingTypes = Object.freeze([
  "regulatory_report_templates",
  "report_generation",
  "report_review_workflow",
  "report_submission_tracking",
  "report_approval_workflow",
  "report_history",
  "regulatory_correspondence_registry"
]);

export const recordTypesByGroup = Object.freeze({
  [recordGroups.regulatoryIntelligence]: regulatoryIntelligenceTypes,
  [recordGroups.complianceAutomation]: complianceAutomationTypes,
  [recordGroups.auditManagement]: auditManagementTypes,
  [recordGroups.certificationManagement]: certificationManagementTypes,
  [recordGroups.policyCompliance]: policyComplianceTypes,
  [recordGroups.regulatoryReporting]: regulatoryReportingTypes
});

export const complianceStatuses = Object.freeze([
  "draft",
  "registered",
  "mapped",
  "active",
  "under_review",
  "reviewed",
  "approved",
  "rejected",
  "scheduled",
  "in_progress",
  "completed",
  "closed",
  "expired",
  "expiring",
  "detected",
  "remediated",
  "generated",
  "submitted",
  "updated",
  "changed",
  "validated"
]);

export const integrationSources = Object.freeze([
  "foundation_platform",
  "security_platform",
  "legal_governance_platform",
  "quality_platform",
  "product_management_platform",
  "enterprise_data_platform",
  "audit_service",
  "notification_service"
]);

export const requiredEvents = Object.freeze([
  "regulation.created",
  "regulation.updated",
  "compliance.check.completed",
  "compliance.gap.detected",
  "audit.created",
  "audit.completed",
  "certification.expiring",
  "policy.violation.detected",
  "regulatory.report.generated",
  "remediation.completed"
]);

export const permissions = Object.freeze({
  regulatoryWrite: "global_compliance.regulatory.write",
  complianceWrite: "global_compliance.compliance.write",
  auditWrite: "global_compliance.audit.write",
  certificationWrite: "global_compliance.certification.write",
  policyWrite: "global_compliance.policy.write",
  reportingWrite: "global_compliance.reporting.write",
  integrationWrite: "global_compliance.integration.write"
});

export const permissionsByGroup = Object.freeze({
  [recordGroups.regulatoryIntelligence]: permissions.regulatoryWrite,
  [recordGroups.complianceAutomation]: permissions.complianceWrite,
  [recordGroups.auditManagement]: permissions.auditWrite,
  [recordGroups.certificationManagement]: permissions.certificationWrite,
  [recordGroups.policyCompliance]: permissions.policyWrite,
  [recordGroups.regulatoryReporting]: permissions.reportingWrite
});

export const prohibitedClinicalAutomationPhrases = Object.freeze([
  "autonomous diagnosis",
  "autonomous treatment",
  "diagnose without clinician",
  "treat without clinician",
  "prescribe without approval",
  "replace clinician judgement",
  "automatic clinical decision",
  "treatment recommendation",
  "clinical decision recommendation"
]);

export function isKnownGroup(recordGroup) {
  return Object.values(recordGroups).includes(recordGroup);
}

export function isKnownRecordType(recordGroup, recordType) {
  return Boolean(recordTypesByGroup[recordGroup]?.includes(recordType));
}

export function deriveComplianceEventType(record) {
  if (record.recordType === "compliance_remediation_workflow" && (record.status === "completed" || record.status === "remediated")) {
    return "remediation.completed";
  }
  if (record.recordType === "compliance_gap_detection") {
    return "compliance.gap.detected";
  }
  if (record.recordGroup === recordGroups.complianceAutomation) {
    return "compliance.check.completed";
  }
  if (record.recordType === "audit_closure_workflow" || (record.recordGroup === recordGroups.auditManagement && record.status === "completed")) {
    return "audit.completed";
  }
  if (record.recordGroup === recordGroups.auditManagement) {
    return "audit.created";
  }
  if (record.recordType === "certification_expiration_alerts" || record.status === "expiring") {
    return "certification.expiring";
  }
  if (record.recordType === "policy_violation_tracking" || record.status === "detected") {
    return "policy.violation.detected";
  }
  if (record.recordGroup === recordGroups.regulatoryReporting) {
    return "regulatory.report.generated";
  }
  if (
    record.recordType === "regulatory_change_tracking" ||
    record.recordType === "regulatory_impact_assessment" ||
    record.status === "updated" ||
    record.status === "changed"
  ) {
    return "regulation.updated";
  }
  return "regulation.created";
}

export function permissionAllows(grantedPermissions, requiredPermission) {
  const granted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
  if (granted.includes(requiredPermission) || granted.includes("global_compliance.*") || granted.includes("*")) {
    return true;
  }
  const namespace = requiredPermission.split(".").slice(0, -1).join(".");
  return granted.includes(`${namespace}.*`);
}

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}
