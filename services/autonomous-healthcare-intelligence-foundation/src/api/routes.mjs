import { recordGroups } from "../domain/intelligence-domain.mjs";

export const routeDefinitions = Object.freeze([
  { method: "POST", path: "/foundation/registries", group: recordGroups.foundation, type: "autonomous_intelligence_registry", operationId: "createAutonomousIntelligenceRegistry", summary: "Create an autonomous intelligence registry record" },
  { method: "POST", path: "/foundation/capabilities", group: recordGroups.foundation, type: "intelligence_capability_registry", operationId: "registerIntelligenceCapability", summary: "Register an intelligence capability" },
  { method: "POST", path: "/foundation/policies", group: recordGroups.foundation, type: "intelligence_policy_engine", operationId: "createIntelligencePolicy", summary: "Create an intelligence policy engine record" },
  { method: "POST", path: "/foundation/runtime-governance", group: recordGroups.foundation, type: "intelligence_runtime_governance", operationId: "createRuntimeGovernance", summary: "Create intelligence runtime governance" },
  { method: "POST", path: "/foundation/safety-layers", group: recordGroups.foundation, type: "intelligence_safety_layer", operationId: "createIntelligenceSafetyLayer", summary: "Create an intelligence safety layer" },
  { method: "POST", path: "/foundation/approval-workflows", group: recordGroups.foundation, type: "intelligence_approval_workflow", operationId: "createIntelligenceApprovalWorkflow", summary: "Create an intelligence approval workflow" },
  { method: "POST", path: "/foundation/audit-trails", group: recordGroups.foundation, type: "intelligence_audit_trail", operationId: "createIntelligenceAuditTrail", summary: "Create an intelligence audit trail" },
  { method: "POST", path: "/foundation/risk-classifications", group: recordGroups.foundation, type: "intelligence_risk_classification", operationId: "createIntelligenceRiskClassification", summary: "Create an intelligence risk classification" },

  { method: "POST", path: "/clinical-governance/policies", group: recordGroups.clinicalGovernance, type: "clinical_intelligence_policy_registry", operationId: "createClinicalIntelligencePolicy", summary: "Create a clinical intelligence policy" },
  { method: "POST", path: "/clinical-governance/recommendations", group: recordGroups.clinicalGovernance, type: "recommendation_governance", operationId: "startRecommendationGovernance", summary: "Start or complete recommendation governance" },
  { method: "POST", path: "/clinical-governance/review-rules", group: recordGroups.clinicalGovernance, type: "clinical_review_rules", operationId: "createClinicalReviewRule", summary: "Create clinical review rules" },
  { method: "POST", path: "/clinical-governance/human-approval-rules", group: recordGroups.clinicalGovernance, type: "human_approval_rules", operationId: "createHumanApprovalRule", summary: "Create human approval rules" },
  { method: "POST", path: "/clinical-governance/safety-escalations", group: recordGroups.clinicalGovernance, type: "safety_escalation_rules", operationId: "createSafetyEscalationRule", summary: "Create safety escalation rules" },
  { method: "POST", path: "/clinical-governance/overrides", group: recordGroups.clinicalGovernance, type: "clinical_override_workflow", operationId: "createClinicalOverrideWorkflow", summary: "Create a clinical override workflow" },
  { method: "POST", path: "/clinical-governance/lifecycle", group: recordGroups.clinicalGovernance, type: "recommendation_lifecycle_tracking", operationId: "trackRecommendationLifecycle", summary: "Track recommendation lifecycle" },

  { method: "POST", path: "/orchestration/orchestrators", group: recordGroups.orchestration, type: "cross_platform_intelligence_orchestrator", operationId: "createCrossPlatformOrchestrator", summary: "Create a cross-platform intelligence orchestrator" },
  { method: "POST", path: "/orchestration/context-brokers", group: recordGroups.orchestration, type: "enterprise_context_broker", operationId: "createEnterpriseContextBroker", summary: "Create an enterprise context broker" },
  { method: "POST", path: "/orchestration/event-routers", group: recordGroups.orchestration, type: "intelligence_event_router", operationId: "createIntelligenceEventRouter", summary: "Create an intelligence event router" },
  { method: "POST", path: "/orchestration/recommendation-coordinators", group: recordGroups.orchestration, type: "recommendation_coordinator", operationId: "createRecommendationCoordinator", summary: "Create a recommendation coordinator" },
  { method: "POST", path: "/orchestration/decision-registries", group: recordGroups.orchestration, type: "multi_domain_decision_registry", operationId: "createMultiDomainDecisionRegistry", summary: "Create a multi-domain decision registry" },
  { method: "POST", path: "/orchestration/workflow-controllers", group: recordGroups.orchestration, type: "intelligence_workflow_controller", operationId: "createIntelligenceWorkflowController", summary: "Create an intelligence workflow controller" },
  { method: "POST", path: "/orchestration/status-dashboard", group: recordGroups.orchestration, type: "intelligence_status_dashboard", operationId: "createIntelligenceStatusDashboard", summary: "Create an intelligence status dashboard" },

  { method: "POST", path: "/safety/autonomous-action-prevention", group: recordGroups.safetyControl, type: "autonomous_action_prevention", operationId: "createAutonomousActionPrevention", summary: "Create autonomous action prevention controls" },
  { method: "POST", path: "/safety/unsafe-recommendation-blocking", group: recordGroups.safetyControl, type: "unsafe_recommendation_blocking", operationId: "blockUnsafeRecommendation", summary: "Block unsafe recommendations" },
  { method: "POST", path: "/safety/human-in-the-loop", group: recordGroups.safetyControl, type: "human_in_the_loop_enforcement", operationId: "enforceHumanInTheLoop", summary: "Enforce human-in-the-loop controls" },
  { method: "POST", path: "/safety/clinical-guardrails", group: recordGroups.safetyControl, type: "clinical_safety_guardrails", operationId: "createClinicalSafetyGuardrails", summary: "Create clinical safety guardrails" },
  { method: "POST", path: "/safety/operational-guardrails", group: recordGroups.safetyControl, type: "operational_safety_guardrails", operationId: "createOperationalSafetyGuardrails", summary: "Create operational safety guardrails" },
  { method: "POST", path: "/safety/policy-violations", group: recordGroups.safetyControl, type: "policy_violation_detection", operationId: "detectPolicyViolation", summary: "Detect policy violations" },
  { method: "POST", path: "/safety/emergency-stops", group: recordGroups.safetyControl, type: "emergency_stop_controls", operationId: "createEmergencyStopControls", summary: "Create emergency stop controls" },

  { method: "POST", path: "/traceability/intelligence-traces", group: recordGroups.traceability, type: "intelligence_trace", operationId: "createIntelligenceTrace", summary: "Create an intelligence trace" },
  { method: "POST", path: "/traceability/decision-traces", group: recordGroups.traceability, type: "decision_trace", operationId: "createDecisionTrace", summary: "Create a decision trace" },
  { method: "POST", path: "/traceability/evidence-traces", group: recordGroups.traceability, type: "evidence_trace", operationId: "createEvidenceTrace", summary: "Create an evidence trace" },
  { method: "POST", path: "/traceability/policy-traces", group: recordGroups.traceability, type: "policy_trace", operationId: "createPolicyTrace", summary: "Create a policy trace" },
  { method: "POST", path: "/traceability/approval-traces", group: recordGroups.traceability, type: "approval_trace", operationId: "createApprovalTrace", summary: "Create an approval trace" },
  { method: "POST", path: "/traceability/recommendation-history", group: recordGroups.traceability, type: "recommendation_history", operationId: "createRecommendationHistory", summary: "Create recommendation history" },
  { method: "POST", path: "/traceability/audit-packages", group: recordGroups.traceability, type: "governance_audit_package", operationId: "generateGovernanceAuditPackage", summary: "Generate a governance audit package" }
]);

export const routeByFullPath = new Map(routeDefinitions.map((route) => [route.path, route]));
