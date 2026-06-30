import assert from "node:assert/strict";
import test from "node:test";
import {
  IntelligenceAuthorizationError,
  IntelligenceValidationError
} from "../../services/autonomous-healthcare-intelligence-foundation/src/domain/intelligence-validation.mjs";
import { baseRecord, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 84 service persists required intelligence events and audit entries", async () => {
  const { service, repository } = createServiceWithRepository();
  const actor = principal();
  await service.recordFoundation(baseRecord({ recordType: "intelligence_capability_registry", status: "registered" }), actor);
  await service.recordFoundation(baseRecord({ recordType: "intelligence_policy_engine", status: "created" }), actor);
  await service.recordClinicalGovernance(baseRecord({ recordType: "recommendation_governance", status: "started" }), actor);
  await service.recordClinicalGovernance(baseRecord({ recordType: "recommendation_governance", status: "completed" }), actor);
  await service.recordClinicalGovernance(baseRecord({ recordType: "human_approval_rules", status: "approval_required" }), actor);
  await service.recordSafetyControl(baseRecord({ recordType: "unsafe_recommendation_blocking", status: "blocked" }), actor);
  await service.recordTraceability(baseRecord({ recordType: "intelligence_trace", status: "generated" }), actor);
  await service.recordTraceability(baseRecord({ recordType: "governance_audit_package", status: "generated" }), actor);

  assert.deepEqual(
    repository.events.map((event) => event.eventType),
    [
      "intelligence.capability.registered",
      "intelligence.policy.created",
      "recommendation.governance.started",
      "recommendation.governance.completed",
      "human.approval.required",
      "unsafe.recommendation.blocked",
      "intelligence.trace.created",
      "governance.audit.generated"
    ]
  );
  assert.equal(repository.records.length, 8);
  assert.equal(repository.audits.length, 8);
  assert.ok(repository.records.every((record) => record.governanceContext.advisoryOnly));
});

test("human approval, unsafe blocking, traceability, and emergency stop controls are enforced", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordClinicalGovernance(
        baseRecord({
          recordType: "human_approval_rules",
          workflowControls: {
            ...baseRecord().workflowControls,
            humanApprovalRuleEnforced: false
          }
        }),
        principal()
      ),
    (error) => error instanceof IntelligenceValidationError && error.message.includes("humanApprovalRuleEnforced")
  );
  await assert.rejects(
    () =>
      service.recordSafetyControl(
        baseRecord({
          recordType: "unsafe_recommendation_blocking",
          workflowControls: {
            ...baseRecord().workflowControls,
            unsafeRecommendationBlockingActive: false
          }
        }),
        principal()
      ),
    (error) => error instanceof IntelligenceValidationError && error.message.includes("unsafeRecommendationBlockingActive")
  );
  await assert.rejects(
    () =>
      service.recordTraceability(
        baseRecord({
          recordType: "governance_audit_package",
          workflowControls: {
            ...baseRecord().workflowControls,
            governanceAuditPackageReviewed: false
          }
        }),
        principal()
      ),
    (error) => error instanceof IntelligenceValidationError && error.message.includes("governanceAuditPackageReviewed")
  );
  await assert.rejects(
    () =>
      service.recordSafetyControl(
        baseRecord({
          recordType: "emergency_stop_controls",
          workflowControls: {
            ...baseRecord().workflowControls,
            emergencyStopTested: false
          }
        }),
        principal()
      ),
    (error) => error instanceof IntelligenceValidationError && error.message.includes("emergencyStopTested")
  );
});

test("advisory governance, tenant isolation, country access, and autonomous clinical prohibitions are enforced", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordFoundation(
        baseRecord({
          recordType: "autonomous_intelligence_registry",
          governanceContext: {
            ...baseRecord().governanceContext,
            clinicianApprovalEnforced: false
          }
        }),
        principal()
      ),
    (error) => error instanceof IntelligenceValidationError && error.message.includes("clinicianApprovalEnforced")
  );
  await assert.rejects(
    () => service.recordFoundation(baseRecord({ recordType: "autonomous_intelligence_registry" }), principal({ tenantId: "different-tenant" })),
    (error) => error instanceof IntelligenceAuthorizationError && error.message.includes("tenant")
  );
  await assert.rejects(
    () => service.recordFoundation(baseRecord({ recordType: "autonomous_intelligence_registry", countryCode: "BH" }), principal()),
    (error) => error instanceof IntelligenceAuthorizationError && error.message.includes("country")
  );
  await assert.rejects(
    () =>
      service.recordFoundation(
        baseRecord({
          recordType: "autonomous_intelligence_registry",
          description: "This workflow attempts to bypass clinician approval."
        }),
        principal()
      ),
    (error) => error instanceof IntelligenceValidationError && error.message.includes("prohibited autonomous clinical behavior")
  );
});

test("integration references are authorized, tenant-isolated, and auditable", async () => {
  const { service, repository } = createServiceWithRepository();
  const reference = await service.createIntegrationReference(
    {
      tenantId: "tenant-autonomous-intelligence",
      sourceSystem: "ai_assurance_platform",
      sourceResourceType: "safety_assessment",
      sourceResourceId: "safety-assessment-001",
      intelligenceResourceType: "intelligence_safety_layer",
      intelligenceResourceId: "safety-layer-record-001",
      countryCode: "KW",
      metadata: { integration: "ai-assurance-link" }
    },
    principal()
  );
  assert.equal(reference.sourceSystem, "ai_assurance_platform");
  assert.equal(repository.references.length, 1);
  assert.equal(repository.audits[0].action, "autonomous_intelligence.integration_reference.created");
});
