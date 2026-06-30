import { recordGroups } from "../domain/privacy-domain.mjs";

export const routeDefinitions = Object.freeze([
  { method: "POST", path: "/consents/registries", group: recordGroups.globalConsent, type: "consent_registry", operationId: "createConsentRegistryRecord", summary: "Create a consent registry record" },
  { method: "POST", path: "/consents/lifecycle", group: recordGroups.globalConsent, type: "consent_lifecycle", operationId: "createConsentLifecycleRecord", summary: "Create a consent lifecycle record" },
  { method: "POST", path: "/consents/capture", group: recordGroups.globalConsent, type: "consent_capture", operationId: "createConsentCaptureRecord", summary: "Create a consent capture record" },
  { method: "POST", path: "/consents/withdrawals", group: recordGroups.globalConsent, type: "consent_withdrawal", operationId: "createConsentWithdrawalRecord", summary: "Create a consent withdrawal record" },
  { method: "POST", path: "/consents/expirations", group: recordGroups.globalConsent, type: "consent_expiration", operationId: "createConsentExpirationRecord", summary: "Create a consent expiration record" },
  { method: "POST", path: "/consents/versioning", group: recordGroups.globalConsent, type: "consent_versioning", operationId: "createConsentVersioningRecord", summary: "Create a consent versioning record" },
  { method: "POST", path: "/consents/scopes", group: recordGroups.globalConsent, type: "consent_scope_management", operationId: "createConsentScopeRecord", summary: "Create a consent scope management record" },
  { method: "POST", path: "/consents/audit-trails", group: recordGroups.globalConsent, type: "consent_audit_trail", operationId: "createConsentAuditTrailRecord", summary: "Create a consent audit trail record" },

  { method: "POST", path: "/data-rights/access-requests", group: recordGroups.patientDataRights, type: "data_access_requests", operationId: "createDataAccessRequestRecord", summary: "Create a data access request record" },
  { method: "POST", path: "/data-rights/correction-requests", group: recordGroups.patientDataRights, type: "data_correction_requests", operationId: "createDataCorrectionRequestRecord", summary: "Create a data correction request record" },
  { method: "POST", path: "/data-rights/export-requests", group: recordGroups.patientDataRights, type: "data_export_requests", operationId: "createDataExportRequestRecord", summary: "Create a data export request record" },
  { method: "POST", path: "/data-rights/deletion-requests", group: recordGroups.patientDataRights, type: "data_deletion_requests", operationId: "createDataDeletionRequestRecord", summary: "Create a legally permitted data deletion request record" },
  { method: "POST", path: "/data-rights/restriction-requests", group: recordGroups.patientDataRights, type: "data_restriction_requests", operationId: "createDataRestrictionRequestRecord", summary: "Create a data restriction request record" },
  { method: "POST", path: "/data-rights/portability", group: recordGroups.patientDataRights, type: "data_portability", operationId: "createDataPortabilityRecord", summary: "Create a data portability record" },
  { method: "POST", path: "/data-rights/reviews", group: recordGroups.patientDataRights, type: "request_review_workflow", operationId: "createDataRightsReviewRecord", summary: "Create a data rights request review workflow record" },
  { method: "POST", path: "/data-rights/fulfillment", group: recordGroups.patientDataRights, type: "request_fulfillment_tracking", operationId: "createDataRightsFulfillmentRecord", summary: "Create a data rights fulfillment tracking record" },

  { method: "POST", path: "/privacy-policies/registries", group: recordGroups.privacyPolicyEngine, type: "privacy_policy_registry", operationId: "createPrivacyPolicyRegistryRecord", summary: "Create a privacy policy registry record" },
  { method: "POST", path: "/privacy-policies/country-rules", group: recordGroups.privacyPolicyEngine, type: "country_privacy_rules", operationId: "createCountryPrivacyRulesRecord", summary: "Create a country privacy rules record" },
  { method: "POST", path: "/privacy-policies/regional-rules", group: recordGroups.privacyPolicyEngine, type: "regional_privacy_rules", operationId: "createRegionalPrivacyRulesRecord", summary: "Create a regional privacy rules record" },
  { method: "POST", path: "/privacy-policies/organization-rules", group: recordGroups.privacyPolicyEngine, type: "organization_privacy_rules", operationId: "createOrganizationPrivacyRulesRecord", summary: "Create an organization privacy rules record" },
  { method: "POST", path: "/privacy-policies/purpose-access", group: recordGroups.privacyPolicyEngine, type: "purpose_based_access_control", operationId: "createPurposeBasedAccessRecord", summary: "Create a purpose-based access control record" },
  { method: "POST", path: "/privacy-policies/minimization-rules", group: recordGroups.privacyPolicyEngine, type: "data_minimization_rules", operationId: "createDataMinimizationRulesRecord", summary: "Create a data minimization rules record" },
  { method: "POST", path: "/privacy-policies/retention", group: recordGroups.privacyPolicyEngine, type: "retention_policy_enforcement", operationId: "createRetentionPolicyEnforcementRecord", summary: "Create a retention policy enforcement record" },
  { method: "POST", path: "/privacy-policies/exceptions", group: recordGroups.privacyPolicyEngine, type: "privacy_exception_workflow", operationId: "createPrivacyExceptionWorkflowRecord", summary: "Create a privacy exception workflow record" },

  { method: "POST", path: "/data-sharing/agreements", group: recordGroups.dataSharingGovernance, type: "data_sharing_agreements", operationId: "createDataSharingAgreementRecord", summary: "Create a data sharing agreement record" },
  { method: "POST", path: "/data-sharing/purposes", group: recordGroups.dataSharingGovernance, type: "sharing_purpose_registry", operationId: "createSharingPurposeRecord", summary: "Create a sharing purpose registry record" },
  { method: "POST", path: "/data-sharing/approvals", group: recordGroups.dataSharingGovernance, type: "sharing_approval_workflow", operationId: "createSharingApprovalRecord", summary: "Create a data sharing approval workflow record" },
  { method: "POST", path: "/data-sharing/cross-organization", group: recordGroups.dataSharingGovernance, type: "cross_organization_sharing_controls", operationId: "createCrossOrganizationSharingRecord", summary: "Create a cross-organization sharing controls record" },
  { method: "POST", path: "/data-sharing/cross-border", group: recordGroups.dataSharingGovernance, type: "cross_border_sharing_controls", operationId: "createCrossBorderSharingRecord", summary: "Create a cross-border sharing controls record" },
  { method: "POST", path: "/data-sharing/research", group: recordGroups.dataSharingGovernance, type: "research_sharing_controls", operationId: "createResearchSharingControlsRecord", summary: "Create a research sharing controls record" },
  { method: "POST", path: "/data-sharing/ai-data-use", group: recordGroups.dataSharingGovernance, type: "ai_data_use_controls", operationId: "createAiDataUseControlsRecord", summary: "Create an AI data use controls record" },

  { method: "POST", path: "/trust/registries", group: recordGroups.trustPlatform, type: "trust_registry", operationId: "createTrustRegistryRecord", summary: "Create a trust registry record" },
  { method: "POST", path: "/trust/organization-profiles", group: recordGroups.trustPlatform, type: "organization_trust_profiles", operationId: "createOrganizationTrustProfileRecord", summary: "Create an organization trust profile record" },
  { method: "POST", path: "/trust/data-processors", group: recordGroups.trustPlatform, type: "data_processor_registry", operationId: "createDataProcessorRecord", summary: "Create a data processor registry record" },
  { method: "POST", path: "/trust/data-controllers", group: recordGroups.trustPlatform, type: "data_controller_registry", operationId: "createDataControllerRecord", summary: "Create a data controller registry record" },
  { method: "POST", path: "/trust/trusted-partners", group: recordGroups.trustPlatform, type: "trusted_partner_registry", operationId: "createTrustedPartnerRecord", summary: "Create a trusted partner registry record" },
  { method: "POST", path: "/trust/verification", group: recordGroups.trustPlatform, type: "trust_verification_workflow", operationId: "createTrustVerificationRecord", summary: "Create a trust verification workflow record" },
  { method: "POST", path: "/trust/expirations", group: recordGroups.trustPlatform, type: "trust_expiration_tracking", operationId: "createTrustExpirationRecord", summary: "Create a trust expiration tracking record" },

  { method: "POST", path: "/monitoring/dashboards", group: recordGroups.privacyMonitoring, type: "privacy_dashboard", operationId: "createPrivacyDashboardRecord", summary: "Create a privacy dashboard record" },
  { method: "POST", path: "/monitoring/data-access", group: recordGroups.privacyMonitoring, type: "data_access_monitoring", operationId: "createDataAccessMonitoringRecord", summary: "Create a data access monitoring record" },
  { method: "POST", path: "/monitoring/consent-violations", group: recordGroups.privacyMonitoring, type: "consent_violation_detection", operationId: "createConsentViolationDetectionRecord", summary: "Create a consent violation detection record" },
  { method: "POST", path: "/monitoring/policy-violations", group: recordGroups.privacyMonitoring, type: "policy_violation_detection", operationId: "createPolicyViolationDetectionRecord", summary: "Create a policy violation detection record" },
  { method: "POST", path: "/monitoring/data-sharing", group: recordGroups.privacyMonitoring, type: "data_sharing_monitoring", operationId: "createDataSharingMonitoringRecord", summary: "Create a data sharing monitoring record" },
  { method: "POST", path: "/monitoring/incidents", group: recordGroups.privacyMonitoring, type: "privacy_incident_registry", operationId: "createPrivacyIncidentRecord", summary: "Create a privacy incident registry record" },
  { method: "POST", path: "/monitoring/risk-dashboard", group: recordGroups.privacyMonitoring, type: "privacy_risk_dashboard", operationId: "createPrivacyRiskDashboardRecord", summary: "Create a privacy risk dashboard record" }
]);

export const routeByFullPath = new Map(routeDefinitions.map((route) => [route.path, route]));
