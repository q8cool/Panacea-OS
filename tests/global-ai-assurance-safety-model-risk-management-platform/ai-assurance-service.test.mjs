import assert from "node:assert/strict";
import test from "node:test";
import {
  AiAssuranceAuthorizationError,
  AiAssuranceValidationError
} from "../../services/global-ai-assurance-safety-model-risk-management-platform/src/domain/ai-assurance-validation.mjs";
import { baseRecord, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 78 service persists required AI assurance events and audit entries", async () => {
  const { service, repository } = createServiceWithRepository();
  const actor = principal();
  await service.recordAiAssurance(baseRecord({ recordType: "ai_assurance_workflow", status: "under_review" }), actor);
  await service.recordAiAssurance(baseRecord({ recordType: "ai_risk_classification", status: "classified" }), actor);
  await service.recordModelRiskManagement(baseRecord({ recordType: "model_validation_workflow", status: "started" }), actor);
  await service.recordModelRiskManagement(baseRecord({ recordType: "model_validation_workflow", status: "completed" }), actor);
  await service.recordModelRiskManagement(baseRecord({ recordType: "model_approval_workflow", status: "approved" }), actor);
  await service.recordModelRiskManagement(baseRecord({ recordType: "model_approval_workflow", status: "rejected" }), actor);
  await service.recordPromptAgentAssurance(baseRecord({ recordType: "prompt_approval_workflow", status: "approved" }), actor);
  await service.recordPromptAgentAssurance(baseRecord({ recordType: "agent_runtime_approval", status: "approved" }), actor);
  await service.recordAiSafetyTesting(baseRecord({ recordType: "safety_test_reports", status: "completed" }), actor);
  await service.recordAiIncidentManagement(baseRecord({ recordType: "ai_incident_registry", status: "detected" }), actor);
  await service.recordAiIncidentManagement(baseRecord({ recordType: "ai_incident_closure", status: "closed" }), actor);
  await service.recordRegulatoryAiGovernance(baseRecord({ recordType: "ai_audit_package_generation", status: "generated" }), actor);

  assert.deepEqual(
    repository.events.map((event) => event.eventType),
    [
      "ai.assurance.review.created",
      "ai.risk.classified",
      "model.validation.started",
      "model.validation.completed",
      "model.approved",
      "model.rejected",
      "prompt.approved",
      "agent.approved",
      "ai.safety.test.completed",
      "ai.incident.created",
      "ai.incident.closed",
      "ai.audit.package.generated"
    ]
  );
  assert.equal(repository.records.length, 12);
  assert.equal(repository.audits.length, 12);
  assert.ok(repository.audits.every((entry) => entry.tenantId === "tenant-global-ai-assurance"));
});

test("model validation, prompt approval, agent approval, and safety tests require controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordModelRiskManagement(
        baseRecord({
          recordType: "model_validation_workflow",
          status: "completed",
          workflowControls: {
            ...baseRecord().workflowControls,
            validationCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof AiAssuranceValidationError && error.message.includes("validationCompleted")
  );
  await assert.rejects(
    () =>
      service.recordPromptAgentAssurance(
        baseRecord({
          recordType: "prompt_approval_workflow",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            promptApprovalCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof AiAssuranceValidationError && error.message.includes("promptApprovalCompleted")
  );
  await assert.rejects(
    () =>
      service.recordPromptAgentAssurance(
        baseRecord({
          recordType: "agent_runtime_approval",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            agentApprovalCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof AiAssuranceValidationError && error.message.includes("agentApprovalCompleted")
  );
  await assert.rejects(
    () =>
      service.recordAiSafetyTesting(
        baseRecord({
          recordType: "safety_test_reports",
          status: "completed",
          workflowControls: {
            ...baseRecord().workflowControls,
            safetyTestCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof AiAssuranceValidationError && error.message.includes("safetyTestCompleted")
  );
});

test("incident closure, regulatory evidence, tenant, and production promotion controls are enforced", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordAiIncidentManagement(
        baseRecord({
          recordType: "ai_incident_closure",
          status: "closed",
          workflowControls: {
            ...baseRecord().workflowControls,
            incidentClosureApproved: false
          }
        }),
        principal()
      ),
    (error) => error instanceof AiAssuranceValidationError && error.message.includes("incidentClosureApproved")
  );
  await assert.rejects(
    () =>
      service.recordRegulatoryAiGovernance(
        baseRecord({
          recordType: "ai_audit_package_generation",
          status: "generated",
          workflowControls: {
            ...baseRecord().workflowControls,
            auditPackageReviewed: false
          }
        }),
        principal()
      ),
    (error) => error instanceof AiAssuranceValidationError && error.message.includes("auditPackageReviewed")
  );
  await assert.rejects(
    () =>
      service.recordAiAssurance(
        baseRecord({
          recordType: "ai_assurance_registry",
          governanceContext: {
            ...baseRecord().governanceContext,
            productionPromotionRequiresApproval: false
          }
        }),
        principal()
      ),
    (error) => error instanceof AiAssuranceValidationError && error.message.includes("productionPromotionRequiresApproval")
  );
  await assert.rejects(
    () => service.recordAiAssurance(baseRecord({ recordType: "ai_assurance_registry" }), principal({ tenantId: "different-tenant" })),
    (error) => error instanceof AiAssuranceAuthorizationError && error.message.includes("tenant")
  );
});

test("service rejects country and prohibited clinical automation violations", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () => service.recordAiAssurance(baseRecord({ recordType: "ai_assurance_registry", countryCode: "BH" }), principal()),
    (error) => error instanceof AiAssuranceAuthorizationError && error.message.includes("country")
  );
  await assert.rejects(
    () =>
      service.recordAiAssurance(
        baseRecord({
          recordType: "ai_assurance_registry",
          description: "This AI assurance workflow must never perform autonomous diagnosis."
        }),
        principal()
      ),
    (error) => error instanceof AiAssuranceValidationError && error.message.includes("prohibited clinical automation")
  );
});

test("integration references are authorized, tenant-isolated, and auditable", async () => {
  const { service, repository } = createServiceWithRepository();
  const reference = await service.createIntegrationReference(
    {
      tenantId: "tenant-global-ai-assurance",
      sourceSystem: "ai_governance_platform",
      sourceResourceType: "model_approval",
      sourceResourceId: "model-approval-001",
      aiAssuranceResourceType: "model_approval_workflow",
      aiAssuranceResourceId: "model-approval-record-001",
      countryCode: "KW",
      metadata: { integration: "model-governance" }
    },
    principal()
  );
  assert.equal(reference.sourceSystem, "ai_governance_platform");
  assert.equal(repository.references.length, 1);
  assert.equal(repository.audits[0].action, "global_ai_assurance.integration_reference.created");
});
