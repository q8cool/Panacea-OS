export const SERVICE_NAME = "autonomous-healthcare-intelligence-foundation";
export const API_VERSION = "v4";
export const API_BASE_PATH = "/api/v4/autonomous-healthcare-intelligence";

export const recordGroups = Object.freeze({
  foundation: "autonomous_intelligence_foundation",
  clinicalGovernance: "clinical_intelligence_governance",
  orchestration: "enterprise_intelligence_orchestration",
  safetyControl: "safety_control",
  traceability: "explainability_traceability"
});

export const foundationTypes = Object.freeze([
  "autonomous_intelligence_registry",
  "intelligence_capability_registry",
  "intelligence_policy_engine",
  "intelligence_runtime_governance",
  "intelligence_safety_layer",
  "intelligence_approval_workflow",
  "intelligence_audit_trail",
  "intelligence_risk_classification"
]);

export const clinicalGovernanceTypes = Object.freeze([
  "clinical_intelligence_policy_registry",
  "recommendation_governance",
  "clinical_review_rules",
  "human_approval_rules",
  "safety_escalation_rules",
  "clinical_override_workflow",
  "recommendation_lifecycle_tracking"
]);

export const orchestrationTypes = Object.freeze([
  "cross_platform_intelligence_orchestrator",
  "enterprise_context_broker",
  "intelligence_event_router",
  "recommendation_coordinator",
  "multi_domain_decision_registry",
  "intelligence_workflow_controller",
  "intelligence_status_dashboard"
]);

export const safetyControlTypes = Object.freeze([
  "autonomous_action_prevention",
  "unsafe_recommendation_blocking",
  "human_in_the_loop_enforcement",
  "clinical_safety_guardrails",
  "operational_safety_guardrails",
  "policy_violation_detection",
  "emergency_stop_controls"
]);

export const traceabilityTypes = Object.freeze([
  "intelligence_trace",
  "decision_trace",
  "evidence_trace",
  "policy_trace",
  "approval_trace",
  "recommendation_history",
  "governance_audit_package"
]);

export const recordTypesByGroup = Object.freeze({
  [recordGroups.foundation]: foundationTypes,
  [recordGroups.clinicalGovernance]: clinicalGovernanceTypes,
  [recordGroups.orchestration]: orchestrationTypes,
  [recordGroups.safetyControl]: safetyControlTypes,
  [recordGroups.traceability]: traceabilityTypes
});

export const intelligenceStatuses = Object.freeze([
  "draft",
  "registered",
  "created",
  "active",
  "classified",
  "under_review",
  "review_required",
  "approval_required",
  "approved",
  "rejected",
  "blocked",
  "started",
  "in_progress",
  "completed",
  "escalated",
  "overridden",
  "stopped",
  "generated",
  "archived"
]);

export const integrationSources = Object.freeze([
  "ai_runtime_v2",
  "ahos_core",
  "clinical_intelligence_platform",
  "ai_assurance_platform",
  "privacy_consent_platform",
  "global_knowledge_network",
  "enterprise_data_platform",
  "audit_service",
  "notification_service"
]);

export const requiredEvents = Object.freeze([
  "intelligence.capability.registered",
  "intelligence.policy.created",
  "recommendation.governance.started",
  "recommendation.governance.completed",
  "human.approval.required",
  "unsafe.recommendation.blocked",
  "intelligence.trace.created",
  "governance.audit.generated"
]);

export const permissions = Object.freeze({
  foundationWrite: "autonomous_intelligence.foundation.write",
  clinicalGovernanceWrite: "autonomous_intelligence.clinical_governance.write",
  orchestrationWrite: "autonomous_intelligence.orchestration.write",
  safetyControlWrite: "autonomous_intelligence.safety_control.write",
  traceabilityWrite: "autonomous_intelligence.traceability.write",
  integrationWrite: "autonomous_intelligence.integration.write"
});

export const permissionsByGroup = Object.freeze({
  [recordGroups.foundation]: permissions.foundationWrite,
  [recordGroups.clinicalGovernance]: permissions.clinicalGovernanceWrite,
  [recordGroups.orchestration]: permissions.orchestrationWrite,
  [recordGroups.safetyControl]: permissions.safetyControlWrite,
  [recordGroups.traceability]: permissions.traceabilityWrite
});

export const prohibitedAutonomyPhrases = Object.freeze([
  "autonomous diagnosis",
  "autonomous treatment",
  "autonomously diagnose",
  "autonomously prescribe",
  "prescribe without approval",
  "diagnose without clinician",
  "treat without clinician",
  "bypass clinician approval",
  "replace clinician",
  "automatic clinical decision",
  "execute clinical action without approval"
]);

export function isKnownRecordType(recordGroup, recordType) {
  return Boolean(recordTypesByGroup[recordGroup]?.includes(recordType));
}

export function deriveIntelligenceEventType(record) {
  if (record.recordType === "intelligence_capability_registry") {
    return "intelligence.capability.registered";
  }
  if (record.recordType === "intelligence_policy_engine" || record.recordType === "clinical_intelligence_policy_registry") {
    return "intelligence.policy.created";
  }
  if (record.recordType === "recommendation_governance" && record.status === "completed") {
    return "recommendation.governance.completed";
  }
  if (record.recordType === "recommendation_governance") {
    return "recommendation.governance.started";
  }
  if (record.recordType === "human_approval_rules" || record.recordType === "intelligence_approval_workflow") {
    return "human.approval.required";
  }
  if (record.recordType === "unsafe_recommendation_blocking" || record.status === "blocked") {
    return "unsafe.recommendation.blocked";
  }
  if (record.recordType === "governance_audit_package" || record.recordType === "intelligence_audit_trail") {
    return "governance.audit.generated";
  }
  if (record.recordGroup === recordGroups.traceability) {
    return "intelligence.trace.created";
  }
  return "intelligence.capability.registered";
}

export function permissionAllows(grantedPermissions, requiredPermission) {
  const granted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
  if (granted.includes(requiredPermission) || granted.includes("autonomous_intelligence.*") || granted.includes("*")) {
    return true;
  }
  const namespace = requiredPermission.split(".").slice(0, -1).join(".");
  return granted.includes(`${namespace}.*`);
}

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}
