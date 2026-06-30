import assert from "node:assert/strict";
import test from "node:test";
import { createGlobalPrivacyServer } from "../../services/global-enterprise-data-privacy-consent-trust-platform/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/global-enterprise-data-privacy-consent-trust-platform/src/domain/privacy-domain.mjs";
import { baseRecord, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createGlobalPrivacyServer({ service });
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
      "x-tenant-id": "tenant-global-privacy",
      "x-actor-id": "api-actor-1",
      "x-permissions": "global_privacy.*",
      "x-country-codes": "KW,SA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

test("REST API records consent, data rights, policy, sharing, trust, monitoring, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const consent = await postJson(baseUrl, "/consents/capture", baseRecord({ status: "captured" }));
    assert.equal(consent.response.status, 201);
    assert.equal(consent.json.event.eventType, "consent.created");

    const dataRights = await postJson(baseUrl, "/data-rights/export-requests", baseRecord({ status: "completed" }));
    assert.equal(dataRights.response.status, 201);
    assert.equal(dataRights.json.event.eventType, "data.export.completed");

    const policy = await postJson(baseUrl, "/privacy-policies/purpose-access", baseRecord({ status: "enforced" }));
    assert.equal(policy.response.status, 201);
    assert.equal(policy.json.event.eventType, "privacy.policy.updated");

    const sharing = await postJson(baseUrl, "/data-sharing/approvals", baseRecord({ status: "approved" }));
    assert.equal(sharing.response.status, 201);
    assert.equal(sharing.json.event.eventType, "data.sharing.approved");

    const trust = await postJson(baseUrl, "/trust/registries", baseRecord({ status: "registered" }));
    assert.equal(trust.response.status, 201);
    assert.equal(trust.json.event.eventType, "trust.relationship.created");

    const violation = await postJson(baseUrl, "/monitoring/consent-violations", baseRecord({ status: "detected" }));
    assert.equal(violation.response.status, 201);
    assert.equal(violation.json.event.eventType, "privacy.violation.detected");

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-global-privacy",
      sourceSystem: "ai_assurance_platform",
      sourceResourceType: "ai_data_use_review",
      sourceResourceId: "ai-data-use-review-001",
      privacyResourceType: "ai_data_use_controls",
      privacyResourceId: "ai-data-use-control-001",
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
    const unauthenticated = await fetch(`${baseUrl}/consents/registries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "registered" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "3.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/data-sharing/cross-border`]);
    assert.ok(document.paths[`${API_BASE_PATH}/trust/verification`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
