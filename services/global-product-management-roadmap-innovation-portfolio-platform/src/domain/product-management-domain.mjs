export const SERVICE_NAME = "global-product-management-roadmap-innovation-portfolio-platform";
export const API_VERSION = "v3";
export const API_BASE_PATH = "/api/v3/global-product-management";

export const recordGroups = Object.freeze({
  productManagement: "product_management",
  roadmapManagement: "roadmap_management",
  innovationPortfolio: "innovation_portfolio",
  requirementsManagement: "requirements_management",
  productFeedback: "product_feedback",
  releaseGovernance: "release_governance"
});

export const productManagementTypes = Object.freeze([
  "product_registry",
  "product_module_registry",
  "product_capability_registry",
  "feature_registry",
  "feature_lifecycle",
  "feature_ownership",
  "feature_dependency_mapping",
  "feature_status_tracking"
]);

export const roadmapManagementTypes = Object.freeze([
  "roadmap_registry",
  "version_roadmap",
  "release_planning",
  "milestone_planning",
  "sprint_planning",
  "roadmap_dependencies",
  "roadmap_approval_workflow",
  "roadmap_history"
]);

export const innovationPortfolioTypes = Object.freeze([
  "innovation_idea_registry",
  "innovation_pipeline",
  "innovation_scoring",
  "innovation_review_workflow",
  "innovation_approval_workflow",
  "innovation_experiment_registry",
  "innovation_impact_assessment",
  "innovation_portfolio_dashboard"
]);

export const requirementsManagementTypes = Object.freeze([
  "requirement_registry",
  "functional_requirement",
  "non_functional_requirement",
  "requirement_prioritization",
  "requirement_traceability",
  "requirement_approval",
  "requirement_change_control",
  "requirement_coverage_dashboard"
]);

export const productFeedbackTypes = Object.freeze([
  "customer_feedback_registry",
  "clinician_feedback_registry",
  "patient_feedback_registry",
  "internal_feedback_registry",
  "feedback_triage",
  "feedback_prioritization",
  "feedback_to_roadmap_linking",
  "feedback_analytics"
]);

export const releaseGovernanceTypes = Object.freeze([
  "release_candidate_registry",
  "release_approval_workflow",
  "release_risk_assessment",
  "release_notes_management",
  "release_dependency_tracking",
  "release_readiness_checklist",
  "release_retrospective"
]);

export const recordTypesByGroup = Object.freeze({
  [recordGroups.productManagement]: productManagementTypes,
  [recordGroups.roadmapManagement]: roadmapManagementTypes,
  [recordGroups.innovationPortfolio]: innovationPortfolioTypes,
  [recordGroups.requirementsManagement]: requirementsManagementTypes,
  [recordGroups.productFeedback]: productFeedbackTypes,
  [recordGroups.releaseGovernance]: releaseGovernanceTypes
});

export const productManagementStatuses = Object.freeze([
  "draft",
  "registered",
  "proposed",
  "active",
  "under_review",
  "reviewed",
  "triaged",
  "prioritized",
  "approved",
  "rejected",
  "planned",
  "in_progress",
  "completed",
  "released",
  "linked",
  "changed",
  "updated",
  "received"
]);

export const integrationSources = Object.freeze([
  "foundation_platform",
  "developer_platform",
  "marketplace_platform",
  "customer_success_platform",
  "support_platform",
  "legal_governance_platform",
  "enterprise_data_platform",
  "audit_service",
  "notification_service"
]);

export const requiredEvents = Object.freeze([
  "product.created",
  "feature.created",
  "feature.approved",
  "requirement.created",
  "roadmap.updated",
  "milestone.completed",
  "innovation.idea.submitted",
  "innovation.approved",
  "feedback.received",
  "release.approved"
]);

export const permissions = Object.freeze({
  productWrite: "global_product_management.product.write",
  roadmapWrite: "global_product_management.roadmap.write",
  innovationWrite: "global_product_management.innovation.write",
  requirementWrite: "global_product_management.requirement.write",
  feedbackWrite: "global_product_management.feedback.write",
  releaseWrite: "global_product_management.release.write",
  integrationWrite: "global_product_management.integration.write"
});

export const permissionsByGroup = Object.freeze({
  [recordGroups.productManagement]: permissions.productWrite,
  [recordGroups.roadmapManagement]: permissions.roadmapWrite,
  [recordGroups.innovationPortfolio]: permissions.innovationWrite,
  [recordGroups.requirementsManagement]: permissions.requirementWrite,
  [recordGroups.productFeedback]: permissions.feedbackWrite,
  [recordGroups.releaseGovernance]: permissions.releaseWrite
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

export function deriveProductManagementEventType(record) {
  if (record.recordType === "product_registry") {
    return "product.created";
  }
  if (record.recordType === "feature_registry") {
    return "feature.created";
  }
  if (
    (record.recordType === "feature_lifecycle" || record.recordType === "feature_status_tracking") &&
    record.status === "approved"
  ) {
    return "feature.approved";
  }
  if (record.recordGroup === recordGroups.requirementsManagement) {
    return "requirement.created";
  }
  if (record.recordType === "milestone_planning" && record.status === "completed") {
    return "milestone.completed";
  }
  if (record.recordGroup === recordGroups.roadmapManagement) {
    return "roadmap.updated";
  }
  if (record.recordType === "innovation_idea_registry") {
    return "innovation.idea.submitted";
  }
  if (record.recordType === "innovation_approval_workflow" || (record.recordGroup === recordGroups.innovationPortfolio && record.status === "approved")) {
    return "innovation.approved";
  }
  if (record.recordGroup === recordGroups.productFeedback) {
    return "feedback.received";
  }
  if (record.recordGroup === recordGroups.releaseGovernance) {
    return "release.approved";
  }
  return "roadmap.updated";
}

export function permissionAllows(grantedPermissions, requiredPermission) {
  const granted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
  if (granted.includes(requiredPermission) || granted.includes("global_product_management.*") || granted.includes("*")) {
    return true;
  }
  const namespace = requiredPermission.split(".").slice(0, -1).join(".");
  return granted.includes(`${namespace}.*`);
}

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}
