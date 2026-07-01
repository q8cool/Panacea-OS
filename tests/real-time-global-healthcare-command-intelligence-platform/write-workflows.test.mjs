import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenApiDocument } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/api/openapi.mjs";
import {
  requiredWriteWorkflowEvents,
  writeWorkflowDefinitions,
  writeWorkflowPermission
} from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/write-workflows.mjs";
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
  assert.equal(repository.audits.length, writeWorkflowDefinitions.length);
  assert.deepEqual(
    new Set(repository.writeWorkflowEvents.map((event) => event.eventType)),
    new Set(requiredWriteWorkflowEvents())
  );
  assert.ok(repository.writeWorkflows.every((record) => record.workflowControls.liveMode === true));
  assert.ok(repository.writeWorkflows.every((record) => record.workflowControls.demoData === false));
  assert.ok(repository.writeWorkflowEvents.every((event) => event.payload.payloadKeys.includes("detail")));
  assert.ok(repository.audits.every((entry) => entry.action.startsWith("global_command_intelligence.write_workflow.")));
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
