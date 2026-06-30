import assert from "node:assert/strict";
import test from "node:test";
import {
  CustomerSuccessAuthorizationError,
  CustomerSuccessValidationError
} from "../../services/global-customer-success-support-service-management-platform/src/domain/customer-success-validation.mjs";
import { baseRecord, createServiceWithRepository, principal } from "./fixtures.mjs";

test("Sprint 75 service persists required customer success events and audit entries", async () => {
  const { service, repository } = createServiceWithRepository();
  const actor = principal();
  await service.recordCustomerSuccess(baseRecord({ recordType: "customer_registry", status: "registered" }), actor);
  await service.recordCustomerSuccess(baseRecord({ recordType: "customer_health_score", status: "updated" }), actor);
  await service.recordEnterpriseSupport(baseRecord({ recordType: "support_ticket_registry", status: "open" }), actor);
  await service.recordEnterpriseSupport(baseRecord({ recordType: "escalation_workflow", status: "escalated" }), actor);
  await service.recordEnterpriseSupport(baseRecord({ recordType: "ticket_lifecycle", status: "resolved" }), actor);
  await service.recordServiceManagement(baseRecord({ recordType: "incident_management", status: "open" }), actor);
  await service.recordServiceManagement(baseRecord({ recordType: "post_incident_review", status: "resolved" }), actor);
  await service.recordServiceManagement(baseRecord({ recordType: "service_request_management", status: "open" }), actor);
  await service.recordImplementationOnboarding(baseRecord({ recordType: "customer_onboarding_workflow", status: "started" }), actor);
  await service.recordImplementationOnboarding(baseRecord({ recordType: "customer_onboarding_workflow", status: "completed" }), actor);
  await service.recordCustomerCommunication(baseRecord({ recordType: "customer_feedback", status: "received" }), actor);

  assert.deepEqual(
    repository.events.map((event) => event.eventType),
    [
      "customer.created",
      "customer.health.updated",
      "support.ticket.created",
      "support.ticket.escalated",
      "support.ticket.resolved",
      "incident.created",
      "incident.resolved",
      "service.request.created",
      "onboarding.started",
      "onboarding.completed",
      "customer.feedback.received"
    ]
  );
  assert.equal(repository.records.length, 11);
  assert.equal(repository.audits.length, 11);
  assert.ok(repository.audits.every((entry) => entry.tenantId === "tenant-global-customer-success"));
});

test("support escalation and resolution workflows require controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordEnterpriseSupport(
        baseRecord({
          recordType: "escalation_workflow",
          status: "escalated",
          workflowControls: {
            ...baseRecord().workflowControls,
            escalationApproved: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CustomerSuccessValidationError && error.message.includes("escalationApproved")
  );
  await assert.rejects(
    () =>
      service.recordEnterpriseSupport(
        baseRecord({
          recordType: "ticket_lifecycle",
          status: "resolved",
          workflowControls: {
            ...baseRecord().workflowControls,
            resolutionValidated: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CustomerSuccessValidationError && error.message.includes("resolutionValidated")
  );
});

test("service management, onboarding, and feedback workflows enforce controls", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () =>
      service.recordServiceManagement(
        baseRecord({
          recordType: "post_incident_review",
          status: "resolved",
          workflowControls: {
            ...baseRecord().workflowControls,
            postIncidentReviewCompleted: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CustomerSuccessValidationError && error.message.includes("postIncidentReviewCompleted")
  );
  await assert.rejects(
    () =>
      service.recordImplementationOnboarding(
        baseRecord({
          recordType: "customer_onboarding_workflow",
          status: "completed",
          workflowControls: {
            ...baseRecord().workflowControls,
            goLiveReadinessApproved: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CustomerSuccessValidationError && error.message.includes("goLiveReadinessApproved")
  );
  await assert.rejects(
    () =>
      service.recordCustomerCommunication(
        baseRecord({
          recordType: "customer_feedback",
          status: "received",
          workflowControls: {
            ...baseRecord().workflowControls,
            feedbackConsentVerified: false
          }
        }),
        principal()
      ),
    (error) => error instanceof CustomerSuccessValidationError && error.message.includes("feedbackConsentVerified")
  );
});

test("service rejects tenant, country, and prohibited clinical automation violations", async () => {
  const { service } = createServiceWithRepository();
  await assert.rejects(
    () => service.recordCustomerSuccess(baseRecord({ recordType: "account_registry" }), principal({ tenantId: "different-tenant" })),
    (error) => error instanceof CustomerSuccessAuthorizationError && error.message.includes("tenant")
  );
  await assert.rejects(
    () => service.recordCustomerSuccess(baseRecord({ recordType: "account_registry", countryCode: "BH" }), principal()),
    (error) => error instanceof CustomerSuccessAuthorizationError && error.message.includes("country")
  );
  await assert.rejects(
    () =>
      service.recordCustomerSuccess(
        baseRecord({
          recordType: "customer_registry",
          description: "This customer success workflow must never perform autonomous diagnosis."
        }),
        principal()
      ),
    (error) => error instanceof CustomerSuccessValidationError && error.message.includes("prohibited clinical automation")
  );
});

test("integration references are authorized, tenant-isolated, and auditable", async () => {
  const { service, repository } = createServiceWithRepository();
  const reference = await service.createIntegrationReference(
    {
      tenantId: "tenant-global-customer-success",
      sourceSystem: "legal_governance_platform",
      sourceResourceType: "contract",
      sourceResourceId: "contract-001",
      customerSuccessResourceType: "customer_registry",
      customerSuccessResourceId: "customer-001",
      countryCode: "KW",
      metadata: { integration: "customer-contract" }
    },
    principal()
  );
  assert.equal(reference.sourceSystem, "legal_governance_platform");
  assert.equal(repository.references.length, 1);
  assert.equal(repository.audits[0].action, "global_customer_success.integration_reference.created");
});
