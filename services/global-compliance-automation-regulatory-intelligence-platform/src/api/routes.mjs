import { recordGroups } from "../domain/compliance-domain.mjs";

export const routeDefinitions = Object.freeze([
  { method: "POST", path: "/regulatory/frameworks", group: recordGroups.regulatoryIntelligence, type: "regulatory_framework_registry", operationId: "createRegulatoryFrameworkRecord", summary: "Create a regulatory framework registry record" },
  { method: "POST", path: "/regulatory/countries", group: recordGroups.regulatoryIntelligence, type: "country_regulatory_registry", operationId: "createCountryRegulatoryRecord", summary: "Create a country regulatory registry record" },
  { method: "POST", path: "/regulatory/regions", group: recordGroups.regulatoryIntelligence, type: "regional_regulatory_registry", operationId: "createRegionalRegulatoryRecord", summary: "Create a regional regulatory registry record" },
  { method: "POST", path: "/regulatory/healthcare-regulations", group: recordGroups.regulatoryIntelligence, type: "healthcare_regulation_registry", operationId: "createHealthcareRegulationRecord", summary: "Create a healthcare regulation registry record" },
  { method: "POST", path: "/regulatory/requirement-mappings", group: recordGroups.regulatoryIntelligence, type: "regulatory_requirement_mapping", operationId: "createRegulatoryRequirementMappingRecord", summary: "Create a regulatory requirement mapping record" },
  { method: "POST", path: "/regulatory/change-tracking", group: recordGroups.regulatoryIntelligence, type: "regulatory_change_tracking", operationId: "createRegulatoryChangeTrackingRecord", summary: "Create a regulatory change tracking record" },
  { method: "POST", path: "/regulatory/impact-assessments", group: recordGroups.regulatoryIntelligence, type: "regulatory_impact_assessment", operationId: "createRegulatoryImpactAssessmentRecord", summary: "Create a regulatory impact assessment record" },
  { method: "POST", path: "/regulatory/calendar", group: recordGroups.regulatoryIntelligence, type: "regulatory_calendar", operationId: "createRegulatoryCalendarRecord", summary: "Create a regulatory calendar record" },

  { method: "POST", path: "/compliance/rules", group: recordGroups.complianceAutomation, type: "compliance_rules_engine", operationId: "createComplianceRuleRecord", summary: "Create a compliance rules engine record" },
  { method: "POST", path: "/compliance/checklists", group: recordGroups.complianceAutomation, type: "compliance_checklist_automation", operationId: "createComplianceChecklistRecord", summary: "Create a compliance checklist automation record" },
  { method: "POST", path: "/compliance/evidence-collection", group: recordGroups.complianceAutomation, type: "evidence_collection", operationId: "createEvidenceCollectionRecord", summary: "Create an evidence collection record" },
  { method: "POST", path: "/compliance/evidence-validation", group: recordGroups.complianceAutomation, type: "evidence_validation", operationId: "createEvidenceValidationRecord", summary: "Create an evidence validation record" },
  { method: "POST", path: "/compliance/status", group: recordGroups.complianceAutomation, type: "compliance_status_tracking", operationId: "createComplianceStatusRecord", summary: "Create a compliance status tracking record" },
  { method: "POST", path: "/compliance/gaps", group: recordGroups.complianceAutomation, type: "compliance_gap_detection", operationId: "createComplianceGapRecord", summary: "Create a compliance gap detection record" },
  { method: "POST", path: "/compliance/remediation", group: recordGroups.complianceAutomation, type: "compliance_remediation_workflow", operationId: "createComplianceRemediationRecord", summary: "Create a compliance remediation workflow record" },
  { method: "POST", path: "/compliance/dashboard", group: recordGroups.complianceAutomation, type: "compliance_dashboard", operationId: "createComplianceDashboardRecord", summary: "Create a compliance dashboard record" },

  { method: "POST", path: "/audits/plans", group: recordGroups.auditManagement, type: "audit_plan_registry", operationId: "createAuditPlanRecord", summary: "Create an audit plan registry record" },
  { method: "POST", path: "/audits/schedules", group: recordGroups.auditManagement, type: "audit_schedule", operationId: "createAuditScheduleRecord", summary: "Create an audit schedule record" },
  { method: "POST", path: "/audits/scopes", group: recordGroups.auditManagement, type: "audit_scope_management", operationId: "createAuditScopeRecord", summary: "Create an audit scope management record" },
  { method: "POST", path: "/audits/evidence", group: recordGroups.auditManagement, type: "audit_evidence_repository", operationId: "createAuditEvidenceRecord", summary: "Create an audit evidence repository record" },
  { method: "POST", path: "/audits/findings", group: recordGroups.auditManagement, type: "audit_findings", operationId: "createAuditFindingRecord", summary: "Create an audit findings record" },
  { method: "POST", path: "/audits/corrective-actions", group: recordGroups.auditManagement, type: "corrective_action_plans", operationId: "createCorrectiveActionPlanRecord", summary: "Create a corrective action plan record" },
  { method: "POST", path: "/audits/closures", group: recordGroups.auditManagement, type: "audit_closure_workflow", operationId: "createAuditClosureRecord", summary: "Create an audit closure workflow record" },
  { method: "POST", path: "/audits/history", group: recordGroups.auditManagement, type: "audit_history", operationId: "createAuditHistoryRecord", summary: "Create an audit history record" },

  { method: "POST", path: "/certifications/registries", group: recordGroups.certificationManagement, type: "certification_registry", operationId: "createCertificationRecord", summary: "Create a certification registry record" },
  { method: "POST", path: "/certifications/requirements", group: recordGroups.certificationManagement, type: "certification_requirements", operationId: "createCertificationRequirementRecord", summary: "Create a certification requirements record" },
  { method: "POST", path: "/certifications/evidence", group: recordGroups.certificationManagement, type: "certification_evidence", operationId: "createCertificationEvidenceRecord", summary: "Create a certification evidence record" },
  { method: "POST", path: "/certifications/renewals", group: recordGroups.certificationManagement, type: "certification_renewal_tracking", operationId: "createCertificationRenewalRecord", summary: "Create a certification renewal tracking record" },
  { method: "POST", path: "/certifications/expiration-alerts", group: recordGroups.certificationManagement, type: "certification_expiration_alerts", operationId: "createCertificationExpirationAlertRecord", summary: "Create a certification expiration alert record" },
  { method: "POST", path: "/certifications/readiness-dashboard", group: recordGroups.certificationManagement, type: "certification_readiness_dashboard", operationId: "createCertificationReadinessRecord", summary: "Create a certification readiness dashboard record" },

  { method: "POST", path: "/policies/compliance-mappings", group: recordGroups.policyCompliance, type: "policy_compliance_mapping", operationId: "createPolicyComplianceMappingRecord", summary: "Create a policy compliance mapping record" },
  { method: "POST", path: "/policies/attestations", group: recordGroups.policyCompliance, type: "policy_attestation", operationId: "createPolicyAttestationRecord", summary: "Create a policy attestation record" },
  { method: "POST", path: "/policies/exceptions", group: recordGroups.policyCompliance, type: "policy_exception_management", operationId: "createPolicyExceptionRecord", summary: "Create a policy exception management record" },
  { method: "POST", path: "/policies/violations", group: recordGroups.policyCompliance, type: "policy_violation_tracking", operationId: "createPolicyViolationRecord", summary: "Create a policy violation tracking record" },
  { method: "POST", path: "/policies/reviews", group: recordGroups.policyCompliance, type: "compliance_review_workflow", operationId: "createComplianceReviewRecord", summary: "Create a compliance review workflow record" },
  { method: "POST", path: "/policies/dashboard", group: recordGroups.policyCompliance, type: "policy_compliance_dashboard", operationId: "createPolicyComplianceDashboardRecord", summary: "Create a policy compliance dashboard record" },

  { method: "POST", path: "/reports/templates", group: recordGroups.regulatoryReporting, type: "regulatory_report_templates", operationId: "createRegulatoryReportTemplateRecord", summary: "Create a regulatory report template record" },
  { method: "POST", path: "/reports/generation", group: recordGroups.regulatoryReporting, type: "report_generation", operationId: "createReportGenerationRecord", summary: "Create a report generation record" },
  { method: "POST", path: "/reports/reviews", group: recordGroups.regulatoryReporting, type: "report_review_workflow", operationId: "createReportReviewRecord", summary: "Create a report review workflow record" },
  { method: "POST", path: "/reports/submissions", group: recordGroups.regulatoryReporting, type: "report_submission_tracking", operationId: "createReportSubmissionRecord", summary: "Create a report submission tracking record" },
  { method: "POST", path: "/reports/approvals", group: recordGroups.regulatoryReporting, type: "report_approval_workflow", operationId: "createReportApprovalRecord", summary: "Create a report approval workflow record" },
  { method: "POST", path: "/reports/history", group: recordGroups.regulatoryReporting, type: "report_history", operationId: "createReportHistoryRecord", summary: "Create a report history record" },
  { method: "POST", path: "/reports/correspondence", group: recordGroups.regulatoryReporting, type: "regulatory_correspondence_registry", operationId: "createRegulatoryCorrespondenceRecord", summary: "Create a regulatory correspondence registry record" }
]);

export const routeByFullPath = new Map(routeDefinitions.map((route) => [route.path, route]));
