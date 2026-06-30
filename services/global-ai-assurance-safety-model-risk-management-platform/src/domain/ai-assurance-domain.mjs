export const SERVICE_NAME = "global-ai-assurance-safety-model-risk-management-platform";
export const API_VERSION = "v3";
export const API_BASE_PATH = "/api/v3/global-ai-assurance";

export const recordGroups = Object.freeze({
  aiAssurance: "ai_assurance",
  modelRiskManagement: "model_risk_management",
  aiSafetyTesting: "ai_safety_testing",
  promptAgentAssurance: "prompt_agent_assurance",
  aiMonitoring: "ai_monitoring",
  aiIncidentManagement: "ai_incident_management",
  regulatoryAiGovernance: "regulatory_ai_governance"
});

export const aiAssuranceTypes = Object.freeze([
  "ai_assurance_registry",
  "ai_system_inventory",
  "ai_use_case_registry",
  "ai_risk_classification",
  "ai_safety_assessment",
  "ai_impact_assessment",
  "ai_assurance_workflow",
  "ai_assurance_dashboard"
]);

export const modelRiskManagementTypes = Object.freeze([
  "model_risk_registry",
  "model_risk_scoring",
  "model_validation_workflow",
  "model_approval_workflow",
  "model_limitation_registry",
  "model_risk_review",
  "model_retirement_workflow",
  "model_risk_dashboard"
]);

export const aiSafetyTestingTypes = Object.freeze([
  "safety_test_registry",
  "clinical_safety_test_cases",
  "hallucination_test_cases",
  "bias_test_cases",
  "robustness_test_cases",
  "adversarial_test_cases",
  "regression_safety_tests",
  "safety_test_reports"
]);

export const promptAgentAssuranceTypes = Object.freeze([
  "prompt_risk_registry",
  "prompt_review_workflow",
  "prompt_approval_workflow",
  "agent_risk_registry",
  "agent_permission_review",
  "agent_behavior_evaluation",
  "agent_safety_testing",
  "agent_runtime_approval"
]);

export const aiMonitoringTypes = Object.freeze([
  "ai_runtime_monitoring",
  "recommendation_monitoring",
  "drift_monitoring",
  "bias_monitoring",
  "hallucination_monitoring",
  "unsafe_output_monitoring",
  "model_performance_monitoring",
  "ai_incident_monitoring"
]);

export const aiIncidentManagementTypes = Object.freeze([
  "ai_incident_registry",
  "ai_safety_incident_workflow",
  "ai_incident_severity",
  "ai_incident_investigation",
  "ai_incident_corrective_actions",
  "ai_incident_closure",
  "ai_incident_reporting"
]);

export const regulatoryAiGovernanceTypes = Object.freeze([
  "ai_regulatory_requirement_registry",
  "ai_compliance_mapping",
  "ai_evidence_repository",
  "ai_audit_package_generation",
  "ai_governance_review_board",
  "ai_governance_decisions",
  "ai_governance_attestation"
]);

export const recordTypesByGroup = Object.freeze({
  [recordGroups.aiAssurance]: aiAssuranceTypes,
  [recordGroups.modelRiskManagement]: modelRiskManagementTypes,
  [recordGroups.aiSafetyTesting]: aiSafetyTestingTypes,
  [recordGroups.promptAgentAssurance]: promptAgentAssuranceTypes,
  [recordGroups.aiMonitoring]: aiMonitoringTypes,
  [recordGroups.aiIncidentManagement]: aiIncidentManagementTypes,
  [recordGroups.regulatoryAiGovernance]: regulatoryAiGovernanceTypes
});

export const aiAssuranceStatuses = Object.freeze([
  "draft",
  "registered",
  "classified",
  "active",
  "under_review",
  "reviewed",
  "approved",
  "rejected",
  "started",
  "in_progress",
  "completed",
  "closed",
  "retired",
  "detected",
  "generated",
  "monitoring",
  "validated",
  "updated"
]);

export const integrationSources = Object.freeze([
  "foundation_platform",
  "ai_foundation_platform",
  "ai_governance_platform",
  "clinical_intelligence_platform",
  "multi_agent_platform",
  "learning_platform",
  "compliance_platform",
  "security_platform",
  "audit_service",
  "notification_service"
]);

export const requiredEvents = Object.freeze([
  "ai.assurance.review.created",
  "ai.risk.classified",
  "model.validation.started",
  "model.validation.completed",
  "model.approved",
  "model.rejected",
  "prompt.approved",
  "agent.approved",
  "ai.safety.test.completed",
  "ai.incident.created",
  "ai.incident.closed",
  "ai.audit.package.generated"
]);

export const permissions = Object.freeze({
  assuranceWrite: "global_ai_assurance.assurance.write",
  modelRiskWrite: "global_ai_assurance.model_risk.write",
  safetyTestingWrite: "global_ai_assurance.safety_testing.write",
  promptAgentWrite: "global_ai_assurance.prompt_agent.write",
  monitoringWrite: "global_ai_assurance.monitoring.write",
  incidentWrite: "global_ai_assurance.incident.write",
  governanceWrite: "global_ai_assurance.governance.write",
  integrationWrite: "global_ai_assurance.integration.write"
});

export const permissionsByGroup = Object.freeze({
  [recordGroups.aiAssurance]: permissions.assuranceWrite,
  [recordGroups.modelRiskManagement]: permissions.modelRiskWrite,
  [recordGroups.aiSafetyTesting]: permissions.safetyTestingWrite,
  [recordGroups.promptAgentAssurance]: permissions.promptAgentWrite,
  [recordGroups.aiMonitoring]: permissions.monitoringWrite,
  [recordGroups.aiIncidentManagement]: permissions.incidentWrite,
  [recordGroups.regulatoryAiGovernance]: permissions.governanceWrite
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
  "clinical decision recommendation",
  "promote to production without approval",
  "automatic model promotion"
]);

export function isKnownGroup(recordGroup) {
  return Object.values(recordGroups).includes(recordGroup);
}

export function isKnownRecordType(recordGroup, recordType) {
  return Boolean(recordTypesByGroup[recordGroup]?.includes(recordType));
}

export function deriveAiAssuranceEventType(record) {
  if (record.recordType === "ai_risk_classification") {
    return "ai.risk.classified";
  }
  if (record.recordType === "model_validation_workflow" && record.status === "started") {
    return "model.validation.started";
  }
  if (record.recordType === "model_validation_workflow") {
    return "model.validation.completed";
  }
  if (record.recordType === "model_approval_workflow" && record.status === "rejected") {
    return "model.rejected";
  }
  if (record.recordType === "model_approval_workflow" && record.status === "approved") {
    return "model.approved";
  }
  if (record.recordType === "prompt_approval_workflow" && record.status === "approved") {
    return "prompt.approved";
  }
  if (record.recordType === "agent_runtime_approval" && record.status === "approved") {
    return "agent.approved";
  }
  if (record.recordGroup === recordGroups.aiSafetyTesting && (record.status === "completed" || record.status === "validated")) {
    return "ai.safety.test.completed";
  }
  if (record.recordType === "ai_incident_closure" || (record.recordGroup === recordGroups.aiIncidentManagement && record.status === "closed")) {
    return "ai.incident.closed";
  }
  if (record.recordGroup === recordGroups.aiIncidentManagement) {
    return "ai.incident.created";
  }
  if (record.recordType === "ai_audit_package_generation") {
    return "ai.audit.package.generated";
  }
  return "ai.assurance.review.created";
}

export function permissionAllows(grantedPermissions, requiredPermission) {
  const granted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
  if (granted.includes(requiredPermission) || granted.includes("global_ai_assurance.*") || granted.includes("*")) {
    return true;
  }
  const namespace = requiredPermission.split(".").slice(0, -1).join(".");
  return granted.includes(`${namespace}.*`);
}

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}
