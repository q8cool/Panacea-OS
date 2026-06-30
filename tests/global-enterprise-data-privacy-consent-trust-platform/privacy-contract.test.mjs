import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenApiDocument } from "../../services/global-enterprise-data-privacy-consent-trust-platform/src/api/openapi.mjs";
import { routeDefinitions } from "../../services/global-enterprise-data-privacy-consent-trust-platform/src/api/routes.mjs";
import { API_BASE_PATH, requiredEvents } from "../../services/global-enterprise-data-privacy-consent-trust-platform/src/domain/privacy-domain.mjs";

test("OpenAPI contract contains every Sprint 79 route and required event", () => {
  const document = buildOpenApiDocument();
  for (const route of routeDefinitions) {
    const fullPath = `${API_BASE_PATH}${route.path}`;
    assert.ok(document.paths[fullPath], `missing ${fullPath}`);
    assert.ok(document.paths[fullPath][route.method.toLowerCase()], `missing method ${route.method} for ${fullPath}`);
  }
  assert.ok(document.paths[`${API_BASE_PATH}/integrations/references`]);
  assert.ok(document.paths[`${API_BASE_PATH}/live`]);
  assert.ok(document.paths[`${API_BASE_PATH}/ready`]);
  assert.ok(document.paths[`${API_BASE_PATH}/metrics`]);
  assert.ok(document.paths[`${API_BASE_PATH}/docs/openapi.json`]);
  assert.deepEqual(document["x-panacea"].events, requiredEvents);
  assert.equal(routeDefinitions.length, 45);
  assert.equal(Object.keys(document.paths).length, 50);
});

test("OpenAPI declares consent, purpose, residency, cross-border, and audit controls", () => {
  const document = buildOpenApiDocument();
  assert.ok(document.components.securitySchemes.bearerAuth);
  assert.ok(document.components.securitySchemes.tenantHeaders);
  assert.deepEqual(document["x-panacea"].controls, [
    "identity",
    "rbac",
    "abac",
    "audit",
    "tenant_isolation",
    "purpose_based_access_control",
    "consent_enforcement",
    "data_residency_policies",
    "cross_border_policy_enforcement",
    "data_minimization",
    "retention_policy_enforcement"
  ]);
  assert.equal(document["x-panacea"].privacyAutomation, "policy_controlled");
  assert.equal(document["x-panacea"].clinicalAutomation, "not_permitted");
});
