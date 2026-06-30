import assert from "node:assert/strict";
import test from "node:test";
import { createGlobalLegalServer } from "../../services/global-legal-contracting-risk-governance-platform/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/global-legal-contracting-risk-governance-platform/src/domain/legal-domain.mjs";
import { baseRecord, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createGlobalLegalServer({ service });
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
      "x-tenant-id": "tenant-global-legal",
      "x-actor-id": "api-actor-1",
      "x-permissions": "global_legal.*",
      "x-country-codes": "KW,SA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

test("REST API records legal, contract, risk, governance, policy, regulatory, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const matter = await postJson(baseUrl, "/legal/matters", baseRecord({ status: "registered" }));
    assert.equal(matter.response.status, 201);
    assert.equal(matter.json.event.eventType, "legal.matter.created");

    const contract = await postJson(baseUrl, "/contracts/approval-workflows", baseRecord({ status: "approved" }));
    assert.equal(contract.response.status, 201);
    assert.equal(contract.json.event.eventType, "contract.approved");

    const risk = await postJson(baseUrl, "/risks/mitigations", baseRecord({ status: "mitigated" }));
    assert.equal(risk.response.status, 201);
    assert.equal(risk.json.event.eventType, "risk.mitigated");

    const decision = await postJson(baseUrl, "/governance/decisions", baseRecord({ status: "recorded" }));
    assert.equal(decision.response.status, 201);
    assert.equal(decision.json.event.eventType, "governance.decision.recorded");

    const policy = await postJson(baseUrl, "/policies/publications", baseRecord({ status: "published" }));
    assert.equal(policy.response.status, 201);
    assert.equal(policy.json.event.eventType, "policy.published");

    const regulatory = await postJson(baseUrl, "/regulatory/obligations", baseRecord({ status: "updated" }));
    assert.equal(regulatory.response.status, 201);
    assert.equal(regulatory.json.event.eventType, "regulatory.obligation.updated");

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-global-legal",
      sourceSystem: "quality_platform",
      sourceResourceType: "audit_finding",
      sourceResourceId: "finding-001",
      legalResourceType: "legal_matter_registry",
      legalResourceId: "matter-001",
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
    const unauthenticated = await fetch(`${baseUrl}/legal/matters`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "registered" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "3.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/contracts/approval-workflows`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
