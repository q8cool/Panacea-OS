import { recordGroups } from "../domain/command-domain.mjs";

export const routeDefinitions = Object.freeze([
  { method: "POST", path: "/command-centers/global", group: recordGroups.commandIntelligence, type: "global_healthcare_command_center", operationId: "createGlobalHealthcareCommandCenter", summary: "Create a global healthcare command center record" },
  { method: "POST", path: "/command-centers/regional", group: recordGroups.commandIntelligence, type: "regional_command_center", operationId: "createRegionalCommandCenter", summary: "Create a regional command center record" },
  { method: "POST", path: "/command-centers/country", group: recordGroups.commandIntelligence, type: "country_command_center", operationId: "createCountryCommandCenter", summary: "Create a country command center record" },
  { method: "POST", path: "/command-centers/hospital", group: recordGroups.commandIntelligence, type: "hospital_command_center", operationId: "createHospitalCommandCenter", summary: "Create a hospital command center record" },
  { method: "POST", path: "/command-centers/department", group: recordGroups.commandIntelligence, type: "department_command_center", operationId: "createDepartmentCommandCenter", summary: "Create a department command center record" },
  { method: "POST", path: "/command-centers/situation-awareness", group: recordGroups.commandIntelligence, type: "real_time_situation_awareness", operationId: "updateSituationAwareness", summary: "Update real-time situation awareness" },
  { method: "POST", path: "/command-centers/dashboards", group: recordGroups.commandIntelligence, type: "command_intelligence_dashboard", operationId: "createCommandIntelligenceDashboard", summary: "Create a command intelligence dashboard record" },
  { method: "POST", path: "/command-centers/timeline", group: recordGroups.commandIntelligence, type: "command_event_timeline", operationId: "createCommandEventTimeline", summary: "Create a command event timeline record" },

  { method: "POST", path: "/operational/capacity", group: recordGroups.operationalIntelligence, type: "real_time_capacity_intelligence", operationId: "recordCapacityIntelligence", summary: "Record real-time capacity intelligence" },
  { method: "POST", path: "/operational/beds", group: recordGroups.operationalIntelligence, type: "real_time_bed_intelligence", operationId: "recordBedIntelligence", summary: "Record real-time bed intelligence" },
  { method: "POST", path: "/operational/icu", group: recordGroups.operationalIntelligence, type: "real_time_icu_intelligence", operationId: "recordIcuIntelligence", summary: "Record real-time ICU intelligence" },
  { method: "POST", path: "/operational/emergency", group: recordGroups.operationalIntelligence, type: "real_time_emergency_intelligence", operationId: "recordEmergencyIntelligence", summary: "Record real-time emergency intelligence" },
  { method: "POST", path: "/operational/surgery", group: recordGroups.operationalIntelligence, type: "real_time_surgery_intelligence", operationId: "recordSurgeryIntelligence", summary: "Record real-time surgery intelligence" },
  { method: "POST", path: "/operational/resources", group: recordGroups.operationalIntelligence, type: "real_time_resource_intelligence", operationId: "recordResourceIntelligence", summary: "Record real-time resource intelligence" },
  { method: "POST", path: "/operational/workforce", group: recordGroups.operationalIntelligence, type: "real_time_workforce_intelligence", operationId: "recordWorkforceIntelligence", summary: "Record real-time workforce intelligence" },
  { method: "POST", path: "/operational/supply", group: recordGroups.operationalIntelligence, type: "real_time_supply_intelligence", operationId: "recordSupplyIntelligence", summary: "Record real-time supply intelligence" },

  { method: "POST", path: "/alerts/registries", group: recordGroups.alertIntelligence, type: "global_alert_registry", operationId: "createGlobalAlert", summary: "Create a global alert registry record" },
  { method: "POST", path: "/alerts/classifications", group: recordGroups.alertIntelligence, type: "alert_classification", operationId: "classifyAlert", summary: "Classify an alert" },
  { method: "POST", path: "/alerts/prioritization", group: recordGroups.alertIntelligence, type: "alert_prioritization", operationId: "prioritizeAlert", summary: "Prioritize an alert" },
  { method: "POST", path: "/alerts/correlation", group: recordGroups.alertIntelligence, type: "alert_correlation", operationId: "correlateAlert", summary: "Correlate alerts" },
  { method: "POST", path: "/alerts/escalation", group: recordGroups.alertIntelligence, type: "alert_escalation", operationId: "escalateAlert", summary: "Escalate an alert" },
  { method: "POST", path: "/alerts/suppression-rules", group: recordGroups.alertIntelligence, type: "alert_suppression_rules", operationId: "createAlertSuppressionRule", summary: "Create alert suppression rules" },
  { method: "POST", path: "/alerts/reviews", group: recordGroups.alertIntelligence, type: "alert_review_workflow", operationId: "reviewAlert", summary: "Record alert review workflow" },
  { method: "POST", path: "/alerts/resolution", group: recordGroups.alertIntelligence, type: "alert_resolution_tracking", operationId: "trackAlertResolution", summary: "Track alert resolution" },

  { method: "POST", path: "/crisis/events", group: recordGroups.crisisCoordination, type: "crisis_event_registry", operationId: "createCrisisEvent", summary: "Create a crisis event registry record" },
  { method: "POST", path: "/crisis/emergency-operations", group: recordGroups.crisisCoordination, type: "emergency_operations_workflow", operationId: "startEmergencyOperations", summary: "Start emergency operations workflow" },
  { method: "POST", path: "/crisis/mass-casualty", group: recordGroups.crisisCoordination, type: "mass_casualty_coordination", operationId: "coordinateMassCasualty", summary: "Coordinate mass casualty operations" },
  { method: "POST", path: "/crisis/pandemic-dashboard", group: recordGroups.crisisCoordination, type: "pandemic_command_dashboard", operationId: "createPandemicCommandDashboard", summary: "Create pandemic command dashboard record" },
  { method: "POST", path: "/crisis/disaster-dashboard", group: recordGroups.crisisCoordination, type: "disaster_command_dashboard", operationId: "createDisasterCommandDashboard", summary: "Create disaster command dashboard record" },
  { method: "POST", path: "/crisis/resource-mobilization", group: recordGroups.crisisCoordination, type: "resource_mobilization", operationId: "mobilizeResources", summary: "Record resource mobilization" },
  { method: "POST", path: "/crisis/cross-hospital", group: recordGroups.crisisCoordination, type: "cross_hospital_coordination", operationId: "coordinateCrossHospital", summary: "Record cross-hospital coordination" },
  { method: "POST", path: "/crisis/cross-region", group: recordGroups.crisisCoordination, type: "cross_region_coordination", operationId: "coordinateCrossRegion", summary: "Record cross-region coordination" },

  { method: "POST", path: "/decision-support/engines", group: recordGroups.decisionSupport, type: "command_recommendation_engine", operationId: "createCommandRecommendationEngine", summary: "Create command recommendation engine record" },
  { method: "POST", path: "/decision-support/capacity", group: recordGroups.decisionSupport, type: "capacity_recommendation", operationId: "generateCapacityRecommendation", summary: "Generate a governed capacity recommendation" },
  { method: "POST", path: "/decision-support/resources", group: recordGroups.decisionSupport, type: "resource_recommendation", operationId: "generateResourceRecommendation", summary: "Generate a governed resource recommendation" },
  { method: "POST", path: "/decision-support/staff", group: recordGroups.decisionSupport, type: "staff_recommendation", operationId: "generateStaffRecommendation", summary: "Generate a governed staff recommendation" },
  { method: "POST", path: "/decision-support/transfers", group: recordGroups.decisionSupport, type: "transfer_recommendation", operationId: "generateTransferRecommendation", summary: "Generate a governed transfer recommendation" },
  { method: "POST", path: "/decision-support/emergency-response", group: recordGroups.decisionSupport, type: "emergency_response_recommendation", operationId: "generateEmergencyResponseRecommendation", summary: "Generate a governed emergency response recommendation" },
  { method: "POST", path: "/decision-support/continuity", group: recordGroups.decisionSupport, type: "continuity_recommendation", operationId: "generateContinuityRecommendation", summary: "Generate a governed continuity recommendation" },

  { method: "POST", path: "/executive/situation-room", group: recordGroups.executiveIntelligence, type: "executive_situation_room", operationId: "createExecutiveSituationRoom", summary: "Create executive situation room record" },
  { method: "POST", path: "/executive/global-kpis", group: recordGroups.executiveIntelligence, type: "global_kpi_dashboard", operationId: "createGlobalKpiDashboard", summary: "Create global KPI dashboard record" },
  { method: "POST", path: "/executive/regional-kpis", group: recordGroups.executiveIntelligence, type: "regional_kpi_dashboard", operationId: "createRegionalKpiDashboard", summary: "Create regional KPI dashboard record" },
  { method: "POST", path: "/executive/country-kpis", group: recordGroups.executiveIntelligence, type: "country_kpi_dashboard", operationId: "createCountryKpiDashboard", summary: "Create country KPI dashboard record" },
  { method: "POST", path: "/executive/enterprise-risk", group: recordGroups.executiveIntelligence, type: "enterprise_risk_dashboard", operationId: "createEnterpriseRiskDashboard", summary: "Create enterprise risk dashboard record" },
  { method: "POST", path: "/executive/operational-risk", group: recordGroups.executiveIntelligence, type: "operational_risk_dashboard", operationId: "createOperationalRiskDashboard", summary: "Create operational risk dashboard record" },
  { method: "POST", path: "/executive/briefings", group: recordGroups.executiveIntelligence, type: "executive_briefing_generator", operationId: "generateExecutiveBriefing", summary: "Generate an executive briefing" }
]);

export const routeByFullPath = new Map(routeDefinitions.map((route) => [route.path, route]));
