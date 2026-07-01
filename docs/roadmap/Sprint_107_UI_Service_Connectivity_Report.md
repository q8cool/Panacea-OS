# Sprint 107 UI Service Connectivity Report

Audit date: 2026-07-01
Branch: `develop/v4.0`
Scope: UI-to-service connectivity audit, live integration mapping, and validation only.

## Final Decision

PASS for Sprint 107 audit completion.

Panacea OS is currently a hybrid live/demo/documentation platform. The professional web UI is visible and builds successfully, the API explorer and documentation surfaces are available, and Foundation health/readiness/JWKS are reachable by GET. Most role workspaces are not fully connected to live domain record APIs yet, and no documentation-only page has been classified as live.

## Required Report Index

| Report | Status |
| --- | --- |
| `docs/audits/ui-integration/Service_Inventory_For_UI.md` | Generated |
| `docs/audits/ui-integration/UI_Page_Inventory.md` | Generated |
| `docs/audits/ui-integration/UI_to_API_Mapping.md` | Generated |
| `docs/audits/ui-integration/Role_Workspace_Coverage.md` | Generated |
| `docs/audits/ui-integration/Live_Connectivity_Test_Report.md` | Generated |
| `docs/audits/ui-integration/Browser_API_Allowlist_Audit.md` | Generated |
| `docs/audits/ui-integration/Missing_UI_Integration_Report.md` | Generated |
| `docs/audits/ui-integration/Panacea_UI_Service_Integration_Matrix.md` | Generated |

## Connectivity Summary

| Area | Result |
| --- | --- |
| Active backend services inventoried | 9 |
| OpenAPI documents validated | 26 |
| Role workspace pages inventoried | 84 |
| Fully live-connected role pages | 0 |
| Partial Live Mode role pages | 84 |
| Local web UI smoke test | PASS, HTTP 200 at `http://localhost:5174/` |
| Foundation GET health/readiness/JWKS | PASS |
| Foundation HEAD health/readiness/JWKS | FAIL, HTTP 404 |
| Foundation login discovery | FAIL LIVE, HTTP 404 |
| Foundation auth/audit/policy browser preflight | FAIL LIVE, HTTP 404 |
| Active service local runtime endpoints | Not running during this audit; curl error 7 on service ports |
| Browser API allowlist | PASS |

## Validation Commands

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run check` | PASS | Forbidden marker scan, OpenAPI check-only, Docker readiness, Kubernetes readiness, Foundation wiring, and format checks passed |
| `npm run build` | PASS | 26 OpenAPI docs, 17 migrations, Docker readiness, Kubernetes readiness validated |
| `npm run test:run` | PASS | 126 tests passed, 0 failed |
| `npm run openapi` | PASS | 26 OpenAPI documents validated with `/api/v...` public paths |
| `npm run web:check` | PASS | 33 web tests passed |
| `npm run web:build` | PASS | Vite build succeeded; large bundle warning remains a performance item |
| `npm run quality:gate` | PASS | Full quality gate passed, including audit and deterministic migration validation |
| `curl -I http://localhost:5174/` | PASS | HTTP 200 |
| `curl -I https://foundation.utbe.ai/health` | FAIL for HEAD | HTTP 404; GET returned HTTP 200 |
| `curl -I https://foundation.utbe.ai/ready` | FAIL for HEAD | HTTP 404; GET returned HTTP 200 |
| `curl -I https://foundation.utbe.ai/.well-known/jwks.json` | FAIL for HEAD | HTTP 404; GET returned HTTP 200 |

## Answers Required By Sprint 107

### 1. Are all backend services visible in the UI?

Partially. All 9 active backend services are visible through the API Explorer, system health/catalog surfaces, and generated documentation data. They are not all visible as fully live role-specific workflows.

### 2. Are all UI pages connected to live APIs?

No. Role workspaces are Live Mode aware and mapped to read-only service contracts, but domain records are not fully connected to live service APIs. Global pages are a mix of OpenAPI-only, documentation-only, demo-only, and partial Foundation status views.

### 3. Which pages are still demo/documentation-only?

The documentation-only and demo-only surfaces include clinical modules, patient experience, education, enterprise module overview, innovations, documentation center, demo mode, release evidence, legacy coverage, and user journey pages. The full route-level list is in `docs/audits/ui-integration/UI_Page_Inventory.md`.

### 4. Which services are backend-only?

The 9 active services remain API-first/backend-oriented. They are visible in the UI through OpenAPI and service status metadata, but their protected record workflows are not fully browser-executable without live auth, CORS, tenant-scoped tokens, and domain read-model endpoints.

### 5. Which APIs are missing from the UI?

Missing or not live-connected UI APIs include clinical core, medical data, laboratory, radiology, pharmacy, scheduling, inpatient, outpatient, blood bank, infection control, billing, inventory, analytics, quality, research, telemedicine, population health, enterprise integration hub, knowledge graph, digital twin, learning, and most role-specific record read models.

### 6. Which endpoints are blocked by auth/CORS?

Protected service record endpoints require a Foundation-issued token and tenant claims. Live auth discovery and auth route preflight currently return HTTP 404 at `foundation.utbe.ai`, so browser token flow and CORS proof are blocked. OPTIONS also returned HTTP 404 for `/api/v1/auth/login`, `/api/v1/audit-records`, and `/api/v1/policy/evaluate`.

### 7. What must be built next to make the entire UI fully live?

The next work should remain integration-focused: deploy the Sprint 106 Foundation auth routes behind `foundation.utbe.ai`, validate browser CORS and token issuance, start the active service runtime profile, expose approved read-only role workspace APIs, map each UI page to a concrete endpoint, add seeded non-PHI demo records for live validation, and only then enable authenticated browser execution for approved GET/read-only paths.

### 8. Is Panacea OS currently a fully live application or a hybrid live/demo/documentation platform?

Panacea OS is currently a hybrid live/demo/documentation platform. It has a working professional web UI, validated OpenAPI visibility, release evidence, API cataloging, documentation browsing, and partial live Foundation/service status checks. It is not yet a fully live end-user clinical or enterprise workflow application.

## Production Readiness Notes

The audit did not add product behavior, healthcare modules, or AI capabilities. It found that the web platform is professionally visible and testable, but full live operation depends on closing Foundation auth routing/CORS, running service containers, and adding approved read-model integration endpoints in a future sprint.

## Recommended Next Sprint

Sprint 108 should be a live integration enablement sprint, not new feature development. The scope should be Foundation auth deployment verification, local service runtime startup, browser CORS validation, tenant token propagation, and read-only UI-to-API wiring for the existing role workspaces.
