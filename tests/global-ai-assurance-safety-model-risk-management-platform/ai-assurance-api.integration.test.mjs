import assert from "node:assert/strict";
import test from "node:test";
import { createGlobalAiAssuranceServer } from "../../services/global-ai-assurance-safety-model-risk-management-platform/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/global-ai-assurance-safety-model-risk-management-platform/src/domain/ai-assurance-domain.mjs";
import { baseRecord, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createGlobalAiAssuranceServer({ service });
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
      "x-tenant-id": "tenant-global-ai-assurance",
      "x-actor-id": "api-actor-1",
      "x-permissions": "global_ai_assurance.*",
      "x-country-codes": "KW,SA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

test("REST API records assurance, model, prompt, agent, safety, incident, governance, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const assurance = await postJson(baseUrl, "/assurance/risk-classifications", baseRecord({ status: "classified" }));
    assert.equal(assurance.response.status, 201);
    assert.equal(assurance.json.event.eventType, "ai.risk.classified");

    const model = await postJson(baseUrl, "/models/approvals", baseRecord({ status: "approved" }));
    assert.equal(model.response.status, 201);
    assert.equal(model.json.event.eventType, "model.approved");

    const prompt = await postJson(baseUrl, "/prompt-agent/prompts/approvals", baseRecord({ status: "approved" }));
    assert.equal(prompt.response.status, 201);
    assert.equal(prompt.json.event.eventType, "prompt.approved");

    const agent = await postJson(baseUrl, "/prompt-agent/agents/runtime-approvals", baseRecord({ status: "approved" }));
    assert.equal(agent.response.status, 201);
    assert.equal(agent.json.event.eventType, "agent.approved");

    const safety = await postJson(baseUrl, "/safety-tests/reports", baseRecord({ status: "completed" }));
    assert.equal(safety.response.status, 201);
    assert.equal(safety.json.event.eventType, "ai.safety.test.completed");

    const incident = await postJson(baseUrl, "/incidents/registries", baseRecord({ status: "detected" }));
    assert.equal(incident.response.status, 201);
    assert.equal(incident.json.event.eventType, "ai.incident.created");

    const governance = await postJson(baseUrl, "/regulatory/audit-packages", baseRecord({ status: "generated" }));
    assert.equal(governance.response.status, 201);
    assert.equal(governance.json.event.eventType, "ai.audit.package.generated");

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-global-ai-assurance",
      sourceSystem: "learning_platform",
      sourceResourceType: "evaluation",
      sourceResourceId: "evaluation-001",
      aiAssuranceResourceType: "safety_test_reports",
      aiAssuranceResourceId: "safety-test-report-001",
      countryCode: "KW"
    });
    assert.equal(integration.response.status, 201);
    assert.equal(repository.records.length, 7);
    assert.equal(repository.references.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("REST API rejects unauthenticated requests and exposes OpenAPI", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const unauthenticated = await fetch(`${baseUrl}/assurance/registries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "registered" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "3.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/models/approvals`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
