import { recordGroups } from "../domain/product-management-domain.mjs";

export const routeDefinitions = Object.freeze([
  { method: "POST", path: "/products/registries", group: recordGroups.productManagement, type: "product_registry", operationId: "createProductRegistryRecord", summary: "Create a product registry record" },
  { method: "POST", path: "/products/modules", group: recordGroups.productManagement, type: "product_module_registry", operationId: "createProductModuleRecord", summary: "Create a product module registry record" },
  { method: "POST", path: "/products/capabilities", group: recordGroups.productManagement, type: "product_capability_registry", operationId: "createProductCapabilityRecord", summary: "Create a product capability registry record" },
  { method: "POST", path: "/products/features", group: recordGroups.productManagement, type: "feature_registry", operationId: "createFeatureRecord", summary: "Create a feature registry record" },
  { method: "POST", path: "/products/feature-lifecycle", group: recordGroups.productManagement, type: "feature_lifecycle", operationId: "createFeatureLifecycleRecord", summary: "Create a feature lifecycle record" },
  { method: "POST", path: "/products/feature-ownership", group: recordGroups.productManagement, type: "feature_ownership", operationId: "createFeatureOwnershipRecord", summary: "Create a feature ownership record" },
  { method: "POST", path: "/products/feature-dependencies", group: recordGroups.productManagement, type: "feature_dependency_mapping", operationId: "createFeatureDependencyRecord", summary: "Create a feature dependency mapping record" },
  { method: "POST", path: "/products/feature-status", group: recordGroups.productManagement, type: "feature_status_tracking", operationId: "createFeatureStatusRecord", summary: "Create a feature status tracking record" },

  { method: "POST", path: "/roadmaps/registries", group: recordGroups.roadmapManagement, type: "roadmap_registry", operationId: "createRoadmapRegistryRecord", summary: "Create a roadmap registry record" },
  { method: "POST", path: "/roadmaps/versions", group: recordGroups.roadmapManagement, type: "version_roadmap", operationId: "createVersionRoadmapRecord", summary: "Create a version roadmap record" },
  { method: "POST", path: "/roadmaps/release-planning", group: recordGroups.roadmapManagement, type: "release_planning", operationId: "createReleasePlanningRecord", summary: "Create a release planning record" },
  { method: "POST", path: "/roadmaps/milestones", group: recordGroups.roadmapManagement, type: "milestone_planning", operationId: "createMilestonePlanningRecord", summary: "Create a milestone planning record" },
  { method: "POST", path: "/roadmaps/sprints", group: recordGroups.roadmapManagement, type: "sprint_planning", operationId: "createSprintPlanningRecord", summary: "Create a sprint planning record" },
  { method: "POST", path: "/roadmaps/dependencies", group: recordGroups.roadmapManagement, type: "roadmap_dependencies", operationId: "createRoadmapDependencyRecord", summary: "Create a roadmap dependency record" },
  { method: "POST", path: "/roadmaps/approvals", group: recordGroups.roadmapManagement, type: "roadmap_approval_workflow", operationId: "createRoadmapApprovalRecord", summary: "Create a roadmap approval workflow record" },
  { method: "POST", path: "/roadmaps/history", group: recordGroups.roadmapManagement, type: "roadmap_history", operationId: "createRoadmapHistoryRecord", summary: "Create a roadmap history record" },

  { method: "POST", path: "/innovation/ideas", group: recordGroups.innovationPortfolio, type: "innovation_idea_registry", operationId: "createInnovationIdeaRecord", summary: "Create an innovation idea registry record" },
  { method: "POST", path: "/innovation/pipeline", group: recordGroups.innovationPortfolio, type: "innovation_pipeline", operationId: "createInnovationPipelineRecord", summary: "Create an innovation pipeline record" },
  { method: "POST", path: "/innovation/scoring", group: recordGroups.innovationPortfolio, type: "innovation_scoring", operationId: "createInnovationScoringRecord", summary: "Create an innovation scoring record" },
  { method: "POST", path: "/innovation/reviews", group: recordGroups.innovationPortfolio, type: "innovation_review_workflow", operationId: "createInnovationReviewRecord", summary: "Create an innovation review workflow record" },
  { method: "POST", path: "/innovation/approvals", group: recordGroups.innovationPortfolio, type: "innovation_approval_workflow", operationId: "createInnovationApprovalRecord", summary: "Create an innovation approval workflow record" },
  { method: "POST", path: "/innovation/experiments", group: recordGroups.innovationPortfolio, type: "innovation_experiment_registry", operationId: "createInnovationExperimentRecord", summary: "Create an innovation experiment registry record" },
  { method: "POST", path: "/innovation/impact-assessments", group: recordGroups.innovationPortfolio, type: "innovation_impact_assessment", operationId: "createInnovationImpactRecord", summary: "Create an innovation impact assessment record" },
  { method: "POST", path: "/innovation/dashboard", group: recordGroups.innovationPortfolio, type: "innovation_portfolio_dashboard", operationId: "createInnovationDashboardRecord", summary: "Create an innovation portfolio dashboard record" },

  { method: "POST", path: "/requirements/registries", group: recordGroups.requirementsManagement, type: "requirement_registry", operationId: "createRequirementRegistryRecord", summary: "Create a requirement registry record" },
  { method: "POST", path: "/requirements/functional", group: recordGroups.requirementsManagement, type: "functional_requirement", operationId: "createFunctionalRequirementRecord", summary: "Create a functional requirement record" },
  { method: "POST", path: "/requirements/non-functional", group: recordGroups.requirementsManagement, type: "non_functional_requirement", operationId: "createNonFunctionalRequirementRecord", summary: "Create a non-functional requirement record" },
  { method: "POST", path: "/requirements/prioritization", group: recordGroups.requirementsManagement, type: "requirement_prioritization", operationId: "createRequirementPrioritizationRecord", summary: "Create a requirement prioritization record" },
  { method: "POST", path: "/requirements/traceability", group: recordGroups.requirementsManagement, type: "requirement_traceability", operationId: "createRequirementTraceabilityRecord", summary: "Create a requirement traceability record" },
  { method: "POST", path: "/requirements/approvals", group: recordGroups.requirementsManagement, type: "requirement_approval", operationId: "createRequirementApprovalRecord", summary: "Create a requirement approval record" },
  { method: "POST", path: "/requirements/change-control", group: recordGroups.requirementsManagement, type: "requirement_change_control", operationId: "createRequirementChangeControlRecord", summary: "Create a requirement change control record" },
  { method: "POST", path: "/requirements/coverage-dashboard", group: recordGroups.requirementsManagement, type: "requirement_coverage_dashboard", operationId: "createRequirementCoverageRecord", summary: "Create a requirement coverage dashboard record" },

  { method: "POST", path: "/feedback/customers", group: recordGroups.productFeedback, type: "customer_feedback_registry", operationId: "createCustomerFeedbackRecord", summary: "Create a customer feedback registry record" },
  { method: "POST", path: "/feedback/clinicians", group: recordGroups.productFeedback, type: "clinician_feedback_registry", operationId: "createClinicianFeedbackRecord", summary: "Create a clinician feedback registry record" },
  { method: "POST", path: "/feedback/patients", group: recordGroups.productFeedback, type: "patient_feedback_registry", operationId: "createPatientFeedbackRecord", summary: "Create a patient feedback registry record" },
  { method: "POST", path: "/feedback/internal", group: recordGroups.productFeedback, type: "internal_feedback_registry", operationId: "createInternalFeedbackRecord", summary: "Create an internal feedback registry record" },
  { method: "POST", path: "/feedback/triage", group: recordGroups.productFeedback, type: "feedback_triage", operationId: "createFeedbackTriageRecord", summary: "Create a feedback triage record" },
  { method: "POST", path: "/feedback/prioritization", group: recordGroups.productFeedback, type: "feedback_prioritization", operationId: "createFeedbackPrioritizationRecord", summary: "Create a feedback prioritization record" },
  { method: "POST", path: "/feedback/roadmap-links", group: recordGroups.productFeedback, type: "feedback_to_roadmap_linking", operationId: "createFeedbackRoadmapLinkRecord", summary: "Create a feedback-to-roadmap linking record" },
  { method: "POST", path: "/feedback/analytics", group: recordGroups.productFeedback, type: "feedback_analytics", operationId: "createFeedbackAnalyticsRecord", summary: "Create a feedback analytics record" },

  { method: "POST", path: "/releases/candidates", group: recordGroups.releaseGovernance, type: "release_candidate_registry", operationId: "createReleaseCandidateRecord", summary: "Create a release candidate registry record" },
  { method: "POST", path: "/releases/approvals", group: recordGroups.releaseGovernance, type: "release_approval_workflow", operationId: "createReleaseApprovalRecord", summary: "Create a release approval workflow record" },
  { method: "POST", path: "/releases/risk-assessments", group: recordGroups.releaseGovernance, type: "release_risk_assessment", operationId: "createReleaseRiskAssessmentRecord", summary: "Create a release risk assessment record" },
  { method: "POST", path: "/releases/notes", group: recordGroups.releaseGovernance, type: "release_notes_management", operationId: "createReleaseNotesRecord", summary: "Create a release notes management record" },
  { method: "POST", path: "/releases/dependencies", group: recordGroups.releaseGovernance, type: "release_dependency_tracking", operationId: "createReleaseDependencyRecord", summary: "Create a release dependency tracking record" },
  { method: "POST", path: "/releases/readiness-checklists", group: recordGroups.releaseGovernance, type: "release_readiness_checklist", operationId: "createReleaseReadinessRecord", summary: "Create a release readiness checklist record" },
  { method: "POST", path: "/releases/retrospectives", group: recordGroups.releaseGovernance, type: "release_retrospective", operationId: "createReleaseRetrospectiveRecord", summary: "Create a release retrospective record" }
]);

export const routeByFullPath = new Map(routeDefinitions.map((route) => [route.path, route]));
