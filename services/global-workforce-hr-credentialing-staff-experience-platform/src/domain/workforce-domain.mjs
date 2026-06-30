export const SERVICE_NAME = "global-workforce-hr-credentialing-staff-experience-platform";
export const API_VERSION = "v3";
export const API_BASE_PATH = "/api/v3/global-workforce";

export const recordGroups = Object.freeze({
  workforceManagement: "workforce_management",
  clinicalCredentialing: "clinical_credentialing",
  workforcePlanning: "workforce_planning",
  staffExperience: "staff_experience",
  hrOperations: "hr_operations",
  compliance: "compliance"
});

export const workforceManagementTypes = Object.freeze([
  "staff_registry",
  "employee_profile",
  "department_assignment",
  "role_assignment",
  "staff_availability",
  "staff_scheduling",
  "shift_management",
  "leave_management",
  "attendance_tracking"
]);

export const clinicalCredentialingTypes = Object.freeze([
  "provider_credential_registry",
  "license_management",
  "certification_tracking",
  "privilege_management",
  "scope_of_practice",
  "credential_expiration_tracking",
  "credential_verification_workflow",
  "credentialing_committee_review"
]);

export const workforcePlanningTypes = Object.freeze([
  "staffing_demand_planning",
  "workforce_capacity_planning",
  "department_staffing_requirements",
  "shift_coverage_monitoring",
  "overtime_tracking",
  "staff_utilization_dashboard",
  "workforce_forecasting"
]);

export const staffExperienceTypes = Object.freeze([
  "staff_portal",
  "shift_preferences",
  "staff_notifications",
  "training_assignments",
  "performance_feedback",
  "incident_reporting",
  "staff_wellbeing_registry",
  "staff_satisfaction_surveys"
]);

export const hrOperationsTypes = Object.freeze([
  "recruitment_pipeline",
  "onboarding_workflow",
  "contract_management",
  "performance_review",
  "disciplinary_actions",
  "hr_documents",
  "payroll_integration_interface",
  "exit_workflow"
]);

export const complianceTypes = Object.freeze([
  "mandatory_training_compliance",
  "credential_compliance",
  "occupational_health_compliance",
  "vaccination_compliance",
  "background_check_tracking",
  "staff_audit_trail",
  "workforce_compliance_dashboard"
]);

export const recordTypesByGroup = Object.freeze({
  [recordGroups.workforceManagement]: workforceManagementTypes,
  [recordGroups.clinicalCredentialing]: clinicalCredentialingTypes,
  [recordGroups.workforcePlanning]: workforcePlanningTypes,
  [recordGroups.staffExperience]: staffExperienceTypes,
  [recordGroups.hrOperations]: hrOperationsTypes,
  [recordGroups.compliance]: complianceTypes
});

export const workforceStatuses = Object.freeze([
  "draft",
  "registered",
  "active",
  "assigned",
  "available",
  "scheduled",
  "requested",
  "approved",
  "verified",
  "expired",
  "completed",
  "under_review",
  "compliant",
  "non_compliant",
  "closed",
  "updated"
]);

export const integrationSources = Object.freeze([
  "foundation_platform",
  "security_platform",
  "scheduling_platform",
  "nursing_platform",
  "education_platform",
  "quality_platform",
  "enterprise_platform",
  "analytics_platform",
  "audit_service",
  "notification_service"
]);

export const requiredEvents = Object.freeze([
  "staff.created",
  "staff.updated",
  "credential.created",
  "credential.verified",
  "credential.expired",
  "shift.assigned",
  "shift.completed",
  "leave.requested",
  "leave.approved",
  "training.assigned",
  "compliance.updated"
]);

export const permissions = Object.freeze({
  workforceWrite: "global_workforce.workforce.write",
  credentialingWrite: "global_workforce.credentialing.write",
  planningWrite: "global_workforce.planning.write",
  staffExperienceWrite: "global_workforce.staff_experience.write",
  hrWrite: "global_workforce.hr.write",
  complianceWrite: "global_workforce.compliance.write",
  integrationWrite: "global_workforce.integration.write"
});

export const permissionsByGroup = Object.freeze({
  [recordGroups.workforceManagement]: permissions.workforceWrite,
  [recordGroups.clinicalCredentialing]: permissions.credentialingWrite,
  [recordGroups.workforcePlanning]: permissions.planningWrite,
  [recordGroups.staffExperience]: permissions.staffExperienceWrite,
  [recordGroups.hrOperations]: permissions.hrWrite,
  [recordGroups.compliance]: permissions.complianceWrite
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

export function deriveWorkforceEventType(record) {
  if (record.recordType === "staff_registry" && record.status === "registered") {
    return "staff.created";
  }
  if (record.recordType === "employee_profile" || record.recordType === "staff_registry") {
    return "staff.updated";
  }
  if (record.recordType === "provider_credential_registry") {
    return "credential.created";
  }
  if (record.recordType === "credential_verification_workflow") {
    return "credential.verified";
  }
  if (record.recordType === "credential_expiration_tracking" || record.status === "expired") {
    return "credential.expired";
  }
  if (record.recordType === "staff_scheduling" || (record.recordType === "shift_management" && record.status === "assigned")) {
    return "shift.assigned";
  }
  if (record.recordType === "attendance_tracking" || (record.recordType === "shift_management" && record.status === "completed")) {
    return "shift.completed";
  }
  if (record.recordType === "leave_management" && record.status === "approved") {
    return "leave.approved";
  }
  if (record.recordType === "leave_management") {
    return "leave.requested";
  }
  if (record.recordType === "training_assignments") {
    return "training.assigned";
  }
  if (record.recordGroup === recordGroups.compliance) {
    return "compliance.updated";
  }
  return "staff.updated";
}

export function permissionAllows(grantedPermissions, requiredPermission) {
  const granted = Array.isArray(grantedPermissions) ? grantedPermissions : [];
  if (granted.includes(requiredPermission) || granted.includes("global_workforce.*") || granted.includes("*")) {
    return true;
  }
  const namespace = requiredPermission.split(".").slice(0, -1).join(".");
  return granted.includes(`${namespace}.*`);
}

export function nowIso(clock = () => new Date()) {
  return clock().toISOString();
}
