import assert from "node:assert/strict";
import test from "node:test";
import { createGlobalProductManagementServer } from "../../services/global-product-management-roadmap-innovation-portfolio-platform/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/global-product-management-roadmap-innovation-portfolio-platform/src/domain/product-management-domain.mjs";
import { baseRecord, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createGlobalProductManagementServer({ service });
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
      "x-tenant-id": "tenant-global-product",
      "x-actor-id": "api-actor-1",
      "x-permissions": "global_product_management.*",
      "x-country-codes": "KW,SA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

test("REST API records product, roadmap, innovation, requirement, feedback, release, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const product = await postJson(baseUrl, "/products/registries", baseRecord({ status: "registered" }));
    assert.equal(product.response.status, 201);
    assert.equal(product.json.event.eventType, "product.created");

    const roadmap = await postJson(baseUrl, "/roadmaps/registries", baseRecord({ status: "updated" }));
    assert.equal(roadmap.response.status, 201);
    assert.equal(roadmap.json.event.eventType, "roadmap.updated");

    const innovation = await postJson(baseUrl, "/innovation/approvals", baseRecord({ status: "approved" }));
    assert.equal(innovation.response.status, 201);
    assert.equal(innovation.json.event.eventType, "innovation.approved");

    const requirement = await postJson(baseUrl, "/requirements/traceability", baseRecord({ status: "linked" }));
    assert.equal(requirement.response.status, 201);
    assert.equal(requirement.json.event.eventType, "requirement.created");

    const feedback = await postJson(baseUrl, "/feedback/customers", baseRecord({ status: "received" }));
    assert.equal(feedback.response.status, 201);
    assert.equal(feedback.json.event.eventType, "feedback.received");

    const release = await postJson(baseUrl, "/releases/approvals", baseRecord({ status: "approved" }));
    assert.equal(release.response.status, 201);
    assert.equal(release.json.event.eventType, "release.approved");

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-global-product",
      sourceSystem: "developer_platform",
      sourceResourceType: "plugin",
      sourceResourceId: "plugin-001",
      productManagementResourceType: "feature_registry",
      productManagementResourceId: "feature-001",
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
    const unauthenticated = await fetch(`${baseUrl}/products/registries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "registered" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "3.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/roadmaps/approvals`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
