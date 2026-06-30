import assert from "node:assert/strict";
import test from "node:test";
import { buildOpenApiDocument } from "../../services/global-product-management-roadmap-innovation-portfolio-platform/src/api/openapi.mjs";
import { routeDefinitions } from "../../services/global-product-management-roadmap-innovation-portfolio-platform/src/api/routes.mjs";
import { API_BASE_PATH, requiredEvents } from "../../services/global-product-management-roadmap-innovation-portfolio-platform/src/domain/product-management-domain.mjs";

test("OpenAPI contract contains every Sprint 76 route and required event", () => {
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

test("OpenAPI declares identity, RBAC, ABAC, audit, tenant, product, roadmap, innovation, and release controls", () => {
  const document = buildOpenApiDocument();
  assert.ok(document.components.securitySchemes.bearerAuth);
  assert.ok(document.components.securitySchemes.tenantHeaders);
  assert.deepEqual(document["x-panacea"].controls, [
    "identity",
    "rbac",
    "abac",
    "audit",
    "tenant_isolation",
    "product_governance_permissions",
    "roadmap_approval_permissions",
    "innovation_review_permissions",
    "release_governance_permissions"
  ]);
  assert.equal(document["x-panacea"].clinicalAutomation, "not_permitted");
});
