import { recordGroups } from "../domain/customer-success-domain.mjs";

export const routeDefinitions = Object.freeze([
  { method: "POST", path: "/customers/registries", group: recordGroups.customerSuccess, type: "customer_registry", operationId: "createCustomerRecord", summary: "Create a customer registry record" },
  { method: "POST", path: "/customers/accounts", group: recordGroups.customerSuccess, type: "account_registry", operationId: "createAccountRecord", summary: "Create an account registry record" },
  { method: "POST", path: "/customers/health-scores", group: recordGroups.customerSuccess, type: "customer_health_score", operationId: "createCustomerHealthScoreRecord", summary: "Create a customer health score record" },
  { method: "POST", path: "/customers/success-plans", group: recordGroups.customerSuccess, type: "customer_success_plan", operationId: "createCustomerSuccessPlanRecord", summary: "Create a customer success plan record" },
  { method: "POST", path: "/customers/milestones", group: recordGroups.customerSuccess, type: "customer_milestone", operationId: "createCustomerMilestoneRecord", summary: "Create a customer milestone record" },
  { method: "POST", path: "/customers/adoption", group: recordGroups.customerSuccess, type: "customer_adoption_tracking", operationId: "createCustomerAdoptionRecord", summary: "Create a customer adoption tracking record" },
  { method: "POST", path: "/customers/engagement", group: recordGroups.customerSuccess, type: "customer_engagement_tracking", operationId: "createCustomerEngagementRecord", summary: "Create a customer engagement tracking record" },
  { method: "POST", path: "/customers/dashboard", group: recordGroups.customerSuccess, type: "customer_success_dashboard", operationId: "createCustomerSuccessDashboardRecord", summary: "Create a customer success dashboard record" },

  { method: "POST", path: "/support/tickets", group: recordGroups.enterpriseSupport, type: "support_ticket_registry", operationId: "createSupportTicketRecord", summary: "Create a support ticket registry record" },
  { method: "POST", path: "/support/ticket-lifecycle", group: recordGroups.enterpriseSupport, type: "ticket_lifecycle", operationId: "createTicketLifecycleRecord", summary: "Create a ticket lifecycle record" },
  { method: "POST", path: "/support/priorities", group: recordGroups.enterpriseSupport, type: "priority_classification", operationId: "createPriorityClassificationRecord", summary: "Create a priority classification record" },
  { method: "POST", path: "/support/slas", group: recordGroups.enterpriseSupport, type: "sla_management", operationId: "createSlaManagementRecord", summary: "Create an SLA management record" },
  { method: "POST", path: "/support/escalations", group: recordGroups.enterpriseSupport, type: "escalation_workflow", operationId: "createEscalationWorkflowRecord", summary: "Create an escalation workflow record" },
  { method: "POST", path: "/support/assignments", group: recordGroups.enterpriseSupport, type: "assignment_workflow", operationId: "createAssignmentWorkflowRecord", summary: "Create an assignment workflow record" },
  { method: "POST", path: "/support/queue", group: recordGroups.enterpriseSupport, type: "support_queue", operationId: "createSupportQueueRecord", summary: "Create a support queue record" },
  { method: "POST", path: "/support/history", group: recordGroups.enterpriseSupport, type: "support_history", operationId: "createSupportHistoryRecord", summary: "Create a support history record" },
  { method: "POST", path: "/support/dashboard", group: recordGroups.enterpriseSupport, type: "support_dashboard", operationId: "createSupportDashboardRecord", summary: "Create a support dashboard record" },

  { method: "POST", path: "/service/incidents", group: recordGroups.serviceManagement, type: "incident_management", operationId: "createIncidentRecord", summary: "Create an incident management record" },
  { method: "POST", path: "/service/problems", group: recordGroups.serviceManagement, type: "problem_management", operationId: "createProblemRecord", summary: "Create a problem management record" },
  { method: "POST", path: "/service/changes", group: recordGroups.serviceManagement, type: "change_management", operationId: "createChangeRecord", summary: "Create a change management record" },
  { method: "POST", path: "/service/requests", group: recordGroups.serviceManagement, type: "service_request_management", operationId: "createServiceRequestRecord", summary: "Create a service request management record" },
  { method: "POST", path: "/service/knowledge-base", group: recordGroups.serviceManagement, type: "knowledge_base", operationId: "createKnowledgeBaseRecord", summary: "Create a knowledge base record" },
  { method: "POST", path: "/service/catalog", group: recordGroups.serviceManagement, type: "service_catalog", operationId: "createServiceCatalogRecord", summary: "Create a service catalog record" },
  { method: "POST", path: "/service/root-cause-analysis", group: recordGroups.serviceManagement, type: "root_cause_analysis", operationId: "createRootCauseAnalysisRecord", summary: "Create a root cause analysis record" },
  { method: "POST", path: "/service/post-incident-reviews", group: recordGroups.serviceManagement, type: "post_incident_review", operationId: "createPostIncidentReviewRecord", summary: "Create a post-incident review record" },

  { method: "POST", path: "/onboarding/workflows", group: recordGroups.implementationOnboarding, type: "customer_onboarding_workflow", operationId: "createCustomerOnboardingRecord", summary: "Create a customer onboarding workflow record" },
  { method: "POST", path: "/onboarding/implementation-projects", group: recordGroups.implementationOnboarding, type: "implementation_project_registry", operationId: "createImplementationProjectRecord", summary: "Create an implementation project registry record" },
  { method: "POST", path: "/onboarding/deployment-checklists", group: recordGroups.implementationOnboarding, type: "deployment_checklist", operationId: "createDeploymentChecklistRecord", summary: "Create a deployment checklist record" },
  { method: "POST", path: "/onboarding/configuration-checklists", group: recordGroups.implementationOnboarding, type: "configuration_checklist", operationId: "createConfigurationChecklistRecord", summary: "Create a configuration checklist record" },
  { method: "POST", path: "/onboarding/data-migration-checklists", group: recordGroups.implementationOnboarding, type: "data_migration_checklist", operationId: "createDataMigrationChecklistRecord", summary: "Create a data migration checklist record" },
  { method: "POST", path: "/onboarding/training-checklists", group: recordGroups.implementationOnboarding, type: "training_checklist", operationId: "createTrainingChecklistRecord", summary: "Create a training checklist record" },
  { method: "POST", path: "/onboarding/go-live-readiness", group: recordGroups.implementationOnboarding, type: "go_live_readiness", operationId: "createGoLiveReadinessRecord", summary: "Create a go-live readiness record" },
  { method: "POST", path: "/onboarding/post-go-live-support", group: recordGroups.implementationOnboarding, type: "post_go_live_support", operationId: "createPostGoLiveSupportRecord", summary: "Create a post-go-live support record" },

  { method: "POST", path: "/communications/customer-notifications", group: recordGroups.customerCommunication, type: "customer_notifications", operationId: "createCustomerNotificationRecord", summary: "Create a customer notification record" },
  { method: "POST", path: "/communications/release-announcements", group: recordGroups.customerCommunication, type: "release_announcements", operationId: "createReleaseAnnouncementRecord", summary: "Create a release announcement record" },
  { method: "POST", path: "/communications/maintenance-notifications", group: recordGroups.customerCommunication, type: "maintenance_notifications", operationId: "createMaintenanceNotificationRecord", summary: "Create a maintenance notification record" },
  { method: "POST", path: "/communications/incident-communications", group: recordGroups.customerCommunication, type: "incident_communications", operationId: "createIncidentCommunicationRecord", summary: "Create an incident communication record" },
  { method: "POST", path: "/communications/customer-feedback", group: recordGroups.customerCommunication, type: "customer_feedback", operationId: "createCustomerFeedbackRecord", summary: "Create a customer feedback record" },
  { method: "POST", path: "/communications/customer-surveys", group: recordGroups.customerCommunication, type: "customer_surveys", operationId: "createCustomerSurveyRecord", summary: "Create a customer survey record" },
  { method: "POST", path: "/communications/history", group: recordGroups.customerCommunication, type: "communication_history", operationId: "createCommunicationHistoryRecord", summary: "Create a communication history record" },

  { method: "POST", path: "/analytics/ticket-volume", group: recordGroups.supportAnalytics, type: "ticket_volume_analytics", operationId: "createTicketVolumeAnalyticsRecord", summary: "Create a ticket volume analytics record" },
  { method: "POST", path: "/analytics/sla-performance", group: recordGroups.supportAnalytics, type: "sla_performance", operationId: "createSlaPerformanceRecord", summary: "Create an SLA performance record" },
  { method: "POST", path: "/analytics/resolution-time", group: recordGroups.supportAnalytics, type: "resolution_time_analytics", operationId: "createResolutionTimeAnalyticsRecord", summary: "Create a resolution time analytics record" },
  { method: "POST", path: "/analytics/customer-satisfaction", group: recordGroups.supportAnalytics, type: "customer_satisfaction_analytics", operationId: "createCustomerSatisfactionAnalyticsRecord", summary: "Create a customer satisfaction analytics record" },
  { method: "POST", path: "/analytics/support-agent-performance", group: recordGroups.supportAnalytics, type: "support_agent_performance", operationId: "createSupportAgentPerformanceRecord", summary: "Create a support agent performance record" },
  { method: "POST", path: "/analytics/incident-trends", group: recordGroups.supportAnalytics, type: "incident_trends", operationId: "createIncidentTrendsRecord", summary: "Create an incident trends record" },
  { method: "POST", path: "/analytics/product-feedback-trends", group: recordGroups.supportAnalytics, type: "product_feedback_trends", operationId: "createProductFeedbackTrendsRecord", summary: "Create a product feedback trends record" }
]);

export const routeByFullPath = new Map(routeDefinitions.map((route) => [route.path, route]));
