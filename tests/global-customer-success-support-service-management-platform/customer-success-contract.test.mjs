import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenApiDocument } from "../../services/global-customer-success-support-service-management-platform/src/api/openapi.mjs";
import { routeDefinitions } from "../../services/global-customer-success-support-service-management-platform/src/api/routes.mjs";
import { API_BASE_PATH, requiredEvents } from "../../services/global-customer-success-support-service-management-platform/src/domain/customer-success-domain.mjs";

test("OpenAPI contract contains every Sprint 75 route and required event", () => {
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
  assert.equal(Object.keys(document.paths).length, routeDefinitions.length + 5);
});

test("OpenAPI declares identity, RBAC, ABAC, audit, tenant, customer, support, and incident controls", () => {
  const document = buildOpenApiDocument();
  assert.ok(document.components.securitySchemes.bearerAuth);
  assert.ok(document.components.securitySchemes.tenantHeaders);
  assert.deepEqual(document["x-panacea"].controls, [
    "identity",
    "rbac",
    "abac",
    "audit",
    "tenant_isolation",
    "customer_data_access_controls",
    "support_role_permissions",
    "sensitive_incident_controls"
  ]);
  assert.equal(document["x-panacea"].clinicalAutomation, "not_permitted");
});
