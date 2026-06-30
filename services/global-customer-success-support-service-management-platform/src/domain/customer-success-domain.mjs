export const SERVICE_NAME = "global-customer-success-support-service-management-platform";
export const API_VERSION = "v3";
export const API_BASE_PATH = "/api/v3/global-customer-success";

export const recordGroups = Object.freeze({
  customerSuccess: "customer_success",
  enterpriseSupport: "enterprise_support",
  serviceManagement: "service_management",
  implementationOnboarding: "implementation_onboarding",
  customerCommunication: "customer_communication",
  supportAnalytics: "support_analytics"
});

export const customerSuccessTypes = Object.freeze([
  "customer_registry",
  "account_registry",
  "customer_health_score",
  "customer_success_plan",
  "customer_milestone",
  "customer_adoption_tracking",
  "customer_engagement_tracking",
  "customer_success_dashboard"
]);

export const enterpriseSupportTypes = Object.freeze([
  "support_ticket_registry",
  "ticket_lifecycle",
  "priority_classification",
  "sla_management",
  "escalation_workflow",
  "assignment_workflow",
  "support_queue",
  "support_history",
  "support_dashboard"
]);

export const serviceManagementTypes = Object.freeze([
  "incident_management",
  "problem_management",
  "change_management",
  "service_request_management",
  "knowledge_base",
  "service_catalog",
  "root_cause_analysis",
  "post_incident_review"
]);

export const implementationOnboardingTypes = Object.freeze([
  "customer_onboarding_workflow",
  "implementation_project_registry",
  "deployment_checklist",
  "configuration_checklist",
  "data_migration_checklist",
  "training_checklist",
  "go_live_readiness",
  "post_go_live_support"
]);

export const customerCommunicationTypes = Object.freeze([
  "customer_notifications",
  "release_announcements",
  "maintenance_notifications",
  "incident_communications",
  "customer_feedback",
  "customer_surveys",
  "communication_history"
]);

export const supportAnalyticsTypes = Object.freeze([
  "ticket_volume_analytics",
  "sla_performance",
  "resolution_time_analytics",
  "customer_satisfaction_analytics",
  "support_agent_performance",
  "incident_trends",
  "product_feedback_trends"
]);

export const recordTypesByGroup = Object.freeze({
  [recordGroups.customerSuccess]: customerSuccessTypes,
  [recordGroups.enterpriseSupport]: enterpriseSupportTypes,
  [recordGroups.serviceManagement]: serviceManagementTypes,
  [recordGroups.implementationOnboarding]: implementationOnboardingTypes,
  [recordGroups.customerCommunication]: customerCommunicationTypes,
  [recordGroups.supportAnalytics]: supportAnalyticsTypes
});

export const customerSuccessStatuses = Object.freeze([
  "draft",
  "registered",
  "active",
  "open",
  "pending",
  "assigned",
  "started",
  "on_track",
  "at_risk",
  "escalated",
  "resolved",
  "closed",
  "completed",
  "approved",
  "received",
  "published",
  "measured",
  "breached",
  "updated"
]);

export const integrationSources = Object.freeze([
  "foundation_platform",
  "enterprise_platform",
  "devops_platform",
  "security_platform",
  "lts_maintenance_platform",
  "legal_governance_platform",
  "audit_service",
  "notification_service"
]);

export const requiredEvents = Object.freeze([
  "customer.created",
  "customer.health.updated",
  "support.ticket.created",
  "support.ticket.escalated",
  "support.ticket.resolved",
  "incident.created",
  "incident.resolved",
  "service.request.created",
  "onboarding.started",
  "onboarding.completed",
  "customer.feedback.received"
]);

export const permissions = Object.freeze({
  customerWrite: "global_customer_success.customer.write",
  supportWrite: "global_customer_success.support.write",
  serviceWrite: "global_customer_success.service.write",
  onboardingWrite: "global_customer_success.onboarding.write",
  communicationWrite: "global_customer_success.communication.write",
  analyticsWrite: "global_customer_success.analytics.write",
  integrationWrite: "global_customer_success.integration.write"
});

export const permissionsByGroup = Object.freeze({
  [recordGroups.customerSuccess]: permissions.customerWrite,
  [recordGroups.enterpriseSupport]: permissions.supportWrite,
  [recordGroups.serviceManagement]: permissions.serviceWrite,
  [recordGroups.implementationOnboarding]: permissions.onboardingWrite,
  [recordGroups.customerCommunication]: permissions.communicationWrite,
  [recordGroups.supportAnalytics]: permissions.analyticsWrite
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

export function deriveCustomerSuccessEventType(record) {
  if (record.recordType === "customer_registry") {
    return "customer.created";
  }
  if (record.recordType === "customer_health_score" || record.recordGroup === recordGroups.customerSuccess) {
    return "customer.health.updated";
  }
  if (record.recordType === "support_ticket_registry") {
    return "support.ticket.created";
  }
  if (record.recordType === "escalation_workflow" || record.status === "escalated") {
    return "support.ticket.escalated";
  }
  if (record.recordType === "ticket_lifecycle" && record.status === "resolved") {
    return "support.ticket.resolved";
  }
  if (record.recordType === "post_incident_review" || (record.recordType === "incident_management" && record.status === "resolved")) {
    return "incident.resolved";
  }
  if (record.recordType === "incident_management") {
    return "incident.created";
  }
  if (record.recordType === "service_request_management") {
    return "service.request.created";
  }
  if (record.recordType === "customer_onboarding_workflow" && record.status === "completed") {
    return "onboarding.completed";
  }
  if (record.recordType === "customer_onboarding_workflow") {
    return "onboarding.started";
  }
  if (record.recordType === "customer_feedback") {
    return "customer.feedback.received";
  }
  return "customer.health.updated";
}

export function permissionAllows(grantedPermissions, requiredPermission) {
  const granted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
  if (granted.includes(requiredPermission) || granted.includes("global_customer_success.*") || granted.includes("*")) {
    return true;
  }
  const namespace = requiredPermission.split(".").slice(0, -1).join(".");
  return granted.includes(`${namespace}.*`);
}

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}
