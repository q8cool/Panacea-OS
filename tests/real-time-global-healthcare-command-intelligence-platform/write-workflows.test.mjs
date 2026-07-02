import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenApiDocument } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/api/openapi.mjs";
import {
  matchWriteWorkflowRoute,
  requiredWriteWorkflowEvents,
  writeWorkflowDefinitions,
  writeWorkflowPermission
} from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/write-workflows.mjs";
import {
  readModelDefinitions,
  readModelPermission
} from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/read-models.mjs";
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

test("operational AI Hospital Core routes restore governed patient, file, chat, prescription, report, and workflow transactions", async () => {
  const operationalDefinitions = writeWorkflowDefinitions.filter((item) => item.path.startsWith("/operational-core/"));
  const operationalEvents = new Set(operationalDefinitions.map((item) => item.eventType));
  assert.equal(operationalDefinitions.length, 12);
  assert.deepEqual(operationalEvents, new Set([
    "patient.created",
    "clinical.file.ingested",
    "clinical.file.analyzed",
    "clinical.patient.chat.logged",
    "clinical.global.chat.logged",
    "prescription.approval.requested",
    "prescription.doctor.approved",
    "treatment.order.requested",
    "treatment.order.doctor.approved",
    "clinical.report.analyzed",
    "clinical.report.translated",
    "clinical.workflow.advanced"
  ]));

  const document = buildOpenApiDocument();
  for (const definition of operationalDefinitions) {
    const contractPath = `/api/v4/global-command-intelligence${definition.path}`;
    assert.equal(document.paths[contractPath]?.post?.operationId, definition.operationId);
    const matched = matchWriteWorkflowRoute(concreteOperationalPath(definition.path), "POST");
    assert.equal(matched.definition.operationId, definition.operationId);
  }

  const { service, repository } = createServiceWithRepository();
  const patientId = "patient-operational-core-001";
  for (const definition of operationalDefinitions) {
    const actor = principal({
      roles: [preferredRole(definition)],
      permissions: [writeWorkflowPermission]
    });
    const result = await service.executeWriteWorkflow(
      definition,
      concreteOperationalParams(definition),
      baseWriteWorkflow({
        subjectId: definition.subjectParam ? undefined : patientId,
        title: `Operational core ${definition.workflowKey}`,
        idempotencyKey: `operational-core-${definition.workflowKey}`,
        payload: {
          patientId,
          fileId: "file-operational-core-001",
          prescriptionId: "prescription-operational-core-001",
          orderId: "order-operational-core-001",
          workflowId: "workflow-operational-core-001",
          detail: "Governed operational hospital core transaction with mandatory human approval.",
          pharmacySafetyGateRequired: definition.eventType.startsWith("prescription."),
          clinicianApprovalRequired: definition.eventType.startsWith("prescription.") || definition.eventType.startsWith("treatment."),
          noAutonomousDiagnosis: true,
          noAutonomousTreatment: true
        }
      }),
      actor,
      {
        requestId: `operational-core-request-${definition.workflowKey}`,
        correlationId: `operational-core-correlation-${definition.workflowKey}`
      }
    );
    assert.equal(result.event.eventType, definition.eventType);
    assert.ok(result.projections.length > 0);
  }

  assert.equal(repository.writeWorkflows.length, operationalDefinitions.length);
  assert.equal(repository.writeWorkflowEvents.length, operationalDefinitions.length);
  assert.ok(repository.audits.every((entry) => entry.metadata?.workflowKey?.startsWith("operational_")));
  assertReadModel(repository, "clinical", "files", patientId);
  assertReadModel(repository, "clinical", "patient_chat", patientId);
  assertReadModel(repository, "clinical", "reports", patientId);
  assertReadModel(repository, "clinical", "workflow_actions", patientId);
  assertReadModel(repository, "clinical", "orders", patientId);
  assertReadModel(repository, "clinical", "clinical_timeline", patientId);
  assertReadModel(repository, "pharmacy", "prescriptions", patientId);
  assertReadModel(repository, "clinical", "pharmacy_review", patientId);

  const files = await readModel(service, "clinical", "files", patientId, principal({
    roles: ["doctor"],
    permissions: [readModelPermission]
  }));
  assert.equal(files.items.length, 2);
  assert.ok(files.items.every((item) => item.payload.controls.demoData === false));

  const treatmentDefinition = operationalDefinitions.find((item) => item.eventType === "treatment.order.requested");
  await assert.rejects(
    () => service.executeWriteWorkflow(
      treatmentDefinition,
      concreteOperationalParams(treatmentDefinition),
      baseWriteWorkflow({
        workflowControls: {
          ...baseWriteWorkflow().workflowControls,
          noAutonomousDiagnosis: false
        }
      }),
      principal({ roles: ["doctor"], permissions: [writeWorkflowPermission] })
    ),
    (error) => error instanceof CommandValidationError && error.message.includes("noAutonomousDiagnosis")
  );
});

test("Sprint 115 end-to-end pilot journeys persist transactions, audit, events, projections, read models, and role boundaries", async () => {
  const { service, repository } = createServiceWithRepository();
  const patientId = "patient-pilot-115";
  const journeySteps = sprint115JourneySteps(patientId);

  for (const step of journeySteps) {
    const definition = writeWorkflowDefinitions.find((item) => item.eventType === step.eventType);
    assert.ok(definition, `${step.eventType} definition must exist`);
    const actor = principal({
      actorId: step.actorId ?? `${preferredRole(definition)}-pilot-115`,
      roles: [preferredRole(definition)],
      permissions: [writeWorkflowPermission]
    });
    const result = await service.executeWriteWorkflow(
      definition,
      step.params ?? {},
      baseWriteWorkflow({
        subjectId: step.subjectId,
        title: `${step.journey} ${step.label}`,
        idempotencyKey: `sprint115-${step.eventType}`,
        payload: {
          detail: step.label,
          journey: step.journey,
          patientId,
          subjectId: step.subjectId
        }
      }),
      actor,
      {
        requestId: `sprint115-request-${step.eventType}`,
        correlationId: `sprint115-correlation-${step.eventType}`
      }
    );
    assert.equal(result.event.eventType, step.eventType);
    assert.ok(result.projections.length > 0, `${step.eventType} must create a read-model projection`);
  }

  assert.equal(repository.writeWorkflows.length, journeySteps.length);
  assert.equal(repository.writeWorkflowEvents.length, journeySteps.length);
  assert.equal(repository.audits.length, journeySteps.length);
  assert.ok(repository.writeWorkflowProjections.length >= journeySteps.length);
  assert.ok(repository.readModels.length >= journeySteps.length);

  for (const step of journeySteps) {
    const workflow = repository.writeWorkflows.find((record) => record.eventType === step.eventType);
    const event = repository.writeWorkflowEvents.find((item) => item.eventType === step.eventType);
    const audit = repository.audits.find((entry) => entry.metadata?.eventType === step.eventType);
    const projections = repository.writeWorkflowProjections.filter((projection) => projection.eventType === step.eventType);
    assert.ok(workflow, `${step.eventType} workflow row exists`);
    assert.ok(event, `${step.eventType} event row exists`);
    assert.ok(audit, `${step.eventType} audit row exists`);
    assert.ok(projections.length > 0, `${step.eventType} projection rows exist`);
    assert.equal(workflow.workflowControls.liveMode, true);
    assert.equal(workflow.workflowControls.demoData, false);
    assert.equal(event.payload.demoData, false);
    assert.ok(projections.every((projection) => projection.projectionStatus === "projected"));
    assert.ok(projections.every((projection) => projection.requestId === `sprint115-request-${step.eventType}`));
    assert.ok(projections.every((projection) => projection.correlationId === `sprint115-correlation-${step.eventType}`));
  }

  assertReadModel(repository, "clinical", "patients", patientId);
  assertReadModel(repository, "clinical", "clinical_timeline", patientId);
  assertReadModel(repository, "clinical", "labs", patientId);
  assertReadModel(repository, "clinical", "radiology", patientId);
  assertReadModel(repository, "clinical", "pharmacy_review", patientId);
  assertReadModel(repository, "clinical", "alerts", "result-pilot-115-critical");
  assertReadModel(repository, "clinical", "alerts", "report-pilot-115-critical");
  assertReadModel(repository, "laboratory", "orders", patientId);
  assertReadModel(repository, "laboratory", "critical_results", "result-pilot-115-critical");
  assertReadModel(repository, "radiology", "studies", "study-pilot-115");
  assertReadModel(repository, "radiology", "critical_findings", "report-pilot-115-critical");
  assertReadModel(repository, "pharmacy", "prescriptions", "prescription-pilot-115");
  assertReadModel(repository, "pharmacy", "inventory", "inventory-pilot-115");
  assertReadModel(repository, "pharmacy", "safety_alerts", "med-alert-pilot-115");
  assertReadModel(repository, "patient_portal", "appointments", patientId);
  assertReadModel(repository, "patient_portal", "messages", patientId);
  assertReadModel(repository, "patient_portal", "medications", patientId);
  assertReadModel(repository, "patient_portal", "radiology", patientId);
  assertReadModel(repository, "admin", "tenants", "tenant-record-pilot-115");
  assertReadModel(repository, "admin", "users", "user-pilot-115");
  assertReadModel(repository, "admin", "roles", "role-pilot-115");
  assertReadModel(repository, "admin", "configuration", "configuration-pilot-115");

  const doctor = principal({
    actorId: "doctor-pilot-115",
    roles: ["doctor"],
    permissions: [readModelPermission]
  });
  const patient = principal({
    actorId: patientId,
    roles: ["patient"],
    permissions: [readModelPermission]
  });
  const laboratory = principal({
    actorId: "laboratory-pilot-115",
    roles: ["laboratory"],
    permissions: [readModelPermission]
  });
  const radiology = principal({
    actorId: "radiology-pilot-115",
    roles: ["radiology"],
    permissions: [readModelPermission]
  });
  const pharmacy = principal({
    actorId: "pharmacy-pilot-115",
    roles: ["pharmacy"],
    permissions: [readModelPermission]
  });
  const administrator = principal({
    actorId: "administrator-pilot-115",
    roles: ["administrator"],
    permissions: [readModelPermission]
  });
  const operator = principal({
    actorId: "operator-pilot-115",
    roles: ["operator"],
    permissions: [projectionReadPermission, projectionRetryPermission]
  });

  assert.ok((await readModel(service, "clinical", "patients", patientId, doctor)).items.some((item) => item.subjectId === patientId));
  assert.ok((await readModel(service, "clinical", "clinical_timeline", patientId, doctor)).items.length >= 2);
  assert.ok((await readModel(service, "laboratory", "orders", undefined, laboratory)).items.some((item) => item.subjectId === patientId));
  assert.ok((await readModel(service, "radiology", "reports", undefined, radiology)).items.some((item) => item.subjectId === patientId));
  assert.ok((await readModel(service, "pharmacy", "prescriptions", undefined, pharmacy)).items.some((item) => item.subjectId === "prescription-pilot-115"));
  assert.ok((await readModel(service, "admin", "users", undefined, administrator)).items.some((item) => item.subjectId === "user-pilot-115"));
  assert.ok((await readModel(service, "patient_portal", "appointments", undefined, patient)).items.some((item) => item.subjectId === patientId));
  assert.ok((await readModel(service, "patient_portal", "messages", undefined, patient)).items.some((item) => item.subjectId === patientId));

  const otherPatient = await readModel(service, "patient_portal", "appointments", undefined, principal({
    actorId: "patient-other-pilot-115",
    roles: ["patient"],
    permissions: [readModelPermission]
  }));
  assert.equal(otherPatient.items.length, 0);

  const eventReview = await service.listWriteWorkflowEvents({ limit: 100, offset: 0 }, operator);
  const projectionReview = await service.listWriteWorkflowProjections({ limit: 100, offset: 0 }, operator);
  assert.equal(eventReview.items.length, journeySteps.length);
  assert.equal(eventReview.items.every((item) => item.projections.length > 0), true);
  assert.ok(projectionReview.items.length >= journeySteps.length);
  assert.equal(projectionReview.items.every((item) => item.requestId?.startsWith("sprint115-request-")), true);

  const beforeReviewWorkflowCount = repository.writeWorkflows.length;
  await service.listWriteWorkflowEvents({ limit: 10, offset: 0 }, operator);
  await service.listWriteWorkflowProjections({ limit: 10, offset: 0 }, operator);
  assert.equal(repository.writeWorkflows.length, beforeReviewWorkflowCount);

  const failedProjection = repository.writeWorkflowProjections.find((projection) => projection.eventType === "patient.created");
  failedProjection.projectionStatus = "failed";
  failedProjection.status = "failed";
  failedProjection.failureReason = "sprint 115 controlled projection retry evidence";
  const replayed = await service.retryWriteWorkflowProjection(failedProjection.id, operator);
  assert.equal(replayed.projectionStatus, "replayed");
  assert.equal(replayed.retryCount, 1);

  const clinicalPatientDefinition = writeWorkflowDefinitions.find((item) => item.eventType === "patient.created");
  const pharmacyDefinition = writeWorkflowDefinitions.find((item) => item.eventType === "prescription.created");
  const radiologyApproveDefinition = writeWorkflowDefinitions.find((item) => item.eventType === "radiology.report.approved");
  await assert.rejects(
    () => service.executeWriteWorkflow(clinicalPatientDefinition, {}, baseWriteWorkflow({ subjectId: patientId }), {}),
    (error) => error instanceof CommandAuthorizationError
  );
  await assert.rejects(
    () => service.executeWriteWorkflow(clinicalPatientDefinition, {}, baseWriteWorkflow({ tenantId: "tenant-other", subjectId: patientId }), principal({ roles: ["doctor"], permissions: [writeWorkflowPermission] })),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("tenant")
  );
  await assert.rejects(
    () => service.executeWriteWorkflow(pharmacyDefinition, {}, baseWriteWorkflow({ subjectId: "prescription-denied" }), principal({ roles: ["laboratory"], permissions: [writeWorkflowPermission] })),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("write workflow")
  );
  await assert.rejects(
    () => service.executeWriteWorkflow(radiologyApproveDefinition, { reportId: "report-denied" }, baseWriteWorkflow(), principal({ roles: ["pharmacy"], permissions: [writeWorkflowPermission] })),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("write workflow")
  );
  await assert.rejects(
    () => service.executeWriteWorkflow(
      clinicalPatientDefinition,
      {},
      baseWriteWorkflow({
        subjectId: patientId,
        workflowControls: {
          ...baseWriteWorkflow().workflowControls,
          noAutonomousTreatment: false
        }
      }),
      principal({ roles: ["doctor"], permissions: [writeWorkflowPermission] })
    ),
    (error) => error instanceof CommandValidationError && error.message.includes("noAutonomousTreatment")
  );
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

function concreteOperationalPath(path) {
  return path
    .replaceAll("{patientId}", "patient-operational-core-001")
    .replaceAll("{prescriptionId}", "prescription-operational-core-001")
    .replaceAll("{orderId}", "order-operational-core-001");
}

function concreteOperationalParams(definition) {
  const params = {};
  if (definition.path.includes("{patientId}")) params.patientId = "patient-operational-core-001";
  if (definition.path.includes("{prescriptionId}")) params.prescriptionId = "prescription-operational-core-001";
  if (definition.path.includes("{orderId}")) params.orderId = "order-operational-core-001";
  return params;
}

function sprint115JourneySteps(patientId) {
  return [
    { journey: "Administration", label: "tenant created", eventType: "tenant.created", subjectId: "tenant-record-pilot-115" },
    { journey: "Administration", label: "organization created", eventType: "organization.created", subjectId: "organization-pilot-115" },
    { journey: "Administration", label: "department created", eventType: "department.created", subjectId: "department-pilot-115" },
    { journey: "Administration", label: "user created", eventType: "user.created", subjectId: "user-pilot-115" },
    { journey: "Administration", label: "role created", eventType: "role.created", subjectId: "role-pilot-115" },
    { journey: "Administration", label: "role assigned", eventType: "role.assigned", subjectId: "user-pilot-115", params: { userId: "user-pilot-115" } },
    { journey: "Administration", label: "configuration updated", eventType: "configuration.updated", subjectId: "configuration-pilot-115" },
    { journey: "Clinician", label: "patient created", eventType: "patient.created", subjectId: patientId },
    { journey: "Clinician", label: "patient updated", eventType: "patient.updated", subjectId: patientId, params: { patientId } },
    { journey: "Clinician", label: "encounter created", eventType: "encounter.created", subjectId: patientId, params: { patientId } },
    { journey: "Clinician", label: "clinical note created", eventType: "clinical.note.created", subjectId: patientId, params: { patientId } },
    { journey: "Clinician", label: "allergy created", eventType: "allergy.created", subjectId: patientId, params: { patientId } },
    { journey: "Clinician", label: "condition created", eventType: "condition.created", subjectId: patientId, params: { patientId } },
    { journey: "Clinician", label: "medication created", eventType: "medication.created", subjectId: patientId, params: { patientId } },
    { journey: "Clinician", label: "vital signs created", eventType: "vital.signs.created", subjectId: patientId, params: { patientId } },
    { journey: "Clinician", label: "care team updated", eventType: "care.team.updated", subjectId: patientId, params: { patientId } },
    { journey: "Laboratory", label: "lab order created", eventType: "lab.order.created", subjectId: patientId },
    { journey: "Laboratory", label: "specimen collected", eventType: "specimen.collected", subjectId: "specimen-pilot-115", params: { specimenId: "specimen-pilot-115" } },
    { journey: "Laboratory", label: "specimen received", eventType: "specimen.received", subjectId: "specimen-pilot-115", params: { specimenId: "specimen-pilot-115" } },
    { journey: "Laboratory", label: "lab result entered", eventType: "lab.result.entered", subjectId: patientId },
    { journey: "Laboratory", label: "lab result validated", eventType: "lab.result.validated", subjectId: "result-pilot-115", params: { resultId: "result-pilot-115" } },
    { journey: "Laboratory", label: "lab result approved", eventType: "lab.result.approved", subjectId: "result-pilot-115", params: { resultId: "result-pilot-115" } },
    { journey: "Laboratory", label: "critical lab result flagged", eventType: "critical.lab.result.flagged", subjectId: "result-pilot-115-critical", params: { resultId: "result-pilot-115-critical" } },
    { journey: "Radiology", label: "imaging order created", eventType: "imaging.order.created", subjectId: patientId },
    { journey: "Radiology", label: "imaging study started", eventType: "imaging.study.started", subjectId: "study-pilot-115", params: { studyId: "study-pilot-115" } },
    { journey: "Radiology", label: "imaging study completed", eventType: "imaging.study.completed", subjectId: "study-pilot-115", params: { studyId: "study-pilot-115" } },
    { journey: "Radiology", label: "radiology report created", eventType: "radiology.report.created", subjectId: patientId },
    { journey: "Radiology", label: "radiology report approved", eventType: "radiology.report.approved", subjectId: "report-pilot-115", params: { reportId: "report-pilot-115" } },
    { journey: "Radiology", label: "critical finding flagged", eventType: "critical.finding.flagged", subjectId: "report-pilot-115-critical", params: { reportId: "report-pilot-115-critical" } },
    { journey: "Pharmacy", label: "prescription created", eventType: "prescription.created", subjectId: "prescription-pilot-115" },
    { journey: "Pharmacy", label: "prescription reviewed", eventType: "prescription.reviewed", subjectId: "prescription-pilot-115", params: { prescriptionId: "prescription-pilot-115" } },
    { journey: "Pharmacy", label: "medication safety validated", eventType: "medication.safety.validated", subjectId: "prescription-pilot-115", params: { prescriptionId: "prescription-pilot-115" } },
    { journey: "Pharmacy", label: "medication dispensed", eventType: "medication.dispensed", subjectId: "prescription-pilot-115", params: { prescriptionId: "prescription-pilot-115" } },
    { journey: "Pharmacy", label: "pharmacy inventory updated", eventType: "pharmacy.inventory.updated", subjectId: "inventory-pilot-115" },
    { journey: "Pharmacy", label: "medication safety alert flagged", eventType: "medication.safety.alert.flagged", subjectId: "med-alert-pilot-115" },
    { journey: "Scheduling", label: "appointment created", eventType: "appointment.created", subjectId: patientId },
    { journey: "Scheduling", label: "appointment updated", eventType: "appointment.updated", subjectId: "appointment-pilot-115", params: { appointmentId: "appointment-pilot-115" } },
    { journey: "Scheduling", label: "appointment checked in", eventType: "appointment.checked_in", subjectId: "appointment-pilot-115", params: { appointmentId: "appointment-pilot-115" } },
    { journey: "Scheduling", label: "appointment completed", eventType: "appointment.completed", subjectId: "appointment-pilot-115", params: { appointmentId: "appointment-pilot-115" } },
    { journey: "Scheduling", label: "appointment cancelled", eventType: "appointment.cancelled", subjectId: "appointment-pilot-115", params: { appointmentId: "appointment-pilot-115" } },
    { journey: "Patient Portal", label: "patient appointment requested", eventType: "patient.appointment.requested", subjectId: patientId, actorId: patientId },
    { journey: "Patient Portal", label: "secure message sent", eventType: "patient.secure.message.sent", subjectId: patientId, actorId: patientId },
    { journey: "Patient Portal", label: "refill requested", eventType: "patient.refill.requested", subjectId: patientId, actorId: patientId },
    { journey: "Patient Portal", label: "report requested", eventType: "patient.report.requested", subjectId: patientId, actorId: patientId },
    { journey: "Patient Portal", label: "communication preferences updated", eventType: "patient.communication.preferences.updated", subjectId: patientId, actorId: patientId }
  ];
}

function assertReadModel(repository, workspace, modelKey, subjectId) {
  assert.ok(
    repository.readModels.some((record) => record.workspace === workspace && record.modelKey === modelKey && record.subjectId === subjectId),
    `${workspace}.${modelKey}.${subjectId} read model must exist`
  );
}

async function readModel(service, workspace, modelKey, subjectId, actor) {
  const definition = readModelDefinitions.find((item) => item.workspace === workspace && item.modelKey === modelKey);
  assert.ok(definition, `${workspace}.${modelKey} read model definition must exist`);
  const params = definition.subjectParam ? { [definition.subjectParam]: subjectId } : {};
  return service.listReadModel(definition, params, { limit: 100, offset: 0 }, actor);
}
