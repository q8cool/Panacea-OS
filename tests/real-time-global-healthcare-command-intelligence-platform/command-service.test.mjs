import assert from "node:assert/strict";
import test from "node:test";
import {
  CommandAuthorizationError,
  CommandValidationError
} from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/command-validation.mjs";
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
