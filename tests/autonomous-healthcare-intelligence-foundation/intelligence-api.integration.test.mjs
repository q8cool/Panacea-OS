import assert from "node:assert/strict";
import test from "node:test";
import { createAutonomousHealthcareIntelligenceServer } from "../../services/autonomous-healthcare-intelligence-foundation/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/autonomous-healthcare-intelligence-foundation/src/domain/intelligence-domain.mjs";
import { baseRecord, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createAutonomousHealthcareIntelligenceServer({ service });
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
      "x-tenant-id": "tenant-autonomous-intelligence",
      "x-actor-id": "api-actor-1",
      "x-permissions": "autonomous_intelligence.*",
      "x-country-codes": "KW,SA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

test("REST API records foundation, governance, safety, traceability, orchestration, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const capability = await postJson(baseUrl, "/foundation/capabilities", baseRecord({ status: "registered" }));
    assert.equal(capability.response.status, 201);
    assert.equal(capability.json.event.eventType, "intelligence.capability.registered");

    const governance = await postJson(baseUrl, "/clinical-governance/recommendations", baseRecord({ status: "completed" }));
    assert.equal(governance.response.status, 201);
    assert.equal(governance.json.event.eventType, "recommendation.governance.completed");

    const safety = await postJson(baseUrl, "/safety/unsafe-recommendation-blocking", baseRecord({ status: "blocked" }));
    assert.equal(safety.response.status, 201);
    assert.equal(safety.json.event.eventType, "unsafe.recommendation.blocked");

    const trace = await postJson(baseUrl, "/traceability/intelligence-traces", baseRecord({ status: "generated" }));
    assert.equal(trace.response.status, 201);
    assert.equal(trace.json.event.eventType, "intelligence.trace.created");

    const orchestration = await postJson(baseUrl, "/orchestration/orchestrators", baseRecord({ status: "active" }));
    assert.equal(orchestration.response.status, 201);
    assert.equal(orchestration.json.data.governanceContext.clinicianApprovalEnforced, true);

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-autonomous-intelligence",
      sourceSystem: "ahos_core",
      sourceResourceType: "enterprise_state",
      sourceResourceId: "state-001",
      intelligenceResourceType: "cross_platform_intelligence_orchestrator",
      intelligenceResourceId: "orchestrator-001",
      countryCode: "KW"
    });
    assert.equal(integration.response.status, 201);
    assert.equal(repository.records.length, 5);
    assert.equal(repository.references.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("REST API rejects unauthenticated requests and exposes OpenAPI", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const unauthenticated = await fetch(`${baseUrl}/foundation/registries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "registered" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "4.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/safety/emergency-stops`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
