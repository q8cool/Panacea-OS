import assert from "node:assert/strict";
import test from "node:test";
import { LegalAuthorizationError, LegalValidationError } from "../../services/global-legal-contracting-risk-governance-platform/src/domain/legal-validation.mjs";
import { baseRecord, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 74 service persists the required legal governance events and audit entries", async () => {
  const { service, repository } = createServiceWithRepository();
  const actor = principal();
  await service.recordLegalManagement(baseRecord({ recordType: "legal_matter_registry", status: "registered" }), actor);
  await service.recordContractManagement(baseRecord({ recordType: "contract_registry", status: "registered" }), actor);
  await service.recordContractManagement(baseRecord({ recordType: "contract_approval_workflow", status: "approved" }), actor);
  await service.recordContractManagement(baseRecord({ recordType: "contract_expiration_tracking", status: "expiring" }), actor);
  await service.recordEnterpriseRisk(baseRecord({ recordType: "enterprise_risk_register", status: "registered" }), actor);
  await service.recordEnterpriseRisk(baseRecord({ recordType: "risk_mitigation_plan", status: "mitigated" }), actor);
  await service.recordPolicyManagement(baseRecord({ recordType: "policy_registry", status: "registered" }), actor);
  await service.recordPolicyManagement(baseRecord({ recordType: "policy_approval", status: "approved" }), actor);
  await service.recordPolicyManagement(baseRecord({ recordType: "policy_publication", status: "published" }), actor);
  await service.recordGovernance(baseRecord({ recordType: "decision_registry", status: "recorded" }), actor);
  await service.recordComplianceRegulatory(baseRecord({ recordType: "regulatory_obligation_registry", status: "updated" }), actor);

  assert.deepEqual(
    repository.events.map((event) => event.eventType),
    [
      "legal.matter.created",
      "contract.created",
      "contract.approved",
      "contract.expiring",
      "risk.created",
      "risk.mitigated",
      "policy.created",
      "policy.approved",
      "policy.published",
      "governance.decision.recorded",
      "regulatory.obligation.updated"
    ]
  );
  assert.equal(repository.records.length, 11);
  assert.equal(repository.audits.length, 11);
  assert.ok(repository.audits.every((entry) => entry.tenantId === "tenant-global-legal"));
});

test("legal approval workflow requires legal approval evidence controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordLegalManagement(
        baseRecord({
          recordType: "legal_approval_workflow",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            legalApprovalCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof LegalValidationError && error.message.includes("legalApprovalCompleted")
  );
});

test("contract approval and expiration workflows require lifecycle controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordContractManagement(
        baseRecord({
          recordType: "contract_approval_workflow",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            contractApproved: false
          }
        }),
        principal()
      ),
    (error) => error instanceof LegalValidationError && error.message.includes("contractApproved")
  );
  await assert.rejects(
    () =>
      service.recordContractManagement(
        baseRecord({
          recordType: "contract_expiration_tracking",
          status: "expiring",
          workflowControls: {
            ...baseRecord().workflowControls,
            expirationMonitored: false
          }
        }),
        principal()
      ),
    (error) => error instanceof LegalValidationError && error.message.includes("expirationMonitored")
  );
});

test("risk, policy, and regulatory workflows enforce governance controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordEnterpriseRisk(
        baseRecord({
          recordType: "risk_mitigation_plan",
          status: "mitigated",
          workflowControls: {
            ...baseRecord().workflowControls,
            mitigationApproved: false
          }
        }),
        principal()
      ),
    (error) => error instanceof LegalValidationError && error.message.includes("mitigationApproved")
  );
  await assert.rejects(
    () =>
      service.recordPolicyManagement(
        baseRecord({
          recordType: "policy_publication",
          status: "published",
          workflowControls: {
            ...baseRecord().workflowControls,
            policyApprovedForPublication: false
          }
        }),
        principal()
      ),
    (error) => error instanceof LegalValidationError && error.message.includes("policyApprovedForPublication")
  );
  await assert.rejects(
    () =>
      service.recordComplianceRegulatory(
        baseRecord({
          recordType: "regulatory_submission_tracking",
          status: "submitted",
          workflowControls: {
            ...baseRecord().workflowControls,
            submissionAuthorized: false
          }
        }),
        principal()
      ),
    (error) => error instanceof LegalValidationError && error.message.includes("submissionAuthorized")
  );
});

test("service rejects tenant, country, and prohibited clinical automation violations", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () => service.recordGovernance(baseRecord({ recordType: "committee_management" }), principal({ tenantId: "different-tenant" })),
    (error) => error instanceof LegalAuthorizationError && error.message.includes("tenant")
  );
  await assert.rejects(
    () => service.recordGovernance(baseRecord({ recordType: "committee_management", countryCode: "BH" }), principal()),
    (error) => error instanceof LegalAuthorizationError && error.message.includes("country")
  );
  await assert.rejects(
    () =>
      service.recordLegalManagement(
        baseRecord({
          recordType: "legal_matter_registry",
          description: "This governance workflow must never perform autonomous diagnosis."
        }),
        principal()
      ),
    (error) => error instanceof LegalValidationError && error.message.includes("prohibited clinical automation")
  );
});

test("integration references are authorized, tenant-isolated, and auditable", async () => {
  const { service, repository } = createServiceWithRepository();
  const reference = await service.createIntegrationReference(
    {
      tenantId: "tenant-global-legal",
      sourceSystem: "workforce_platform",
      sourceResourceType: "employee",
      sourceResourceId: "employee-001",
      legalResourceType: "employment_contract_management",
      legalResourceId: "contract-001",
      countryCode: "KW",
      metadata: { integration: "employment-contract" }
    },
    principal()
  );
  assert.equal(reference.sourceSystem, "workforce_platform");
  assert.equal(repository.references.length, 1);
  assert.equal(repository.audits[0].action, "global_legal.integration_reference.created");
});
