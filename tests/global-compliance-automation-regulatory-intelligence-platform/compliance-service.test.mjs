import assert from "node:assert/strict";
import test from "node:test";
import {
  ComplianceAuthorizationError,
  ComplianceValidationError
} from "../../services/global-compliance-automation-regulatory-intelligence-platform/src/domain/compliance-validation.mjs";
import { baseRecord, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 77 service persists required compliance events and audit entries", async () => {
  const { service, repository } = createServiceWithRepository();
  const actor = principal();
  await service.recordRegulatoryIntelligence(baseRecord({ recordType: "regulatory_framework_registry", status: "registered" }), actor);
  await service.recordRegulatoryIntelligence(baseRecord({ recordType: "regulatory_change_tracking", status: "updated" }), actor);
  await service.recordComplianceAutomation(baseRecord({ recordType: "compliance_status_tracking", status: "completed" }), actor);
  await service.recordComplianceAutomation(baseRecord({ recordType: "compliance_gap_detection", status: "detected" }), actor);
  await service.recordAuditManagement(baseRecord({ recordType: "audit_plan_registry", status: "registered" }), actor);
  await service.recordAuditManagement(baseRecord({ recordType: "audit_closure_workflow", status: "completed" }), actor);
  await service.recordCertificationManagement(baseRecord({ recordType: "certification_expiration_alerts", status: "expiring" }), actor);
  await service.recordPolicyCompliance(baseRecord({ recordType: "policy_violation_tracking", status: "detected" }), actor);
  await service.recordRegulatoryReporting(baseRecord({ recordType: "report_generation", status: "generated" }), actor);
  await service.recordComplianceAutomation(baseRecord({ recordType: "compliance_remediation_workflow", status: "completed" }), actor);

  assert.deepEqual(
    repository.events.map((event) => event.eventType),
    [
      "regulation.created",
      "regulation.updated",
      "compliance.check.completed",
      "compliance.gap.detected",
      "audit.created",
      "audit.completed",
      "certification.expiring",
      "policy.violation.detected",
      "regulatory.report.generated",
      "remediation.completed"
    ]
  );
  assert.equal(repository.records.length, 10);
  assert.equal(repository.audits.length, 10);
  assert.ok(repository.audits.every((entry) => entry.tenantId === "tenant-global-compliance"));
});

test("regulatory mapping, audit, certification, and remediation workflows require controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordRegulatoryIntelligence(
        baseRecord({
          recordType: "regulatory_change_tracking",
          status: "updated",
          workflowControls: {
            ...baseRecord().workflowControls,
            regulatoryChangeReviewed: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ComplianceValidationError && error.message.includes("regulatoryChangeReviewed")
  );
  await assert.rejects(
    () =>
      service.recordComplianceAutomation(
        baseRecord({
          recordType: "compliance_gap_detection",
          status: "detected",
          workflowControls: {
            ...baseRecord().workflowControls,
            gapReviewCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ComplianceValidationError && error.message.includes("gapReviewCompleted")
  );
  await assert.rejects(
    () =>
      service.recordAuditManagement(
        baseRecord({
          recordType: "audit_closure_workflow",
          status: "completed",
          workflowControls: {
            ...baseRecord().workflowControls,
            auditClosureApproved: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ComplianceValidationError && error.message.includes("auditClosureApproved")
  );
  await assert.rejects(
    () =>
      service.recordCertificationManagement(
        baseRecord({
          recordType: "certification_expiration_alerts",
          status: "expiring",
          workflowControls: {
            ...baseRecord().workflowControls,
            expirationAlertReviewed: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ComplianceValidationError && error.message.includes("expirationAlertReviewed")
  );
});

test("policy violation, reporting, and tenant controls are enforced", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordPolicyCompliance(
        baseRecord({
          recordType: "policy_violation_tracking",
          status: "detected",
          workflowControls: {
            ...baseRecord().workflowControls,
            violationReviewCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ComplianceValidationError && error.message.includes("violationReviewCompleted")
  );
  await assert.rejects(
    () =>
      service.recordRegulatoryReporting(
        baseRecord({
          recordType: "report_approval_workflow",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            reportApprovalCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ComplianceValidationError && error.message.includes("reportApprovalCompleted")
  );
  await assert.rejects(
    () => service.recordRegulatoryIntelligence(baseRecord({ recordType: "regulatory_framework_registry" }), principal({ tenantId: "different-tenant" })),
    (error) => error instanceof ComplianceAuthorizationError && error.message.includes("tenant")
  );
});

test("service rejects country and prohibited clinical automation violations", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () => service.recordRegulatoryIntelligence(baseRecord({ recordType: "regulatory_framework_registry", countryCode: "BH" }), principal()),
    (error) => error instanceof ComplianceAuthorizationError && error.message.includes("country")
  );
  await assert.rejects(
    () =>
      service.recordRegulatoryIntelligence(
        baseRecord({
          recordType: "regulatory_framework_registry",
          description: "This compliance workflow must never perform autonomous diagnosis."
        }),
        principal()
      ),
    (error) => error instanceof ComplianceValidationError && error.message.includes("prohibited clinical automation")
  );
});

test("integration references are authorized, tenant-isolated, and auditable", async () => {
  const { service, repository } = createServiceWithRepository();
  const reference = await service.createIntegrationReference(
    {
      tenantId: "tenant-global-compliance",
      sourceSystem: "legal_governance_platform",
      sourceResourceType: "policy",
      sourceResourceId: "policy-001",
      complianceResourceType: "regulatory_requirement_mapping",
      complianceResourceId: "mapping-001",
      countryCode: "KW",
      metadata: { integration: "regulatory-policy" }
    },
    principal()
  );
  assert.equal(reference.sourceSystem, "legal_governance_platform");
  assert.equal(repository.references.length, 1);
  assert.equal(repository.audits[0].action, "global_compliance.integration_reference.created");
});
