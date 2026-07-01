# Missing UI Integration Report

Generated: 2026-07-01T06:07:01.266Z

## Critical

| Gap | Impact | Required action |
| --- | --- | --- |
| Live Foundation auth endpoints not routed on `foundation.utbe.ai` | Blocks provider login and refresh in production browser flow | Deploy Sprint 106 auth provider behind nginx and validate OpenID, login, token, refresh, logout, and auth/me endpoints |
| No live test JWT or credentials available during audit | Blocks protected browser API validation | Provide approved test credentials or token through secure operator process |

## High

| Gap | Impact | Required action |
| --- | --- | --- |
| Role workspaces lack domain-specific read-model APIs | Doctor, patient, lab, radiology, pharmacy, and admin pages remain partial/demo for records | Expose approved read-only APIs for each workspace before enabling full Live Mode data |
| CORS for active services not live-verified from browser | Browser may be unable to call service endpoints even when runtime is up | Enable and verify CORS for health/readiness/OpenAPI and approved read models |
| Clinical Core, Medical Data, Lab, Radiology, Pharmacy services absent as active runtimes | Main clinical workflows cannot be fully live | Create approved future sprint for backend service implementation or connect to existing external systems |

## Medium

| Gap | Impact | Required action |
| --- | --- | --- |
| Enterprise docs exceed active services | Many roadmap platforms are documentation-only in the UI | Prioritize runtime services for finance, inventory, analytics, quality, research, telemedicine, and portal |
| API Explorer is contract-visible but not an authenticated live executor | Operators can inspect APIs but not run protected calls safely from UI | Add a governed read-only API runner after auth/CORS are complete |
| Service health polling requires runtime startup | System Health is contract-oriented when Docker profile is not running | Use runtime profile and document operator startup status |

## Low

| Gap | Impact | Required action |
| --- | --- | --- |
| Chunk-size warning in web build | No functional blocker; polish/performance opportunity | Split documentation/API explorer modules if needed |
| More granular page-to-endpoint matching needed | Current endpoint selection is generic by service/read-only endpoint | Add explicit page endpoint metadata after read-model APIs exist |
