import assert from "node:assert/strict";
import test from "node:test";
import { createGlobalWorkforceServer } from "../../services/global-workforce-hr-credentialing-staff-experience-platform/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/global-workforce-hr-credentialing-staff-experience-platform/src/domain/workforce-domain.mjs";
import { baseRecord, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createGlobalWorkforceServer({ service });
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      resolve({
        server,
        repository,
        baseUrl: `http://127.0.0.1:${address.port}${API_BASE_PATH}`
      });
    });
  });
}

async function postJson(baseUrl, path, body, headers = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tenant-id": "tenant-global-workforce",
      "x-actor-id": "api-actor-1",
      "x-permissions": "global_workforce.*",
      "x-country-codes": "KW,SA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return {
    response,
    json: await response.json()
  };
}

test("REST API records workforce, credentialing, HR, compliance, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const staff = await postJson(baseUrl, "/workforce/staff", baseRecord({ status: "registered" }));
    assert.equal(staff.response.status, 201);
    assert.equal(staff.json.event.eventType, "staff.created");

    const verification = await postJson(baseUrl, "/credentialing/verifications", baseRecord({ status: "verified" }));
    assert.equal(verification.response.status, 201);
    assert.equal(verification.json.event.eventType, "credential.verified");

    const onboarding = await postJson(baseUrl, "/hr/onboarding", baseRecord({ status: "under_review" }));
    assert.equal(onboarding.response.status, 201);
    assert.equal(onboarding.json.event.eventType, "staff.updated");

    const compliance = await postJson(baseUrl, "/compliance/credentials", baseRecord({ status: "compliant" }));
    assert.equal(compliance.response.status, 201);
    assert.equal(compliance.json.event.eventType, "compliance.updated");

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-global-workforce",
      sourceSystem: "scheduling_platform",
      sourceResourceType: "shift",
      sourceResourceId: "shift-001",
      workforceResourceType: "shift_management",
      workforceResourceId: "record-001",
      countryCode: "KW"
    });
    assert.equal(integration.response.status, 201);
    assert.equal(repository.records.length, 4);
    assert.equal(repository.references.length, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("REST API rejects unauthenticated requests and exposes OpenAPI", async () => {
  const { server, baseUrl } = await startServer();
  try {
    const unauthenticated = await fetch(`${baseUrl}/workforce/staff`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "registered" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "3.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/credentialing/verifications`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
