import { recordGroups } from "../domain/ai-assurance-domain.mjs";

export const routeDefinitions = Object.freeze([
  { method: "POST", path: "/assurance/registries", group: recordGroups.aiAssurance, type: "ai_assurance_registry", operationId: "createAiAssuranceRegistryRecord", summary: "Create an AI assurance registry record" },
  { method: "POST", path: "/assurance/systems", group: recordGroups.aiAssurance, type: "ai_system_inventory", operationId: "createAiSystemInventoryRecord", summary: "Create an AI system inventory record" },
  { method: "POST", path: "/assurance/use-cases", group: recordGroups.aiAssurance, type: "ai_use_case_registry", operationId: "createAiUseCaseRecord", summary: "Create an AI use case registry record" },
  { method: "POST", path: "/assurance/risk-classifications", group: recordGroups.aiAssurance, type: "ai_risk_classification", operationId: "createAiRiskClassificationRecord", summary: "Create an AI risk classification record" },
  { method: "POST", path: "/assurance/safety-assessments", group: recordGroups.aiAssurance, type: "ai_safety_assessment", operationId: "createAiSafetyAssessmentRecord", summary: "Create an AI safety assessment record" },
  { method: "POST", path: "/assurance/impact-assessments", group: recordGroups.aiAssurance, type: "ai_impact_assessment", operationId: "createAiImpactAssessmentRecord", summary: "Create an AI impact assessment record" },
  { method: "POST", path: "/assurance/workflows", group: recordGroups.aiAssurance, type: "ai_assurance_workflow", operationId: "createAiAssuranceWorkflowRecord", summary: "Create an AI assurance workflow record" },
  { method: "POST", path: "/assurance/dashboard", group: recordGroups.aiAssurance, type: "ai_assurance_dashboard", operationId: "createAiAssuranceDashboardRecord", summary: "Create an AI assurance dashboard record" },

  { method: "POST", path: "/models/risks", group: recordGroups.modelRiskManagement, type: "model_risk_registry", operationId: "createModelRiskRecord", summary: "Create a model risk registry record" },
  { method: "POST", path: "/models/risk-scoring", group: recordGroups.modelRiskManagement, type: "model_risk_scoring", operationId: "createModelRiskScoringRecord", summary: "Create a model risk scoring record" },
  { method: "POST", path: "/models/validation", group: recordGroups.modelRiskManagement, type: "model_validation_workflow", operationId: "createModelValidationRecord", summary: "Create a model validation workflow record" },
  { method: "POST", path: "/models/approvals", group: recordGroups.modelRiskManagement, type: "model_approval_workflow", operationId: "createModelApprovalRecord", summary: "Create a model approval workflow record" },
  { method: "POST", path: "/models/limitations", group: recordGroups.modelRiskManagement, type: "model_limitation_registry", operationId: "createModelLimitationRecord", summary: "Create a model limitation registry record" },
  { method: "POST", path: "/models/risk-reviews", group: recordGroups.modelRiskManagement, type: "model_risk_review", operationId: "createModelRiskReviewRecord", summary: "Create a model risk review record" },
  { method: "POST", path: "/models/retirements", group: recordGroups.modelRiskManagement, type: "model_retirement_workflow", operationId: "createModelRetirementRecord", summary: "Create a model retirement workflow record" },
  { method: "POST", path: "/models/dashboard", group: recordGroups.modelRiskManagement, type: "model_risk_dashboard", operationId: "createModelRiskDashboardRecord", summary: "Create a model risk dashboard record" },

  { method: "POST", path: "/safety-tests/registries", group: recordGroups.aiSafetyTesting, type: "safety_test_registry", operationId: "createSafetyTestRegistryRecord", summary: "Create a safety test registry record" },
  { method: "POST", path: "/safety-tests/clinical", group: recordGroups.aiSafetyTesting, type: "clinical_safety_test_cases", operationId: "createClinicalSafetyTestRecord", summary: "Create a clinical safety test case record" },
  { method: "POST", path: "/safety-tests/hallucination", group: recordGroups.aiSafetyTesting, type: "hallucination_test_cases", operationId: "createHallucinationTestRecord", summary: "Create a hallucination test case record" },
  { method: "POST", path: "/safety-tests/bias", group: recordGroups.aiSafetyTesting, type: "bias_test_cases", operationId: "createBiasTestRecord", summary: "Create a bias test case record" },
  { method: "POST", path: "/safety-tests/robustness", group: recordGroups.aiSafetyTesting, type: "robustness_test_cases", operationId: "createRobustnessTestRecord", summary: "Create a robustness test case record" },
  { method: "POST", path: "/safety-tests/adversarial", group: recordGroups.aiSafetyTesting, type: "adversarial_test_cases", operationId: "createAdversarialTestRecord", summary: "Create an adversarial test case record" },
  { method: "POST", path: "/safety-tests/regression", group: recordGroups.aiSafetyTesting, type: "regression_safety_tests", operationId: "createRegressionSafetyTestRecord", summary: "Create a regression safety test record" },
  { method: "POST", path: "/safety-tests/reports", group: recordGroups.aiSafetyTesting, type: "safety_test_reports", operationId: "createSafetyTestReportRecord", summary: "Create a safety test report record" },

  { method: "POST", path: "/prompt-agent/prompts/risks", group: recordGroups.promptAgentAssurance, type: "prompt_risk_registry", operationId: "createPromptRiskRecord", summary: "Create a prompt risk registry record" },
  { method: "POST", path: "/prompt-agent/prompts/reviews", group: recordGroups.promptAgentAssurance, type: "prompt_review_workflow", operationId: "createPromptReviewRecord", summary: "Create a prompt review workflow record" },
  { method: "POST", path: "/prompt-agent/prompts/approvals", group: recordGroups.promptAgentAssurance, type: "prompt_approval_workflow", operationId: "createPromptApprovalRecord", summary: "Create a prompt approval workflow record" },
  { method: "POST", path: "/prompt-agent/agents/risks", group: recordGroups.promptAgentAssurance, type: "agent_risk_registry", operationId: "createAgentRiskRecord", summary: "Create an agent risk registry record" },
  { method: "POST", path: "/prompt-agent/agents/permissions", group: recordGroups.promptAgentAssurance, type: "agent_permission_review", operationId: "createAgentPermissionReviewRecord", summary: "Create an agent permission review record" },
  { method: "POST", path: "/prompt-agent/agents/behavior", group: recordGroups.promptAgentAssurance, type: "agent_behavior_evaluation", operationId: "createAgentBehaviorEvaluationRecord", summary: "Create an agent behavior evaluation record" },
  { method: "POST", path: "/prompt-agent/agents/safety-testing", group: recordGroups.promptAgentAssurance, type: "agent_safety_testing", operationId: "createAgentSafetyTestingRecord", summary: "Create an agent safety testing record" },
  { method: "POST", path: "/prompt-agent/agents/runtime-approvals", group: recordGroups.promptAgentAssurance, type: "agent_runtime_approval", operationId: "createAgentRuntimeApprovalRecord", summary: "Create an agent runtime approval record" },

  { method: "POST", path: "/monitoring/runtime", group: recordGroups.aiMonitoring, type: "ai_runtime_monitoring", operationId: "createAiRuntimeMonitoringRecord", summary: "Create an AI runtime monitoring record" },
  { method: "POST", path: "/monitoring/recommendations", group: recordGroups.aiMonitoring, type: "recommendation_monitoring", operationId: "createRecommendationMonitoringRecord", summary: "Create a recommendation monitoring record" },
  { method: "POST", path: "/monitoring/drift", group: recordGroups.aiMonitoring, type: "drift_monitoring", operationId: "createDriftMonitoringRecord", summary: "Create a drift monitoring record" },
  { method: "POST", path: "/monitoring/bias", group: recordGroups.aiMonitoring, type: "bias_monitoring", operationId: "createBiasMonitoringRecord", summary: "Create a bias monitoring record" },
  { method: "POST", path: "/monitoring/hallucination", group: recordGroups.aiMonitoring, type: "hallucination_monitoring", operationId: "createHallucinationMonitoringRecord", summary: "Create a hallucination monitoring record" },
  { method: "POST", path: "/monitoring/unsafe-output", group: recordGroups.aiMonitoring, type: "unsafe_output_monitoring", operationId: "createUnsafeOutputMonitoringRecord", summary: "Create an unsafe output monitoring record" },
  { method: "POST", path: "/monitoring/model-performance", group: recordGroups.aiMonitoring, type: "model_performance_monitoring", operationId: "createModelPerformanceMonitoringRecord", summary: "Create a model performance monitoring record" },
  { method: "POST", path: "/monitoring/incidents", group: recordGroups.aiMonitoring, type: "ai_incident_monitoring", operationId: "createAiIncidentMonitoringRecord", summary: "Create an AI incident monitoring record" },

  { method: "POST", path: "/incidents/registries", group: recordGroups.aiIncidentManagement, type: "ai_incident_registry", operationId: "createAiIncidentRecord", summary: "Create an AI incident registry record" },
  { method: "POST", path: "/incidents/workflows", group: recordGroups.aiIncidentManagement, type: "ai_safety_incident_workflow", operationId: "createAiSafetyIncidentWorkflowRecord", summary: "Create an AI safety incident workflow record" },
  { method: "POST", path: "/incidents/severity", group: recordGroups.aiIncidentManagement, type: "ai_incident_severity", operationId: "createAiIncidentSeverityRecord", summary: "Create an AI incident severity record" },
  { method: "POST", path: "/incidents/investigations", group: recordGroups.aiIncidentManagement, type: "ai_incident_investigation", operationId: "createAiIncidentInvestigationRecord", summary: "Create an AI incident investigation record" },
  { method: "POST", path: "/incidents/corrective-actions", group: recordGroups.aiIncidentManagement, type: "ai_incident_corrective_actions", operationId: "createAiIncidentCorrectiveActionRecord", summary: "Create an AI incident corrective action record" },
  { method: "POST", path: "/incidents/closures", group: recordGroups.aiIncidentManagement, type: "ai_incident_closure", operationId: "createAiIncidentClosureRecord", summary: "Create an AI incident closure record" },
  { method: "POST", path: "/incidents/reporting", group: recordGroups.aiIncidentManagement, type: "ai_incident_reporting", operationId: "createAiIncidentReportingRecord", summary: "Create an AI incident reporting record" },

  { method: "POST", path: "/regulatory/requirements", group: recordGroups.regulatoryAiGovernance, type: "ai_regulatory_requirement_registry", operationId: "createAiRegulatoryRequirementRecord", summary: "Create an AI regulatory requirement registry record" },
  { method: "POST", path: "/regulatory/compliance-mappings", group: recordGroups.regulatoryAiGovernance, type: "ai_compliance_mapping", operationId: "createAiComplianceMappingRecord", summary: "Create an AI compliance mapping record" },
  { method: "POST", path: "/regulatory/evidence", group: recordGroups.regulatoryAiGovernance, type: "ai_evidence_repository", operationId: "createAiEvidenceRecord", summary: "Create an AI evidence repository record" },
  { method: "POST", path: "/regulatory/audit-packages", group: recordGroups.regulatoryAiGovernance, type: "ai_audit_package_generation", operationId: "createAiAuditPackageRecord", summary: "Create an AI audit package generation record" },
  { method: "POST", path: "/regulatory/review-board", group: recordGroups.regulatoryAiGovernance, type: "ai_governance_review_board", operationId: "createAiGovernanceReviewBoardRecord", summary: "Create an AI governance review board record" },
  { method: "POST", path: "/regulatory/decisions", group: recordGroups.regulatoryAiGovernance, type: "ai_governance_decisions", operationId: "createAiGovernanceDecisionRecord", summary: "Create an AI governance decision record" },
  { method: "POST", path: "/regulatory/attestations", group: recordGroups.regulatoryAiGovernance, type: "ai_governance_attestation", operationId: "createAiGovernanceAttestationRecord", summary: "Create an AI governance attestation record" }
]);

export const routeByFullPath = new Map(routeDefinitions.map((route) => [route.path, route]));
