# Live Status OpenAPI Route Fix Report

Date: 2026-07-01
Branch: `develop/v4.0`

## Decision

PASS. Panacea Web now derives active service status URLs from the OpenAPI contracts in `docs/contracts/openapi` and probes the same URLs it displays.

No healthcare features, AI capabilities, clinical workflows, or product behavior were added or changed.

## Scope Completed

- Read all 9 active OpenAPI files in `docs/contracts/openapi`.
- Extracted documented `GET` runtime paths for live, ready, metrics, and OpenAPI.
- Updated Panacea Web data generation to prefer the `docs/contracts/openapi/<service>.openapi.json` contract for each active service.
- Added `runtimeChecks` metadata to each generated service record with label, kind, method, path, URL, and source OpenAPI file.
- Updated System Health, module detail, and quick-open service cards to render the contract-derived runtime checks.
- Updated live status polling to probe the same contract-derived runtime checks shown in the UI.
- Corrected the privacy/consent/trust API Explorer runtime port mapping to `localhost:18147`.
- Added tests proving active service status URLs come from OpenAPI contract paths.

## Active Runtime Route Matrix

| Service | Port | Source OpenAPI | Live | Ready | Metrics | OpenAPI |
|---|---:|---|---|---|---|---|
| autonomous-healthcare-intelligence-foundation | 18094 | `docs/contracts/openapi/autonomous-healthcare-intelligence-foundation.openapi.json` | `/api/v4/autonomous-healthcare-intelligence/live` | `/api/v4/autonomous-healthcare-intelligence/ready` | `/api/v4/autonomous-healthcare-intelligence/metrics` | `/api/v4/autonomous-healthcare-intelligence/docs/openapi.json` |
| real-time-global-healthcare-command-intelligence-platform | 18095 | `docs/contracts/openapi/real-time-global-healthcare-command-intelligence-platform.openapi.json` | `/api/v4/global-command-intelligence/live` | `/api/v4/global-command-intelligence/ready` | `/api/v4/global-command-intelligence/metrics` | `/api/v4/global-command-intelligence/docs/openapi.json` |
| global-workforce-hr-credentialing-staff-experience-platform | 18141 | `docs/contracts/openapi/global-workforce-hr-credentialing-staff-experience-platform.openapi.json` | `/api/v3/global-workforce/live` | `/api/v3/global-workforce/ready` | `/api/v3/global-workforce/metrics` | `/api/v3/global-workforce/docs/openapi.json` |
| global-legal-contracting-risk-governance-platform | 18142 | `docs/contracts/openapi/global-legal-contracting-risk-governance-platform.openapi.json` | `/api/v3/global-legal-governance/live` | `/api/v3/global-legal-governance/ready` | `/api/v3/global-legal-governance/metrics` | `/api/v3/global-legal-governance/docs/openapi.json` |
| global-customer-success-support-service-management-platform | 18143 | `docs/contracts/openapi/global-customer-success-support-service-management-platform.openapi.json` | `/api/v3/global-customer-success/live` | `/api/v3/global-customer-success/ready` | `/api/v3/global-customer-success/metrics` | `/api/v3/global-customer-success/docs/openapi.json` |
| global-product-management-roadmap-innovation-portfolio-platform | 18144 | `docs/contracts/openapi/global-product-management-roadmap-innovation-portfolio-platform.openapi.json` | `/api/v3/global-product-management/live` | `/api/v3/global-product-management/ready` | `/api/v3/global-product-management/metrics` | `/api/v3/global-product-management/docs/openapi.json` |
| global-compliance-automation-regulatory-intelligence-platform | 18145 | `docs/contracts/openapi/global-compliance-automation-regulatory-intelligence-platform.openapi.json` | `/api/v3/global-compliance/live` | `/api/v3/global-compliance/ready` | `/api/v3/global-compliance/metrics` | `/api/v3/global-compliance/docs/openapi.json` |
| global-ai-assurance-safety-model-risk-management-platform | 18146 | `docs/contracts/openapi/global-ai-assurance-safety-model-risk-management-platform.openapi.json` | `/api/v3/global-ai-assurance/live` | `/api/v3/global-ai-assurance/ready` | `/api/v3/global-ai-assurance/metrics` | `/api/v3/global-ai-assurance/docs/openapi.json` |
| global-enterprise-data-privacy-consent-trust-platform | 18147 | `docs/contracts/openapi/global-enterprise-data-privacy-consent-trust-platform.openapi.json` | `/api/v3/global-privacy/live` | `/api/v3/global-privacy/ready` | `/api/v3/global-privacy/metrics` | `/api/v3/global-privacy/docs/openapi.json` |

## Live Port Probe Results

Docker Compose runtime services were started locally and all contract-derived status URLs were tested.

| Probe set | Result |
|---|---|
| Services tested | 9 |
| URLs tested | 36 |
| HTTP 200 responses | 36 |
| Failed responses | 0 |
| Safe alternate GET status checks required | 0 |

## Tests Added

- Verifies every active service uses `docs/contracts/openapi/<service>.openapi.json` as the service status source.
- Verifies every generated status check is a documented `GET` OpenAPI path.
- Verifies generated URLs combine the active service port with the documented OpenAPI path.
- Verifies live status polling calls the generated OpenAPI-derived URLs.
- Verifies the privacy/consent/trust contract maps to `http://localhost:18147`.

## Validation Commands

| Command | Result |
|---|---|
| `npm run check` | PASS |
| `npm run build` | PASS |
| `npm run test:run` | PASS, 145 tests passed |
| `npm run openapi` | PASS, 26 OpenAPI documents validated |
| `npm run web:check` | PASS, 52 tests passed |
| `npm run web:build` | PASS |
| `npm run quality:gate` | PASS |
| `npm run runtime:orchestration` | PASS |

## Runtime Orchestration Evidence

`npm run runtime:orchestration` validated:

- PostgreSQL startup and migration execution.
- Migration idempotency.
- Live, ready, metrics, and OpenAPI endpoints for all active services.
- Protected write path, audit insert, and event persistence.
- Unauthenticated, unauthorized, and tenant-mismatch controls.
- Structured service logs and clean container shutdown.

## Final Status

The UI service catalog and status checks now use real OpenAPI-documented runtime paths. Service availability is not inferred or invented; the UI probes the documented URLs and reports actual responses.
