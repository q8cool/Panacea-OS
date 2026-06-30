import { recordGroups } from "../domain/legal-domain.mjs";

export const routeDefinitions = Object.freeze([
  { method: "POST", path: "/legal/matters", group: recordGroups.legalManagement, type: "legal_matter_registry", operationId: "createLegalMatterRecord", summary: "Create a legal matter registry record" },
  { method: "POST", path: "/legal/cases", group: recordGroups.legalManagement, type: "legal_case_management", operationId: "createLegalCaseRecord", summary: "Create a legal case management record" },
  { method: "POST", path: "/legal/documents", group: recordGroups.legalManagement, type: "legal_document_registry", operationId: "createLegalDocumentRecord", summary: "Create a legal document registry record" },
  { method: "POST", path: "/legal/reviews", group: recordGroups.legalManagement, type: "legal_review_workflow", operationId: "createLegalReviewRecord", summary: "Create a legal review workflow record" },
  { method: "POST", path: "/legal/approvals", group: recordGroups.legalManagement, type: "legal_approval_workflow", operationId: "createLegalApprovalRecord", summary: "Create a legal approval workflow record" },
  { method: "POST", path: "/legal/risk-registers", group: recordGroups.legalManagement, type: "legal_risk_register", operationId: "createLegalRiskRegisterRecord", summary: "Create a legal risk register record" },
  { method: "POST", path: "/legal/calendar", group: recordGroups.legalManagement, type: "legal_calendar", operationId: "createLegalCalendarRecord", summary: "Create a legal calendar record" },
  { method: "POST", path: "/legal/audit-trails", group: recordGroups.legalManagement, type: "legal_audit_trail", operationId: "createLegalAuditTrailRecord", summary: "Create a legal audit trail record" },

  { method: "POST", path: "/contracts/registries", group: recordGroups.contractManagement, type: "contract_registry", operationId: "createContractRecord", summary: "Create a contract registry record" },
  { method: "POST", path: "/contracts/templates", group: recordGroups.contractManagement, type: "contract_template", operationId: "createContractTemplateRecord", summary: "Create a contract template record" },
  { method: "POST", path: "/contracts/drafting-workflows", group: recordGroups.contractManagement, type: "contract_drafting_workflow", operationId: "createContractDraftingRecord", summary: "Create a contract drafting workflow record" },
  { method: "POST", path: "/contracts/review-workflows", group: recordGroups.contractManagement, type: "contract_review_workflow", operationId: "createContractReviewRecord", summary: "Create a contract review workflow record" },
  { method: "POST", path: "/contracts/approval-workflows", group: recordGroups.contractManagement, type: "contract_approval_workflow", operationId: "createContractApprovalRecord", summary: "Create a contract approval workflow record" },
  { method: "POST", path: "/contracts/renewals", group: recordGroups.contractManagement, type: "contract_renewal_tracking", operationId: "createContractRenewalRecord", summary: "Create a contract renewal tracking record" },
  { method: "POST", path: "/contracts/expirations", group: recordGroups.contractManagement, type: "contract_expiration_tracking", operationId: "createContractExpirationRecord", summary: "Create a contract expiration tracking record" },
  { method: "POST", path: "/contracts/obligations", group: recordGroups.contractManagement, type: "contract_obligation_tracking", operationId: "createContractObligationRecord", summary: "Create a contract obligation tracking record" },
  { method: "POST", path: "/contracts/vendors", group: recordGroups.contractManagement, type: "vendor_contract_management", operationId: "createVendorContractRecord", summary: "Create a vendor contract management record" },
  { method: "POST", path: "/contracts/insurance", group: recordGroups.contractManagement, type: "insurance_contract_management", operationId: "createInsuranceContractRecord", summary: "Create an insurance contract management record" },
  { method: "POST", path: "/contracts/employment", group: recordGroups.contractManagement, type: "employment_contract_management", operationId: "createEmploymentContractRecord", summary: "Create an employment contract management record" },
  { method: "POST", path: "/contracts/clinical-services", group: recordGroups.contractManagement, type: "clinical_service_contract_management", operationId: "createClinicalServiceContractRecord", summary: "Create a clinical service contract management record" },

  { method: "POST", path: "/risks/enterprise", group: recordGroups.enterpriseRiskManagement, type: "enterprise_risk_register", operationId: "createEnterpriseRiskRecord", summary: "Create an enterprise risk register record" },
  { method: "POST", path: "/risks/clinical", group: recordGroups.enterpriseRiskManagement, type: "clinical_risk_register", operationId: "createClinicalRiskRecord", summary: "Create a clinical risk register record" },
  { method: "POST", path: "/risks/operational", group: recordGroups.enterpriseRiskManagement, type: "operational_risk_register", operationId: "createOperationalRiskRecord", summary: "Create an operational risk register record" },
  { method: "POST", path: "/risks/financial", group: recordGroups.enterpriseRiskManagement, type: "financial_risk_register", operationId: "createFinancialRiskRecord", summary: "Create a financial risk register record" },
  { method: "POST", path: "/risks/legal", group: recordGroups.enterpriseRiskManagement, type: "legal_risk_register", operationId: "createLegalRiskRecord", summary: "Create a legal risk register record" },
  { method: "POST", path: "/risks/cybersecurity", group: recordGroups.enterpriseRiskManagement, type: "cybersecurity_risk_register", operationId: "createCybersecurityRiskRecord", summary: "Create a cybersecurity risk register record" },
  { method: "POST", path: "/risks/scoring", group: recordGroups.enterpriseRiskManagement, type: "risk_scoring", operationId: "createRiskScoringRecord", summary: "Create a risk scoring record" },
  { method: "POST", path: "/risks/mitigations", group: recordGroups.enterpriseRiskManagement, type: "risk_mitigation_plan", operationId: "createRiskMitigationRecord", summary: "Create a risk mitigation plan record" },
  { method: "POST", path: "/risks/reviews", group: recordGroups.enterpriseRiskManagement, type: "risk_review_workflow", operationId: "createRiskReviewRecord", summary: "Create a risk review workflow record" },
  { method: "POST", path: "/risks/dashboard", group: recordGroups.enterpriseRiskManagement, type: "risk_dashboard", operationId: "createRiskDashboardRecord", summary: "Create a risk dashboard record" },

  { method: "POST", path: "/governance/boards", group: recordGroups.governance, type: "board_governance_registry", operationId: "createBoardGovernanceRecord", summary: "Create a board governance registry record" },
  { method: "POST", path: "/governance/committees", group: recordGroups.governance, type: "committee_management", operationId: "createCommitteeRecord", summary: "Create a committee management record" },
  { method: "POST", path: "/governance/meetings", group: recordGroups.governance, type: "meeting_management", operationId: "createMeetingRecord", summary: "Create a meeting management record" },
  { method: "POST", path: "/governance/agendas", group: recordGroups.governance, type: "agenda_management", operationId: "createAgendaRecord", summary: "Create an agenda management record" },
  { method: "POST", path: "/governance/minutes", group: recordGroups.governance, type: "minutes_management", operationId: "createMinutesRecord", summary: "Create a minutes management record" },
  { method: "POST", path: "/governance/decisions", group: recordGroups.governance, type: "decision_registry", operationId: "createDecisionRecord", summary: "Create a governance decision registry record" },
  { method: "POST", path: "/governance/policy-approvals", group: recordGroups.governance, type: "policy_approval_workflow", operationId: "createGovernancePolicyApprovalRecord", summary: "Create a governance policy approval workflow record" },
  { method: "POST", path: "/governance/audits", group: recordGroups.governance, type: "governance_audit", operationId: "createGovernanceAuditRecord", summary: "Create a governance audit record" },

  { method: "POST", path: "/policies/registries", group: recordGroups.policyManagement, type: "policy_registry", operationId: "createPolicyRecord", summary: "Create a policy registry record" },
  { method: "POST", path: "/policies/versioning", group: recordGroups.policyManagement, type: "policy_versioning", operationId: "createPolicyVersionRecord", summary: "Create a policy versioning record" },
  { method: "POST", path: "/policies/reviews", group: recordGroups.policyManagement, type: "policy_review", operationId: "createPolicyReviewRecord", summary: "Create a policy review record" },
  { method: "POST", path: "/policies/approvals", group: recordGroups.policyManagement, type: "policy_approval", operationId: "createPolicyApprovalRecord", summary: "Create a policy approval record" },
  { method: "POST", path: "/policies/publications", group: recordGroups.policyManagement, type: "policy_publication", operationId: "createPolicyPublicationRecord", summary: "Create a policy publication record" },
  { method: "POST", path: "/policies/attestations", group: recordGroups.policyManagement, type: "policy_attestation", operationId: "createPolicyAttestationRecord", summary: "Create a policy attestation record" },
  { method: "POST", path: "/policies/exceptions", group: recordGroups.policyManagement, type: "policy_exception_workflow", operationId: "createPolicyExceptionRecord", summary: "Create a policy exception workflow record" },
  { method: "POST", path: "/policies/compliance", group: recordGroups.policyManagement, type: "policy_compliance_tracking", operationId: "createPolicyComplianceRecord", summary: "Create a policy compliance tracking record" },

  { method: "POST", path: "/regulatory/obligations", group: recordGroups.complianceRegulatory, type: "regulatory_obligation_registry", operationId: "createRegulatoryObligationRecord", summary: "Create a regulatory obligation registry record" },
  { method: "POST", path: "/regulatory/calendar", group: recordGroups.complianceRegulatory, type: "regulatory_calendar", operationId: "createRegulatoryCalendarRecord", summary: "Create a regulatory calendar record" },
  { method: "POST", path: "/regulatory/compliance-tasks", group: recordGroups.complianceRegulatory, type: "compliance_task_management", operationId: "createComplianceTaskRecord", summary: "Create a compliance task management record" },
  { method: "POST", path: "/regulatory/submissions", group: recordGroups.complianceRegulatory, type: "regulatory_submission_tracking", operationId: "createRegulatorySubmissionRecord", summary: "Create a regulatory submission tracking record" },
  { method: "POST", path: "/regulatory/evidence", group: recordGroups.complianceRegulatory, type: "evidence_repository", operationId: "createEvidenceRepositoryRecord", summary: "Create an evidence repository record" },
  { method: "POST", path: "/regulatory/compliance-reviews", group: recordGroups.complianceRegulatory, type: "compliance_review_workflow", operationId: "createComplianceReviewRecord", summary: "Create a compliance review workflow record" },
  { method: "POST", path: "/regulatory/risk-dashboard", group: recordGroups.complianceRegulatory, type: "regulatory_risk_dashboard", operationId: "createRegulatoryRiskDashboardRecord", summary: "Create a regulatory risk dashboard record" }
]);

export const routeByFullPath = new Map(routeDefinitions.map((route) => [route.path, route]));
