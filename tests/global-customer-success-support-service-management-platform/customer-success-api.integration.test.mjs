import assert from "node:assert/strict";
import test from "node:test";
import { createGlobalCustomerSuccessServer } from "../../services/global-customer-success-support-service-management-platform/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/global-customer-success-support-service-management-platform/src/domain/customer-success-domain.mjs";
import { baseRecord, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createGlobalCustomerSuccessServer({ service });
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      resolve({ server, repository, baseUrl: `http://127.0.0.1:${address.port}${API_BASE_PATH}` });
    });
  });
}

async function postJson(baseUrl, path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tenant-id": "tenant-global-customer-success",
      "x-actor-id": "api-actor-1",
      "x-permissions": "global_customer_success.*",
      "x-country-codes": "KW,SA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

test("REST API records customer, support, service, onboarding, communication, analytics, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const customer = await postJson(baseUrl, "/customers/registries", baseRecord({ status: "registered" }));
    assert.equal(customer.response.status, 201);
    assert.equal(customer.json.event.eventType, "customer.created");

    const escalation = await postJson(baseUrl, "/support/escalations", baseRecord({ status: "escalated" }));
    assert.equal(escalation.response.status, 201);
    assert.equal(escalation.json.event.eventType, "support.ticket.escalated");

    const incident = await postJson(baseUrl, "/service/incidents", baseRecord({ status: "open" }));
    assert.equal(incident.response.status, 201);
    assert.equal(incident.json.event.eventType, "incident.created");

    const onboarding = await postJson(baseUrl, "/onboarding/workflows", baseRecord({ status: "completed" }));
    assert.equal(onboarding.response.status, 201);
    assert.equal(onboarding.json.event.eventType, "onboarding.completed");

    const feedback = await postJson(baseUrl, "/communications/customer-feedback", baseRecord({ status: "received" }));
    assert.equal(feedback.response.status, 201);
    assert.equal(feedback.json.event.eventType, "customer.feedback.received");

    const analytics = await postJson(baseUrl, "/analytics/sla-performance", baseRecord({ status: "measured" }));
    assert.equal(analytics.response.status, 201);
    assert.equal(analytics.json.event.eventType, "customer.health.updated");

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-global-customer-success",
      sourceSystem: "devops_platform",
      sourceResourceType: "incident",
      sourceResourceId: "incident-001",
      customerSuccessResourceType: "incident_management",
      customerSuccessResourceId: "incident-record-001",
      countryCode: "KW"
    });
    assert.equal(integration.response.status, 201);
    assert.equal(repository.records.length, 6);
    assert.equal(repository.references.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("REST API rejects unauthenticated requests and exposes OpenAPI", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const unauthenticated = await fetch(`${baseUrl}/customers/registries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "registered" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "3.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/support/escalations`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
