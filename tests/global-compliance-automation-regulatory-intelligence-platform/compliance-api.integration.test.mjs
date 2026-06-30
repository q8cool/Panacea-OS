import assert from "node:assert/strict";
import test from "node:test";
import { createGlobalComplianceServer } from "../../services/global-compliance-automation-regulatory-intelligence-platform/src/api/server.mjs";
import { API_BASE_PATH } from "../../services/global-compliance-automation-regulatory-intelligence-platform/src/domain/compliance-domain.mjs";
import { baseRecord, createServiceWithRepository } from "./fixtures.mjs";

function startServer() {
  const { service, repository } = createServiceWithRepository();
  const server = createGlobalComplianceServer({ service });
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
      "x-tenant-id": "tenant-global-compliance",
      "x-actor-id": "api-actor-1",
      "x-permissions": "global_compliance.*",
      "x-country-codes": "KW,SA",
      ...headers
    },
    body: JSON.stringify(body)
  });
  return { response, json: await response.json() };
}

test("REST API records regulatory, compliance, audit, certification, policy, reporting, and integration resources", async () => {
  const { server, repository, baseUrl } = await startServer();
  try {
    const regulation = await postJson(baseUrl, "/regulatory/frameworks", baseRecord({ status: "registered" }));
    assert.equal(regulation.response.status, 201);
    assert.equal(regulation.json.event.eventType, "regulation.created");

    const gap = await postJson(baseUrl, "/compliance/gaps", baseRecord({ status: "detected" }));
    assert.equal(gap.response.status, 201);
    assert.equal(gap.json.event.eventType, "compliance.gap.detected");

    const audit = await postJson(baseUrl, "/audits/closures", baseRecord({ status: "completed" }));
    assert.equal(audit.response.status, 201);
    assert.equal(audit.json.event.eventType, "audit.completed");

    const certification = await postJson(baseUrl, "/certifications/expiration-alerts", baseRecord({ status: "expiring" }));
    assert.equal(certification.response.status, 201);
    assert.equal(certification.json.event.eventType, "certification.expiring");

    const violation = await postJson(baseUrl, "/policies/violations", baseRecord({ status: "detected" }));
    assert.equal(violation.response.status, 201);
    assert.equal(violation.json.event.eventType, "policy.violation.detected");

    const report = await postJson(baseUrl, "/reports/generation", baseRecord({ status: "generated" }));
    assert.equal(report.response.status, 201);
    assert.equal(report.json.event.eventType, "regulatory.report.generated");

    const integration = await postJson(baseUrl, "/integrations/references", {
      tenantId: "tenant-global-compliance",
      sourceSystem: "product_management_platform",
      sourceResourceType: "feature",
      sourceResourceId: "feature-001",
      complianceResourceType: "compliance_rules_engine",
      complianceResourceId: "rule-001",
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
    const unauthenticated = await fetch(`${baseUrl}/regulatory/frameworks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(baseRecord({ status: "registered" }))
    });
    assert.equal(unauthenticated.status, 401);

    const openApi = await fetch(`${baseUrl}/docs/openapi.json`);
    assert.equal(openApi.status, 200);
    const document = await openApi.json();
    assert.equal(document.info.version, "3.0.0");
    assert.ok(document.paths[`${API_BASE_PATH}/compliance/gaps`]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
