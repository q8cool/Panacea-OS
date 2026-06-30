import assert from "node:assert/strict";
import test from "node:test";
import { createRealTimeGlobalCommandIntelligenceServer } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/real-time-global-healthcare-command-intelligence-platform/src/domain/command-domain.mjs";
import { baseRecord, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createRealTimeGlobalCommandIntelligenceServer({ service });
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
      "x-tenant-id": "tenant-global-command",
      "x-actor-id": "api-command-actor-1",
      "x-permissions": "global_command_intelligence.*",
      "x-country-codes": "KW,SA",
      "x-region-codes": "GCC,MENA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

test("REST API records command center, operational, alert, crisis, decision, executive, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const command = await postJson(baseUrl, "/command-centers/global", baseRecord({ status: "created" }));
    assert.equal(command.response.status, 201);
    assert.equal(command.json.event.eventType, "command.center.created");

    const operational = await postJson(baseUrl, "/operational/capacity", baseRecord({ status: "updated" }));
    assert.equal(operational.response.status, 201);
    assert.equal(operational.json.event.eventType, "situation.updated");

    const alert = await postJson(baseUrl, "/alerts/correlation", baseRecord({ status: "correlated" }));
    assert.equal(alert.response.status, 201);
    assert.equal(alert.json.event.eventType, "alert.correlated");

    const crisis = await postJson(baseUrl, "/crisis/emergency-operations", baseRecord({ status: "started" }));
    assert.equal(crisis.response.status, 201);
    assert.equal(crisis.json.event.eventType, "emergency.coordination.started");

    const decision = await postJson(baseUrl, "/decision-support/capacity", baseRecord({ status: "generated" }));
    assert.equal(decision.response.status, 201);
    assert.equal(decision.json.event.eventType, "command.recommendation.generated");
    assert.equal(decision.json.data.governanceContext.advisoryOnly, true);

    const executive = await postJson(baseUrl, "/executive/briefings", baseRecord({ status: "generated" }));
    assert.equal(executive.response.status, 201);
    assert.equal(executive.json.event.eventType, "executive.briefing.generated");

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-global-command",
      sourceSystem: "ahos_core",
      sourceResourceType: "enterprise_state",
      sourceResourceId: "state-001",
      commandResourceType: "real_time_situation_awareness",
      commandResourceId: "situation-001",
      countryCode: "KW",
      regionCode: "GCC"
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
    const unauthenticated = await fetch(`${baseUrl}/command-centers/global`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "created" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "4.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/crisis/cross-region`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
