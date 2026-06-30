import assert from "node:assert/strict";
import test from "node:test";
import { WorkforceAuthorizationError, WorkforceValidationError } from "../../services/global-workforce-hr-credentialing-staff-experience-platform/src/domain/workforce-validation.mjs";
import { baseRecord, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 73 service persists the required workforce events and audit entries", async () => {
  const { service, repository } = createServiceWithRepository();
  const actor = principal();
  await service.recordWorkforceManagement(baseRecord({ recordType: "staff_registry", status: "registered" }), actor);
  await service.recordWorkforceManagement(baseRecord({ recordType: "employee_profile", status: "updated" }), actor);
  await service.recordClinicalCredentialing(baseRecord({ recordType: "provider_credential_registry", status: "registered" }), actor);
  await service.recordClinicalCredentialing(baseRecord({ recordType: "credential_verification_workflow", status: "verified" }), actor);
  await service.recordClinicalCredentialing(baseRecord({ recordType: "credential_expiration_tracking", status: "expired" }), actor);
  await service.recordWorkforceManagement(baseRecord({ recordType: "staff_scheduling", status: "assigned" }), actor);
  await service.recordWorkforceManagement(baseRecord({ recordType: "shift_management", status: "completed" }), actor);
  await service.recordWorkforceManagement(baseRecord({ recordType: "leave_management", status: "requested" }), actor);
  await service.recordWorkforceManagement(baseRecord({ recordType: "leave_management", status: "approved" }), actor);
  await service.recordStaffExperience(baseRecord({ recordType: "training_assignments", status: "assigned" }), actor);
  await service.recordCompliance(baseRecord({ recordType: "mandatory_training_compliance", status: "compliant" }), actor);

  assert.deepEqual(
    repository.events.map((event) => event.eventType),
    [
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
    ]
  );
  assert.equal(repository.records.length, 11);
  assert.equal(repository.audits.length, 11);
  assert.ok(repository.audits.every((entry) => entry.tenantId === "tenant-global-workforce"));
});

test("credentialing verification requires primary source and committee governance controls", async () => {
  const { service } = createServiceWithRepository();
  const input = baseRecord({
    recordType: "credential_verification_workflow",
    workflowControls: {
      ...baseRecord().workflowControls,
      primarySourceVerificationCompleted: false
    }
  });
  await assert.rejects(
    () => service.recordClinicalCredentialing(input, principal()),
    (error) =>
      error instanceof WorkforceValidationError &&
      error.message.includes("primarySourceVerificationCompleted")
  );
});

test("staff scheduling requires fatigue, coverage, and scheduling policy checks", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordWorkforceManagement(
        baseRecord({
          recordType: "staff_scheduling",
          status: "assigned",
          workflowControls: {
            ...baseRecord().workflowControls,
            fatigueRiskChecked: false
          }
        }),
        principal()
      ),
    (error) => error instanceof WorkforceValidationError && error.message.includes("fatigueRiskChecked")
  );
});

test("service rejects tenant and country access violations", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () => service.recordHrOperations(baseRecord({ recordType: "onboarding_workflow" }), principal({ tenantId: "different-tenant" })),
    (error) => error instanceof WorkforceAuthorizationError && error.message.includes("tenant")
  );
  await assert.rejects(
    () => service.recordHrOperations(baseRecord({ recordType: "onboarding_workflow", countryCode: "BH" }), principal()),
    (error) => error instanceof WorkforceAuthorizationError && error.message.includes("country")
  );
});

test("service rejects prohibited clinical automation language", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordWorkforceManagement(
        baseRecord({
          recordType: "staff_registry",
          description: "This workforce action must never perform autonomous diagnosis."
        }),
        principal()
      ),
    (error) => error instanceof WorkforceValidationError && error.message.includes("prohibited clinical automation")
  );
});

test("integration references are authorized, tenant-isolated, and auditable", async () => {
  const { service, repository } = createServiceWithRepository();
  const reference = await service.createIntegrationReference(
    {
      tenantId: "tenant-global-workforce",
      sourceSystem: "education_platform",
      sourceResourceType: "training_assignment",
      sourceResourceId: "training-001",
      workforceResourceType: "training_assignments",
      workforceResourceId: "workforce-record-001",
      countryCode: "KW",
      metadata: { integration: "training-compliance" }
    },
    principal()
  );
  assert.equal(reference.sourceSystem, "education_platform");
  assert.equal(repository.references.length, 1);
  assert.equal(repository.audits[0].action, "global_workforce.integration_reference.created");
});
