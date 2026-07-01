# UI Feature Map

## Summary

Panacea OS v4.0 now includes a professional operator platform and role-based user workspaces in `apps/panacea-web`.

Sprint 109 adds bilingual English/Arabic UI support, a persistent language selector, and RTL layout for Arabic. Technical artifacts such as API paths, URLs, cURL commands, service IDs, and markdown document bodies remain English/LTR by design.

Sprint 110 adds an operational demo data layer for visible role workspaces. Doctor, patient, laboratory, radiology, pharmacy, administration, and operator areas now render synthetic records for product review. The data is frontend-only and clearly marked as not real patient data.

Sprint 111 adds authenticated live read-model APIs for the role workspaces. In Live Mode, the browser calls versioned GET endpoints under `/api/v4/global-command-intelligence/read-models/...` and displays backend records only when the response is tenant-scoped and marked `demoData: false`.

Sprint 113 adds approved transactional write workflow panels for clinician, laboratory, radiology, pharmacy, scheduling, administration, and patient portal request workflows. In Live Mode, these panels submit only OpenAPI-listed POST endpoints under `/api/v4/global-command-intelligence/write-workflows/...`. In Demo Mode, they display the explicit non-persistence boundary.

Sprint 114 adds the Transaction Review page for event projection visibility. Operators can review live write workflow events, read-model projection state, request and correlation IDs, failure reasons, and safe retry controls for failed projections.

| UI area | Route | Active now | Backing evidence |
|---|---|---:|---|
| Executive Overview | `#/command/executive-overview` | YES | Release docs, service inventory, OpenAPI docs |
| Foundation Login | `#/auth/login` | YES | Foundation configuration, JWT/JWKS browser validator |
| System Health | `#/command/system-health` | YES | Docker Compose ports, service package metadata |
| Live API Status | `#/command/live-status` | YES | Browser polling for Foundation and service endpoints |
| Global Command Intelligence | `#/command/global-command` | YES | Active v4 service and OpenAPI |
| Transaction Review | `#/command/transaction-review` | YES | Sprint 114 write-event projection APIs and read-model synchronization |
| Foundation Provider | `#/command/foundation-provider` | YES | Live Foundation reports and configured URLs |
| Doctor / Clinician Workspace | `#/workspace/doctor/dashboard` | YES | OpenAPI, clinical docs, AI governance evidence |
| Patient Portal Workspace | `#/workspace/patient/dashboard` | YES | Patient experience docs, privacy and consent evidence |
| Laboratory Workspace | `#/workspace/laboratory/dashboard` | YES | Laboratory docs and command status evidence |
| Radiology Workspace | `#/workspace/radiology/dashboard` | YES | Radiology docs, DICOM metadata references, command status evidence |
| Pharmacy Workspace | `#/workspace/pharmacy/dashboard` | YES | Pharmacy docs, medication safety references, command/privacy evidence |
| Administration Workspace | `#/workspace/administrator/dashboard` | YES | Active services, OpenAPI, Foundation, security, release evidence |
| Clinical Modules | `#/clinical/modules` | YES | Visibility matrix and docs |
| Enterprise Modules | `#/enterprise/modules` | YES | Active enterprise services and docs |
| AI & Governance | `#/intelligence/ai-governance` | YES | Active AI assurance service |
| API Explorer | `#/developer/api-explorer` | YES | 26 OpenAPI documents |
| Documentation Center | `#/developer/documentation` | YES | Markdown docs under `docs/` |
| Demo Mode | `#/developer/demo-mode` | YES | Runtime and validation guides |
| Release Evidence | `#/evidence/release` | YES | `docs/releases/v4.0.0/` |
| Legacy Coverage | `#/evidence/legacy-coverage` | YES | Legacy coverage matrix |
| User Journeys | `#/evidence/user-journeys` | YES | User journey map |

## Localization Visibility

| UI area | Arabic visible? | RTL applied? | Technical LTR preserved? |
|---|---:|---:|---:|
| Sidebar and top navigation | YES | YES | YES |
| Command Center pages | YES | YES | YES |
| Role workspaces | YES | YES | YES |
| API Explorer controls | YES | YES | YES |
| API paths and cURL | Not translated | Isolated LTR | YES |
| Documentation Center controls | YES | YES | YES |
| Markdown document body | Authored language | Preserved | YES |

## Role Workspace Pages

| Workspace | Page count |
|---|---:|
| Doctor / Clinician | 18 |
| Patient Portal | 14 |
| Laboratory | 12 |
| Radiology | 11 |
| Pharmacy | 12 |
| Administration | 17 |

## Operational Demo Visibility

| Workspace | Demo data visible? | Example route |
|---|---:|---|
| Operator | YES | `#/command/executive-overview` |
| Doctor / Clinician | YES | `#/workspace/doctor/patient-search` |
| Patient Portal | YES | `#/workspace/patient/appointments` |
| Laboratory | YES | `#/workspace/laboratory/result-entry` |
| Radiology | YES | `#/workspace/radiology/dicom-metadata` |
| Pharmacy | YES | `#/workspace/pharmacy/inventory` |
| Administration | YES | `#/workspace/administrator/users` |

## Live Read-Model Visibility

| Workspace | Live read model? | Example endpoint |
|---|---:|---|
| Doctor / Clinician | YES | `/api/v4/global-command-intelligence/read-models/clinical/patients` |
| Patient Portal | YES | `/api/v4/global-command-intelligence/read-models/patient-portal/me/appointments` |
| Laboratory | YES | `/api/v4/global-command-intelligence/read-models/laboratory/orders` |
| Radiology | YES | `/api/v4/global-command-intelligence/read-models/radiology/studies` |
| Pharmacy | YES | `/api/v4/global-command-intelligence/read-models/pharmacy/prescriptions` |
| Administration | YES | `/api/v4/global-command-intelligence/read-models/admin/users` |

## Live Write Workflow Visibility

| Workspace | Live write workflows? | Example endpoint |
|---|---:|---|
| Doctor / Clinician | YES | `/api/v4/global-command-intelligence/write-workflows/clinical/patients` |
| Patient Portal | YES | `/api/v4/global-command-intelligence/write-workflows/patient-portal/appointment-requests` |
| Laboratory | YES | `/api/v4/global-command-intelligence/write-workflows/laboratory/orders` |
| Radiology | YES | `/api/v4/global-command-intelligence/write-workflows/radiology/orders` |
| Pharmacy | YES | `/api/v4/global-command-intelligence/write-workflows/pharmacy/prescriptions` |
| Scheduling | YES | `/api/v4/global-command-intelligence/write-workflows/scheduling/appointments` |
| Administration | YES | `/api/v4/global-command-intelligence/write-workflows/admin/users` |

## Current Boundary

The role workspaces are now professional, responsive UI experiences backed by OpenAPI, documentation, runtime status, Foundation Provider status, release evidence, live read models, approved Sprint 113 write workflows, and Sprint 114 projection review.

Live Mode adds Foundation JWT validation, role and tenant claims, read-model API calls, approved write workflow submission, and browser endpoint polling.

Live write workflow execution requires an authenticated token with the dedicated write permission and does not permit autonomous diagnosis, autonomous treatment, or unapproved browser writes.

Live records require:

- Foundation-issued JWT.
- Valid JWKS signature validation.
- CORS-enabled live APIs.
- Existing read-only backend read-model endpoints.
- Read-model rows populated for the authenticated tenant.
- Production authorization and tenant isolation.

If those prerequisites are unavailable, the UI shows `Live API unavailable`, an authenticated empty state, or a clear auth/CORS error while keeping demo data separated.
