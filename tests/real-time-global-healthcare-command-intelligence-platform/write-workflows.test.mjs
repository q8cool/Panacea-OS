import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenApiDocument } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/api/openapi.mjs";
import {
  requiredWriteWorkflowEvents,
  writeWorkflowDefinitions,
  writeWorkflowPermission
} from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/write-workflows.mjs";
import {
  createWriteWorkflowProjections,
  projectionReadPermission,
  projectionRetryPermission
} from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/write-projections.mjs";
import {
  CommandAuthorizationError,
  CommandValidationError
} from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/command-validation.mjs";
import { baseWriteWorkflow, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 113 service persists every approved live write workflow event with audit evidence", async () => {
  const { service, repository } = createServiceWithRepository();
  for (const definition of writeWorkflowDefinitions) {
    const actor = principal({
      roles: [preferredRole(definition)],
      permissions: [writeWorkflowPermission]
    });
    await service.executeWriteWorkflow(
      definition,
      routeParams(definition),
      baseWriteWorkflow({ idempotencyKey: `validation-${definition.workflowKey}` }),
      actor,
      { requestId: `request-${definition.workflowKey}` }
    );
  }

  assert.equal(repository.writeWorkflows.length, writeWorkflowDefinitions.length);
  assert.equal(repository.writeWorkflowEvents.length, writeWorkflowDefinitions.length);
  assert.ok(repository.writeWorkflowProjections.length >= writeWorkflowDefinitions.length);
  assert.ok(repository.readModels.length >= writeWorkflowDefinitions.length);
  assert.equal(repository.audits.length, writeWorkflowDefinitions.length);
  assert.deepEqual(
    new Set(repository.writeWorkflowEvents.map((event) => event.eventType)),
    new Set(requiredWriteWorkflowEvents())
  );
  assert.ok(repository.writeWorkflows.every((record) => record.workflowControls.liveMode === true));
  assert.ok(repository.writeWorkflows.every((record) => record.workflowControls.demoData === false));
  assert.ok(repository.writeWorkflowEvents.every((event) => event.payload.payloadKeys.includes("detail")));
  assert.ok(repository.writeWorkflowProjections.every((projection) => projection.projectionStatus === "projected"));
  assert.ok(repository.readModels.every((record) => record.payload.source === "live-write-projection"));
  assert.ok(repository.audits.every((entry) => entry.action.startsWith("global_command_intelligence.write_workflow.")));
});

test("Sprint 114 projection map covers every approved write workflow event without duplicate targets", async () => {
  const { service, repository } = createServiceWithRepository();
  for (const definition of writeWorkflowDefinitions) {
    const actor = principal({
      roles: [preferredRole(definition)],
      permissions: [writeWorkflowPermission]
    });
    const result = await service.executeWriteWorkflow(
      definition,
      routeParams(definition),
      baseWriteWorkflow({ idempotencyKey: `projection-${definition.workflowKey}` }),
      actor,
      { requestId: `request-${definition.workflowKey}`, correlationId: `correlation-${definition.workflowKey}` }
    );
    assert.ok(result.projections.length > 0, `${definition.eventType} must produce projections`);
  }

  const eventTypes = new Set(repository.writeWorkflowProjections.map((projection) => projection.eventType));
  assert.deepEqual(eventTypes, new Set(requiredWriteWorkflowEvents()));
  const projectionKeys = repository.writeWorkflowProjections.map((projection) => `${projection.eventId}:${projection.projectionTarget}`);
  assert.equal(projectionKeys.length, new Set(projectionKeys).size);
  assert.ok(repository.writeWorkflowProjections.every((projection) => projection.requestId?.startsWith("request-")));
  assert.ok(repository.writeWorkflowProjections.every((projection) => projection.correlationId?.startsWith("correlation-")));
});

test("Sprint 114 projection retry is operator-scoped and replay safe", async () => {
  const { service, repository } = createServiceWithRepository();
  const definition = writeWorkflowDefinitions.find((item) => item.eventType === "patient.created");
  await service.executeWriteWorkflow(
    definition,
    {},
    baseWriteWorkflow(),
    principal({ roles: ["doctor"], permissions: [writeWorkflowPermission] }),
    { requestId: "retry-request", correlationId: "retry-correlation" }
  );
  const projection = repository.writeWorkflowProjections[0];
  projection.projectionStatus = "failed";
  projection.status = "failed";
  projection.failureReason = "synthetic retry validation failure";
  const replayed = await service.retryWriteWorkflowProjection(projection.id, principal({
    roles: ["operator"],
    permissions: [projectionRetryPermission, projectionReadPermission]
  }));

  assert.equal(replayed.projectionStatus, "replayed");
  assert.equal(replayed.retryCount, 1);
  assert.equal(repository.readModels.filter((record) => record.id === projection.payload.targetReadModel.id).length, 1);
  assert.equal(repository.audits.at(-1).action, "global_command_intelligence.write_workflow.projection.retry");

  await assert.rejects(
    () => service.retryWriteWorkflowProjection(projection.id, principal({
      roles: ["patient"],
      permissions: [projectionRetryPermission]
    })),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("retry")
  );
});

test("Sprint 114 projection creation is deterministic for idempotent replay", async () => {
  const record = {
    id: "00000000-0000-4000-8000-000000000001",
    tenantId: "tenant-global-command",
    workflowGroup: "clinical",
    workflowKey: "create_patient",
    eventType: "patient.created",
    subjectId: "patient-001",
    status: "accepted",
    title: "Patient projection",
    reason: "Validation",
    payload: { detail: "projection" },
    workflowControls: baseWriteWorkflow().workflowControls,
    requestContext: { requestId: "deterministic-request", correlationId: "deterministic-correlation" },
    createdBy: "actor-001",
    updatedBy: "actor-001",
    createdAt: "2026-06-30T12:00:00.000Z",
    updatedAt: "2026-06-30T12:00:00.000Z"
  };
  const event = {
    id: "00000000-0000-4000-8000-000000000002",
    tenantId: record.tenantId,
    eventType: "patient.created",
    aggregateId: record.id,
    aggregateType: "write_workflow.clinical.create_patient",
    actorId: record.createdBy,
    occurredAt: record.createdAt,
    payload: {}
  };
  assert.deepEqual(
    createWriteWorkflowProjections(record, event, record.createdAt),
    createWriteWorkflowProjections(record, event, record.createdAt)
  );
});

test("Sprint 113 live write workflows enforce tenant, role, and Live Mode controls", async () => {
  const { service } = createServiceWithRepository();
  const definition = writeWorkflowDefinitions.find((item) => item.eventType === "patient.created");
  await assert.rejects(
    () => service.executeWriteWorkflow(
      definition,
      {},
      baseWriteWorkflow({ workflowControls: { ...baseWriteWorkflow().workflowControls, demoData: true } }),
      principal({ roles: ["doctor"], permissions: [writeWorkflowPermission] })
    ),
    (error) => error instanceof CommandValidationError && error.message.includes("demoData")
  );
  await assert.rejects(
    () => service.executeWriteWorkflow(
      definition,
      {},
      baseWriteWorkflow({ tenantId: "tenant-other" }),
      principal({ roles: ["doctor"], permissions: [writeWorkflowPermission] })
    ),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("tenant")
  );
  await assert.rejects(
    () => service.executeWriteWorkflow(
      definition,
      {},
      baseWriteWorkflow(),
      principal({ roles: ["patient"], permissions: ["read"] })
    ),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("write workflow")
  );
});

test("Sprint 113 pharmacy and patient portal workflows enforce their dedicated safety boundaries", async () => {
  const { service } = createServiceWithRepository();
  const pharmacyDefinition = writeWorkflowDefinitions.find((item) => item.eventType === "medication.safety.validated");
  await assert.rejects(
    () => service.executeWriteWorkflow(
      pharmacyDefinition,
      { prescriptionId: "prescription-001" },
      baseWriteWorkflow({
        workflowControls: {
          ...baseWriteWorkflow().workflowControls,
          documentedMedicationSafetyRulesApplied: false
        }
      }),
      principal({ roles: ["pharmacy"], permissions: [writeWorkflowPermission] })
    ),
    (error) => error instanceof CommandValidationError && error.message.includes("documentedMedicationSafetyRulesApplied")
  );

  const patientPortalDefinition = writeWorkflowDefinitions.find((item) => item.eventType === "patient.secure.message.sent");
  await assert.rejects(
    () => service.executeWriteWorkflow(
      patientPortalDefinition,
      {},
      baseWriteWorkflow({
        workflowControls: {
          ...baseWriteWorkflow().workflowControls,
          patientClinicalRecordModificationBlocked: false
        }
      }),
      principal({ roles: ["patient"], permissions: [writeWorkflowPermission] })
    ),
    (error) => error instanceof CommandValidationError && error.message.includes("patientClinicalRecordModificationBlocked")
  );
});

test("Sprint 113 OpenAPI exposes every approved live write workflow", () => {
  const document = buildOpenApiDocument();
  for (const definition of writeWorkflowDefinitions) {
    const path = `/api/v4/global-command-intelligence${definition.path}`;
    assert.equal(document.paths[path]?.post?.operationId, definition.operationId);
    assert.equal(document.paths[path]?.post?.tags.includes("live_write_workflows"), true);
  }
  assert.equal(document["x-panacea"].liveWriteWorkflows.length, writeWorkflowDefinitions.length);
});

function preferredRole(definition) {
  return definition.allowedRoles.find((role) => !["administrator", "operator", "global-command-intelligence-admin"].includes(role)) ?? "administrator";
}

function routeParams(definition) {
  if (!definition.subjectParam) return {};
  return {
    [definition.subjectParam]: `${definition.subjectParam}-001`
  };
}
