export const SERVICE_NAME = "global-enterprise-data-privacy-consent-trust-platform";
export const API_VERSION = "v3";
export const API_BASE_PATH = "/api/v3/global-privacy";

export const recordGroups = Object.freeze({
  globalConsent: "global_consent",
  patientDataRights: "patient_data_rights",
  privacyPolicyEngine: "privacy_policy_engine",
  dataSharingGovernance: "data_sharing_governance",
  trustPlatform: "trust_platform",
  privacyMonitoring: "privacy_monitoring"
});

export const globalConsentTypes = Object.freeze([
  "consent_registry",
  "consent_lifecycle",
  "consent_capture",
  "consent_withdrawal",
  "consent_expiration",
  "consent_versioning",
  "consent_scope_management",
  "consent_audit_trail"
]);

export const patientDataRightsTypes = Object.freeze([
  "data_access_requests",
  "data_correction_requests",
  "data_export_requests",
  "data_deletion_requests",
  "data_restriction_requests",
  "data_portability",
  "request_review_workflow",
  "request_fulfillment_tracking"
]);

export const privacyPolicyEngineTypes = Object.freeze([
  "privacy_policy_registry",
  "country_privacy_rules",
  "regional_privacy_rules",
  "organization_privacy_rules",
  "purpose_based_access_control",
  "data_minimization_rules",
  "retention_policy_enforcement",
  "privacy_exception_workflow"
]);

export const dataSharingGovernanceTypes = Object.freeze([
  "data_sharing_agreements",
  "sharing_purpose_registry",
  "sharing_approval_workflow",
  "cross_organization_sharing_controls",
  "cross_border_sharing_controls",
  "research_sharing_controls",
  "ai_data_use_controls"
]);

export const trustPlatformTypes = Object.freeze([
  "trust_registry",
  "organization_trust_profiles",
  "data_processor_registry",
  "data_controller_registry",
  "trusted_partner_registry",
  "trust_verification_workflow",
  "trust_expiration_tracking"
]);

export const privacyMonitoringTypes = Object.freeze([
  "privacy_dashboard",
  "data_access_monitoring",
  "consent_violation_detection",
  "policy_violation_detection",
  "data_sharing_monitoring",
  "privacy_incident_registry",
  "privacy_risk_dashboard"
]);

export const recordTypesByGroup = Object.freeze({
  [recordGroups.globalConsent]: globalConsentTypes,
  [recordGroups.patientDataRights]: patientDataRightsTypes,
  [recordGroups.privacyPolicyEngine]: privacyPolicyEngineTypes,
  [recordGroups.dataSharingGovernance]: dataSharingGovernanceTypes,
  [recordGroups.trustPlatform]: trustPlatformTypes,
  [recordGroups.privacyMonitoring]: privacyMonitoringTypes
});

export const privacyStatuses = Object.freeze([
  "draft",
  "registered",
  "active",
  "captured",
  "updated",
  "withdrawn",
  "expired",
  "requested",
  "under_review",
  "approved",
  "rejected",
  "completed",
  "fulfilled",
  "restricted",
  "enforced",
  "exception_requested",
  "verified",
  "detected",
  "open",
  "closed",
  "monitoring"
]);

export const integrationSources = Object.freeze([
  "foundation_platform",
  "security_platform",
  "compliance_platform",
  "global_healthcare_platform",
  "federated_platform",
  "research_platform",
  "patient_portal_platform",
  "ai_assurance_platform",
  "audit_service",
  "notification_service"
]);

export const requiredEvents = Object.freeze([
  "consent.created",
  "consent.updated",
  "consent.withdrawn",
  "data.access.requested",
  "data.export.completed",
  "privacy.policy.updated",
  "data.sharing.approved",
  "privacy.violation.detected",
  "trust.relationship.created",
  "trust.relationship.expired"
]);

export const permissions = Object.freeze({
  consentWrite: "global_privacy.consent.write",
  dataRightsWrite: "global_privacy.data_rights.write",
  policyWrite: "global_privacy.policy.write",
  sharingWrite: "global_privacy.sharing.write",
  trustWrite: "global_privacy.trust.write",
  monitoringWrite: "global_privacy.monitoring.write",
  integrationWrite: "global_privacy.integration.write"
});

export const permissionsByGroup = Object.freeze({
  [recordGroups.globalConsent]: permissions.consentWrite,
  [recordGroups.patientDataRights]: permissions.dataRightsWrite,
  [recordGroups.privacyPolicyEngine]: permissions.policyWrite,
  [recordGroups.dataSharingGovernance]: permissions.sharingWrite,
  [recordGroups.trustPlatform]: permissions.trustWrite,
  [recordGroups.privacyMonitoring]: permissions.monitoringWrite
});

export const prohibitedPolicyBoundaryPhrases = Object.freeze([
  "autonomous diagnosis",
  "autonomous treatment",
  "diagnose without clinician",
  "treat without clinician",
  "prescribe without approval",
  "replace clinician judgement",
  "automatic clinical decision",
  "treatment recommendation",
  "clinical decision recommendation",
  "share outside policy",
  "process outside policy",
  "expose outside policy",
  "bypass consent",
  "ignore consent",
  "bypass data residency",
  "disable audit",
  "unaudited sharing",
  "unrestricted cross border"
]);

export function isKnownGroup(recordGroup) {
  return Object.values(recordGroups).includes(recordGroup);
}

export function isKnownRecordType(recordGroup, recordType) {
  return Boolean(recordTypesByGroup[recordGroup]?.includes(recordType));
}

export function derivePrivacyEventType(record) {
  if (record.recordType === "consent_capture" || record.recordType === "consent_registry") {
    return "consent.created";
  }
  if (record.recordType === "consent_withdrawal" || record.status === "withdrawn") {
    return "consent.withdrawn";
  }
  if (record.recordType === "data_access_requests") {
    return "data.access.requested";
  }
  if (record.recordType === "data_export_requests" && (record.status === "completed" || record.status === "fulfilled")) {
    return "data.export.completed";
  }
  if (record.recordGroup === recordGroups.privacyPolicyEngine) {
    return "privacy.policy.updated";
  }
  if (record.recordType === "sharing_approval_workflow" && record.status === "approved") {
    return "data.sharing.approved";
  }
  if (record.recordType === "cross_border_sharing_controls" && record.status === "approved") {
    return "data.sharing.approved";
  }
  if (record.recordType === "consent_violation_detection" || record.recordType === "policy_violation_detection" || record.recordType === "privacy_incident_registry") {
    return "privacy.violation.detected";
  }
  if (record.recordType === "trust_expiration_tracking" || record.status === "expired") {
    return "trust.relationship.expired";
  }
  if (record.recordGroup === recordGroups.trustPlatform) {
    return "trust.relationship.created";
  }
  return "consent.updated";
}

export function permissionAllows(grantedPermissions, requiredPermission) {
  const granted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
  if (granted.includes(requiredPermission) || granted.includes("global_privacy.*") || granted.includes("*")) {
    return true;
  }
  const namespace = requiredPermission.split(".").slice(0, -1).join(".");
  return granted.includes(`${namespace}.*`);
}

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}
