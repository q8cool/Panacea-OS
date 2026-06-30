import assert from "node:assert/strict";
import test from "node:test";
import {
  ProductManagementAuthorizationError,
  ProductManagementValidationError
} from "../../services/global-product-management-roadmap-innovation-portfolio-platform/src/domain/product-management-validation.mjs";
import { baseRecord, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 76 service persists required product management events and audit entries", async () => {
  const { service, repository } = createServiceWithRepository();
  const actor = principal();
  await service.recordProductManagement(baseRecord({ recordType: "product_registry", status: "registered" }), actor);
  await service.recordProductManagement(baseRecord({ recordType: "feature_registry", status: "registered" }), actor);
  await service.recordProductManagement(baseRecord({ recordType: "feature_lifecycle", status: "approved" }), actor);
  await service.recordRequirementsManagement(baseRecord({ recordType: "requirement_registry", status: "registered" }), actor);
  await service.recordRoadmapManagement(baseRecord({ recordType: "roadmap_registry", status: "updated" }), actor);
  await service.recordRoadmapManagement(baseRecord({ recordType: "milestone_planning", status: "completed" }), actor);
  await service.recordInnovationPortfolio(baseRecord({ recordType: "innovation_idea_registry", status: "proposed" }), actor);
  await service.recordInnovationPortfolio(baseRecord({ recordType: "innovation_approval_workflow", status: "approved" }), actor);
  await service.recordProductFeedback(baseRecord({ recordType: "customer_feedback_registry", status: "received" }), actor);
  await service.recordReleaseGovernance(baseRecord({ recordType: "release_approval_workflow", status: "approved" }), actor);

  assert.deepEqual(
    repository.events.map((event) => event.eventType),
    [
      "product.created",
      "feature.created",
      "feature.approved",
      "requirement.created",
      "roadmap.updated",
      "milestone.completed",
      "innovation.idea.submitted",
      "innovation.approved",
      "feedback.received",
      "release.approved"
    ]
  );
  assert.equal(repository.records.length, 10);
  assert.equal(repository.audits.length, 10);
  assert.ok(repository.audits.every((entry) => entry.tenantId === "tenant-global-product"));
});

test("roadmap, requirement, innovation, and release workflows require governance controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordRoadmapManagement(
        baseRecord({
          recordType: "roadmap_approval_workflow",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            roadmapApprovalCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ProductManagementValidationError && error.message.includes("roadmapApprovalCompleted")
  );
  await assert.rejects(
    () =>
      service.recordRequirementsManagement(
        baseRecord({
          recordType: "requirement_traceability",
          status: "linked",
          workflowControls: {
            ...baseRecord().workflowControls,
            traceabilityVerified: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ProductManagementValidationError && error.message.includes("traceabilityVerified")
  );
  await assert.rejects(
    () =>
      service.recordInnovationPortfolio(
        baseRecord({
          recordType: "innovation_approval_workflow",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            innovationApprovalCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ProductManagementValidationError && error.message.includes("innovationApprovalCompleted")
  );
  await assert.rejects(
    () =>
      service.recordReleaseGovernance(
        baseRecord({
          recordType: "release_approval_workflow",
          status: "approved",
          workflowControls: {
            ...baseRecord().workflowControls,
            releaseApprovalCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof ProductManagementValidationError && error.message.includes("releaseApprovalCompleted")
  );
});

test("service rejects tenant, country, and prohibited clinical automation violations", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () => service.recordProductManagement(baseRecord({ recordType: "product_registry" }), principal({ tenantId: "different-tenant" })),
    (error) => error instanceof ProductManagementAuthorizationError && error.message.includes("tenant")
  );
  await assert.rejects(
    () => service.recordProductManagement(baseRecord({ recordType: "product_registry", countryCode: "BH" }), principal()),
    (error) => error instanceof ProductManagementAuthorizationError && error.message.includes("country")
  );
  await assert.rejects(
    () =>
      service.recordProductManagement(
        baseRecord({
          recordType: "product_registry",
          description: "This product governance workflow must never perform autonomous diagnosis."
        }),
        principal()
      ),
    (error) => error instanceof ProductManagementValidationError && error.message.includes("prohibited clinical automation")
  );
});

test("integration references are authorized, tenant-isolated, and auditable", async () => {
  const { service, repository } = createServiceWithRepository();
  const reference = await service.createIntegrationReference(
    {
      tenantId: "tenant-global-product",
      sourceSystem: "legal_governance_platform",
      sourceResourceType: "policy",
      sourceResourceId: "policy-001",
      productManagementResourceType: "roadmap_approval_workflow",
      productManagementResourceId: "roadmap-approval-001",
      countryCode: "KW",
      metadata: { integration: "roadmap-policy" }
    },
    principal()
  );
  assert.equal(reference.sourceSystem, "legal_governance_platform");
  assert.equal(repository.references.length, 1);
  assert.equal(repository.audits[0].action, "global_product_management.integration_reference.created");
});
