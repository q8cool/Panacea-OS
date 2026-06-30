export const SERVICE_NAME = "real-time-global-healthcare-command-intelligence-platform";
export const API_VERSION = "v4";
export const API_BASE_PATH = "/api/v4/global-command-intelligence";

export const recordGroups = Object.freeze({
  commandIntelligence: "global_command_intelligence",
  operationalIntelligence: "real_time_operational_intelligence",
  alertIntelligence: "global_alert_intelligence",
  crisisCoordination: "crisis_emergency_coordination",
  decisionSupport: "command_decision_support",
  executiveIntelligence: "executive_intelligence"
});

export const commandIntelligenceTypes = Object.freeze([
  "global_healthcare_command_center",
  "regional_command_center",
  "country_command_center",
  "hospital_command_center",
  "department_command_center",
  "real_time_situation_awareness",
  "command_intelligence_dashboard",
  "command_event_timeline"
]);

export const operationalIntelligenceTypes = Object.freeze([
  "real_time_capacity_intelligence",
  "real_time_bed_intelligence",
  "real_time_icu_intelligence",
  "real_time_emergency_intelligence",
  "real_time_surgery_intelligence",
  "real_time_resource_intelligence",
  "real_time_workforce_intelligence",
  "real_time_supply_intelligence"
]);

export const alertIntelligenceTypes = Object.freeze([
  "global_alert_registry",
  "alert_classification",
  "alert_prioritization",
  "alert_correlation",
  "alert_escalation",
  "alert_suppression_rules",
  "alert_review_workflow",
  "alert_resolution_tracking"
]);

export const crisisCoordinationTypes = Object.freeze([
  "crisis_event_registry",
  "emergency_operations_workflow",
  "mass_casualty_coordination",
  "pandemic_command_dashboard",
  "disaster_command_dashboard",
  "resource_mobilization",
  "cross_hospital_coordination",
  "cross_region_coordination"
]);

export const decisionSupportTypes = Object.freeze([
  "command_recommendation_engine",
  "capacity_recommendation",
  "resource_recommendation",
  "staff_recommendation",
  "transfer_recommendation",
  "emergency_response_recommendation",
  "continuity_recommendation"
]);

export const executiveIntelligenceTypes = Object.freeze([
  "executive_situation_room",
  "global_kpi_dashboard",
  "regional_kpi_dashboard",
  "country_kpi_dashboard",
  "enterprise_risk_dashboard",
  "operational_risk_dashboard",
  "executive_briefing_generator"
]);

export const recordTypesByGroup = Object.freeze({
  [recordGroups.commandIntelligence]: commandIntelligenceTypes,
  [recordGroups.operationalIntelligence]: operationalIntelligenceTypes,
  [recordGroups.alertIntelligence]: alertIntelligenceTypes,
  [recordGroups.crisisCoordination]: crisisCoordinationTypes,
  [recordGroups.decisionSupport]: decisionSupportTypes,
  [recordGroups.executiveIntelligence]: executiveIntelligenceTypes
});

export const commandStatuses = Object.freeze([
  "draft",
  "created",
  "active",
  "updated",
  "classified",
  "prioritized",
  "correlated",
  "escalated",
  "suppressed",
  "review_required",
  "reviewed",
  "resolved",
  "started",
  "mobilized",
  "coordinated",
  "generated",
  "completed",
  "closed"
]);

export const integrationSources = Object.freeze([
  "autonomous_intelligence_foundation",
  "ahos_core",
  "enterprise_operations_platform",
  "global_healthcare_platform",
  "public_health_platform",
  "facility_platform",
  "workforce_platform",
  "supply_chain_platform",
  "analytics_platform",
  "audit_service",
  "notification_service"
]);

export const requiredEvents = Object.freeze([
  "command.center.created",
  "command.event.created",
  "situation.updated",
  "alert.correlated",
  "alert.escalated",
  "crisis.event.created",
  "emergency.coordination.started",
  "command.recommendation.generated",
  "executive.briefing.generated"
]);

export const permissions = Object.freeze({
  commandWrite: "global_command_intelligence.command.write",
  operationalWrite: "global_command_intelligence.operational.write",
  alertWrite: "global_command_intelligence.alert.write",
  crisisWrite: "global_command_intelligence.crisis.write",
  decisionWrite: "global_command_intelligence.decision.write",
  executiveWrite: "global_command_intelligence.executive.write",
  integrationWrite: "global_command_intelligence.integration.write"
});

export const permissionsByGroup = Object.freeze({
  [recordGroups.commandIntelligence]: permissions.commandWrite,
  [recordGroups.operationalIntelligence]: permissions.operationalWrite,
  [recordGroups.alertIntelligence]: permissions.alertWrite,
  [recordGroups.crisisCoordination]: permissions.crisisWrite,
  [recordGroups.decisionSupport]: permissions.decisionWrite,
  [recordGroups.executiveIntelligence]: permissions.executiveWrite
});

export const prohibitedAutonomyPhrases = Object.freeze([
  "autonomous diagnosis",
  "autonomous treatment",
  "autonomously diagnose",
  "autonomously prescribe",
  "diagnose without clinician",
  "treat without clinician",
  "prescribe without approval",
  "bypass clinician approval",
  "bypass governance approval",
  "automatic emergency enforcement",
  "execute emergency response without approval",
  "automatic clinical decision"
]);

export function isKnownRecordType(recordGroup, recordType) {
  return Boolean(recordTypesByGroup[recordGroup]?.includes(recordType));
}

export function deriveCommandEventType(record) {
  if ([
    "global_healthcare_command_center",
    "regional_command_center",
    "country_command_center",
    "hospital_command_center",
    "department_command_center"
  ].includes(record.recordType)) {
    return "command.center.created";
  }
  if (record.recordType === "command_event_timeline") {
    return "command.event.created";
  }
  if (record.recordType === "real_time_situation_awareness" || record.recordGroup === recordGroups.operationalIntelligence) {
    return "situation.updated";
  }
  if (record.recordType === "alert_escalation" || record.status === "escalated") {
    return "alert.escalated";
  }
  if (record.recordType === "alert_correlation") {
    return "alert.correlated";
  }
  if (record.recordType === "crisis_event_registry") {
    return "crisis.event.created";
  }
  if (record.recordType === "emergency_operations_workflow") {
    return "emergency.coordination.started";
  }
  if (record.recordGroup === recordGroups.decisionSupport) {
    return "command.recommendation.generated";
  }
  if (record.recordType === "executive_briefing_generator") {
    return "executive.briefing.generated";
  }
  return "command.event.created";
}

export function permissionAllows(grantedPermissions, requiredPermission) {
  const granted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
  if (granted.includes(requiredPermission) || granted.includes("global_command_intelligence.*") || granted.includes("*")) {
    return true;
  }
  const namespace = requiredPermission.split(".").slice(0, -1).join(".");
  return granted.includes(`${namespace}.*`);
}

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}
