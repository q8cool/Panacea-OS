import assert from "node:assert/strict";
import test from "node:test";
import {
  CommandAuthorizationError,
  CommandValidationError
} from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/command-validation.mjs";
import { readModelDefinitions } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/read-models.mjs";
import { baseRecord, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 85 service persists required command intelligence events and audit entries", async () => {
  const { service, repository } = createServiceWithRepository();
  const actor = principal();
  await service.recordCommandIntelligence(baseRecord({ recordType: "global_healthcare_command_center", status: "created" }), actor);
  await service.recordCommandIntelligence(baseRecord({ recordType: "command_event_timeline", status: "created" }), actor);
  await service.recordOperationalIntelligence(baseRecord({ recordType: "real_time_capacity_intelligence", status: "updated" }), actor);
  await service.recordAlertIntelligence(baseRecord({ recordType: "alert_correlation", status: "correlated" }), actor);
  await service.recordAlertIntelligence(baseRecord({ recordType: "alert_escalation", status: "escalated" }), actor);
  await service.recordCrisisCoordination(baseRecord({ recordType: "crisis_event_registry", status: "created" }), actor);
  await service.recordCrisisCoordination(baseRecord({ recordType: "emergency_operations_workflow", status: "started" }), actor);
  await service.recordDecisionSupport(baseRecord({ recordType: "capacity_recommendation", status: "generated" }), actor);
  await service.recordExecutiveIntelligence(baseRecord({ recordType: "executive_briefing_generator", status: "generated" }), actor);

  assert.deepEqual(
    repository.events.map((event) => event.eventType),
    [
      "command.center.created",
      "command.event.created",
      "situation.updated",
      "alert.correlated",
      "alert.escalated",
      "crisis.event.created",
      "emergency.coordination.started",
      "command.recommendation.generated",
      "executive.briefing.generated"
    ]
  );
  assert.equal(repository.records.length, 9);
  assert.equal(repository.audits.length, 9);
  assert.ok(repository.records.every((record) => record.governanceContext.advisoryOnly));
});

test("alert correlation, crisis coordination, recommendations, and executive briefings require governance controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordAlertIntelligence(
        baseRecord({
          recordType: "alert_correlation",
          workflowControls: {
            ...baseRecord().workflowControls,
            alertCorrelationReviewed: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CommandValidationError && error.message.includes("alertCorrelationReviewed")
  );
  await assert.rejects(
    () =>
      service.recordCrisisCoordination(
        baseRecord({
          recordType: "mass_casualty_coordination",
          workflowControls: {
            ...baseRecord().workflowControls,
            massCasualtyGovernanceChecked: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CommandValidationError && error.message.includes("massCasualtyGovernanceChecked")
  );
  await assert.rejects(
    () =>
      service.recordDecisionSupport(
        baseRecord({
          recordType: "capacity_recommendation",
          workflowControls: {
            ...baseRecord().workflowControls,
            noAutonomousExecution: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CommandValidationError && error.message.includes("noAutonomousExecution")
  );
  await assert.rejects(
    () =>
      service.recordExecutiveIntelligence(
        baseRecord({
          recordType: "executive_briefing_generator",
          workflowControls: {
            ...baseRecord().workflowControls,
            briefingReviewed: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CommandValidationError && error.message.includes("briefingReviewed")
  );
});

test("multi-region, tenant, country, and autonomous behavior controls are enforced", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordCommandIntelligence(
        baseRecord({
          recordType: "real_time_situation_awareness",
          governanceContext: {
            ...baseRecord().governanceContext,
            noAutonomousEmergencyEnforcement: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CommandValidationError && error.message.includes("noAutonomousEmergencyEnforcement")
  );
  await assert.rejects(
    () => service.recordCommandIntelligence(baseRecord({ recordType: "global_healthcare_command_center" }), principal({ tenantId: "different-tenant" })),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("tenant")
  );
  await assert.rejects(
    () => service.recordCommandIntelligence(baseRecord({ recordType: "global_healthcare_command_center", countryCode: "BH" }), principal()),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("country")
  );
  await assert.rejects(
    () => service.recordCommandIntelligence(baseRecord({ recordType: "global_healthcare_command_center", regionCode: "EU" }), principal()),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("region")
  );
  await assert.rejects(
    () =>
      service.recordDecisionSupport(
        baseRecord({
          recordType: "emergency_response_recommendation",
          description: "This workflow attempts automatic emergency enforcement."
        }),
        principal()
      ),
    (error) => error instanceof CommandValidationError && error.message.includes("prohibited autonomous clinical or emergency behavior")
  );
});

test("integration references are authorized, multi-region aware, and auditable", async () => {
  const { service, repository } = createServiceWithRepository();
  const reference = await service.createIntegrationReference(
    {
      tenantId: "tenant-global-command",
      sourceSystem: "autonomous_intelligence_foundation",
      sourceResourceType: "intelligence_trace",
      sourceResourceId: "trace-001",
      commandResourceType: "real_time_situation_awareness",
      commandResourceId: "situation-001",
      countryCode: "KW",
      regionCode: "GCC",
      metadata: { integration: "foundation-link" }
    },
    principal()
  );
  assert.equal(reference.sourceSystem, "autonomous_intelligence_foundation");
  assert.equal(repository.references.length, 1);
  assert.equal(repository.audits[0].action, "global_command_intelligence.integration_reference.created");
});

test("live read models are tenant-scoped, read-only, and audited", async () => {
  const { service, repository } = createServiceWithRepository();
  const definition = readModelDefinitions.find((item) => item.path === "/read-models/clinical/patients");
  repository.readModels.push(
    {
      id: "read-clinical-001",
      tenantId: "tenant-global-command",
      workspace: "clinical",
      modelKey: "patients",
      subjectId: "patient-live-001",
      status: "active",
      title: "Live Clinical Patient",
      payload: { patientId: "patient-live-001", source: "live-read-model" },
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-01T10:05:00.000Z"
    },
    {
      id: "read-clinical-other-tenant",
      tenantId: "tenant-other",
      workspace: "clinical",
      modelKey: "patients",
      subjectId: "patient-live-002",
      status: "active",
      title: "Other Tenant Clinical Patient",
      payload: { patientId: "patient-live-002" },
      createdAt: "2026-07-01T10:00:00.000Z",
      updatedAt: "2026-07-01T10:05:00.000Z"
    }
  );

  const result = await service.listReadModel(definition, {}, { limit: 25, offset: 0 }, principal({
    roles: ["doctor"],
    permissions: ["global_command_intelligence.read_models.read"]
  }));

  assert.equal(result.source, "live-read-model");
  assert.equal(result.demoData, false);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].id, "read-clinical-001");
  assert.equal(result.pagination.total, 1);
  assert.equal(repository.audits.at(-1).action, "global_command_intelligence.read_model.read");
});

test("live read models reject roles outside the workspace boundary", async () => {
  const { service } = createServiceWithRepository();
  const definition = readModelDefinitions.find((item) => item.path === "/read-models/clinical/patients");
  await assert.rejects(
    () => service.listReadModel(definition, {}, { limit: 25, offset: 0 }, principal({
      roles: ["patient"],
      permissions: ["patient.read"]
    })),
    (error) => error instanceof CommandAuthorizationError && error.message.includes("read model")
  );
});
