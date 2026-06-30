import { recordGroups } from "../domain/workforce-domain.mjs";

export const routeDefinitions = Object.freeze([
  { method: "POST", path: "/workforce/staff", group: recordGroups.workforceManagement, type: "staff_registry", operationId: "createStaffRegistryRecord", summary: "Create or update a staff registry record" },
  { method: "POST", path: "/workforce/employees", group: recordGroups.workforceManagement, type: "employee_profile", operationId: "createEmployeeProfileRecord", summary: "Create or update an employee profile record" },
  { method: "POST", path: "/workforce/departments", group: recordGroups.workforceManagement, type: "department_assignment", operationId: "createDepartmentAssignmentRecord", summary: "Create a department assignment record" },
  { method: "POST", path: "/workforce/roles", group: recordGroups.workforceManagement, type: "role_assignment", operationId: "createRoleAssignmentRecord", summary: "Create a role assignment record" },
  { method: "POST", path: "/workforce/availability", group: recordGroups.workforceManagement, type: "staff_availability", operationId: "createStaffAvailabilityRecord", summary: "Create a staff availability record" },
  { method: "POST", path: "/workforce/schedules", group: recordGroups.workforceManagement, type: "staff_scheduling", operationId: "createStaffSchedulingRecord", summary: "Create a governed staff scheduling record" },
  { method: "POST", path: "/workforce/shifts", group: recordGroups.workforceManagement, type: "shift_management", operationId: "createShiftManagementRecord", summary: "Create a shift management record" },
  { method: "POST", path: "/workforce/leave", group: recordGroups.workforceManagement, type: "leave_management", operationId: "createLeaveManagementRecord", summary: "Create a leave management record" },
  { method: "POST", path: "/workforce/attendance", group: recordGroups.workforceManagement, type: "attendance_tracking", operationId: "createAttendanceTrackingRecord", summary: "Create an attendance tracking record" },

  { method: "POST", path: "/credentialing/provider-credentials", group: recordGroups.clinicalCredentialing, type: "provider_credential_registry", operationId: "createProviderCredentialRecord", summary: "Create a provider credential registry record" },
  { method: "POST", path: "/credentialing/licenses", group: recordGroups.clinicalCredentialing, type: "license_management", operationId: "createLicenseManagementRecord", summary: "Create a license management record" },
  { method: "POST", path: "/credentialing/certifications", group: recordGroups.clinicalCredentialing, type: "certification_tracking", operationId: "createCertificationTrackingRecord", summary: "Create a certification tracking record" },
  { method: "POST", path: "/credentialing/privileges", group: recordGroups.clinicalCredentialing, type: "privilege_management", operationId: "createPrivilegeManagementRecord", summary: "Create a privilege management record" },
  { method: "POST", path: "/credentialing/scope-of-practice", group: recordGroups.clinicalCredentialing, type: "scope_of_practice", operationId: "createScopeOfPracticeRecord", summary: "Create a scope of practice record" },
  { method: "POST", path: "/credentialing/expirations", group: recordGroups.clinicalCredentialing, type: "credential_expiration_tracking", operationId: "createCredentialExpirationRecord", summary: "Create a credential expiration tracking record" },
  { method: "POST", path: "/credentialing/verifications", group: recordGroups.clinicalCredentialing, type: "credential_verification_workflow", operationId: "createCredentialVerificationRecord", summary: "Create a credential verification workflow record" },
  { method: "POST", path: "/credentialing/committee-reviews", group: recordGroups.clinicalCredentialing, type: "credentialing_committee_review", operationId: "createCredentialingCommitteeReviewRecord", summary: "Create a credentialing committee review record" },

  { method: "POST", path: "/planning/staffing-demand", group: recordGroups.workforcePlanning, type: "staffing_demand_planning", operationId: "createStaffingDemandPlanningRecord", summary: "Create a staffing demand planning record" },
  { method: "POST", path: "/planning/workforce-capacity", group: recordGroups.workforcePlanning, type: "workforce_capacity_planning", operationId: "createWorkforceCapacityPlanningRecord", summary: "Create a workforce capacity planning record" },
  { method: "POST", path: "/planning/department-requirements", group: recordGroups.workforcePlanning, type: "department_staffing_requirements", operationId: "createDepartmentStaffingRequirementsRecord", summary: "Create a department staffing requirements record" },
  { method: "POST", path: "/planning/shift-coverage", group: recordGroups.workforcePlanning, type: "shift_coverage_monitoring", operationId: "createShiftCoverageMonitoringRecord", summary: "Create a shift coverage monitoring record" },
  { method: "POST", path: "/planning/overtime", group: recordGroups.workforcePlanning, type: "overtime_tracking", operationId: "createOvertimeTrackingRecord", summary: "Create an overtime tracking record" },
  { method: "POST", path: "/planning/staff-utilization", group: recordGroups.workforcePlanning, type: "staff_utilization_dashboard", operationId: "createStaffUtilizationDashboardRecord", summary: "Create a staff utilization dashboard record" },
  { method: "POST", path: "/planning/forecasts", group: recordGroups.workforcePlanning, type: "workforce_forecasting", operationId: "createWorkforceForecastingRecord", summary: "Create a workforce forecasting record" },

  { method: "POST", path: "/staff-experience/portal", group: recordGroups.staffExperience, type: "staff_portal", operationId: "createStaffPortalRecord", summary: "Create a staff portal record" },
  { method: "POST", path: "/staff-experience/shift-preferences", group: recordGroups.staffExperience, type: "shift_preferences", operationId: "createShiftPreferencesRecord", summary: "Create a shift preferences record" },
  { method: "POST", path: "/staff-experience/notifications", group: recordGroups.staffExperience, type: "staff_notifications", operationId: "createStaffNotificationRecord", summary: "Create a staff notification record" },
  { method: "POST", path: "/staff-experience/training-assignments", group: recordGroups.staffExperience, type: "training_assignments", operationId: "createTrainingAssignmentRecord", summary: "Create a training assignment record" },
  { method: "POST", path: "/staff-experience/performance-feedback", group: recordGroups.staffExperience, type: "performance_feedback", operationId: "createPerformanceFeedbackRecord", summary: "Create a performance feedback record" },
  { method: "POST", path: "/staff-experience/incidents", group: recordGroups.staffExperience, type: "incident_reporting", operationId: "createStaffIncidentRecord", summary: "Create a staff incident reporting record" },
  { method: "POST", path: "/staff-experience/wellbeing", group: recordGroups.staffExperience, type: "staff_wellbeing_registry", operationId: "createStaffWellbeingRecord", summary: "Create a staff wellbeing registry record" },
  { method: "POST", path: "/staff-experience/satisfaction-surveys", group: recordGroups.staffExperience, type: "staff_satisfaction_surveys", operationId: "createStaffSatisfactionSurveyRecord", summary: "Create a staff satisfaction survey record" },

  { method: "POST", path: "/hr/recruitment-pipeline", group: recordGroups.hrOperations, type: "recruitment_pipeline", operationId: "createRecruitmentPipelineRecord", summary: "Create a recruitment pipeline record" },
  { method: "POST", path: "/hr/onboarding", group: recordGroups.hrOperations, type: "onboarding_workflow", operationId: "createOnboardingWorkflowRecord", summary: "Create an onboarding workflow record" },
  { method: "POST", path: "/hr/contracts", group: recordGroups.hrOperations, type: "contract_management", operationId: "createHrContractRecord", summary: "Create an HR contract management record" },
  { method: "POST", path: "/hr/performance-reviews", group: recordGroups.hrOperations, type: "performance_review", operationId: "createPerformanceReviewRecord", summary: "Create a performance review record" },
  { method: "POST", path: "/hr/disciplinary-actions", group: recordGroups.hrOperations, type: "disciplinary_actions", operationId: "createDisciplinaryActionRecord", summary: "Create a disciplinary action record" },
  { method: "POST", path: "/hr/documents", group: recordGroups.hrOperations, type: "hr_documents", operationId: "createHrDocumentRecord", summary: "Create an HR document record" },
  { method: "POST", path: "/hr/payroll-integration", group: recordGroups.hrOperations, type: "payroll_integration_interface", operationId: "createPayrollIntegrationRecord", summary: "Create a payroll integration interface record" },
  { method: "POST", path: "/hr/exit-workflows", group: recordGroups.hrOperations, type: "exit_workflow", operationId: "createExitWorkflowRecord", summary: "Create an exit workflow record" },

  { method: "POST", path: "/compliance/mandatory-training", group: recordGroups.compliance, type: "mandatory_training_compliance", operationId: "createMandatoryTrainingComplianceRecord", summary: "Create a mandatory training compliance record" },
  { method: "POST", path: "/compliance/credentials", group: recordGroups.compliance, type: "credential_compliance", operationId: "createCredentialComplianceRecord", summary: "Create a credential compliance record" },
  { method: "POST", path: "/compliance/occupational-health", group: recordGroups.compliance, type: "occupational_health_compliance", operationId: "createOccupationalHealthComplianceRecord", summary: "Create an occupational health compliance record" },
  { method: "POST", path: "/compliance/vaccination", group: recordGroups.compliance, type: "vaccination_compliance", operationId: "createVaccinationComplianceRecord", summary: "Create a vaccination compliance record" },
  { method: "POST", path: "/compliance/background-checks", group: recordGroups.compliance, type: "background_check_tracking", operationId: "createBackgroundCheckRecord", summary: "Create a background check tracking record" },
  { method: "POST", path: "/compliance/audit-trails", group: recordGroups.compliance, type: "staff_audit_trail", operationId: "createStaffAuditTrailRecord", summary: "Create a staff audit trail record" },
  { method: "POST", path: "/compliance/dashboard", group: recordGroups.compliance, type: "workforce_compliance_dashboard", operationId: "createWorkforceComplianceDashboardRecord", summary: "Create a workforce compliance dashboard record" }
]);

export const routeByFullPath = new Map(routeDefinitions.map((route) => [route.path, route]));
