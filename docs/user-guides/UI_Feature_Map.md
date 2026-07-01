# UI Feature Map

## Summary

Panacea OS v4.0 now includes a professional operator platform and role-based user workspaces in `apps/panacea-web`.

Sprint 109 adds bilingual English/Arabic UI support, a persistent language selector, and RTL layout for Arabic. Technical artifacts such as API paths, URLs, cURL commands, service IDs, and markdown document bodies remain English/LTR by design.

| UI area | Route | Active now | Backing evidence |
|---|---|---:|---|
| Executive Overview | `#/command/executive-overview` | YES | Release docs, service inventory, OpenAPI docs |
| Foundation Login | `#/auth/login` | YES | Foundation configuration, JWT/JWKS browser validator |
| System Health | `#/command/system-health` | YES | Docker Compose ports, service package metadata |
| Live API Status | `#/command/live-status` | YES | Browser polling for Foundation and service endpoints |
| Global Command Intelligence | `#/command/global-command` | YES | Active v4 service and OpenAPI |
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

## Current Boundary

The role workspaces are not production write applications yet. They are professional, responsive, read-only UI experiences backed by OpenAPI, documentation, runtime status, Foundation Provider status, and release evidence.

Live Mode adds Foundation JWT validation, role and tenant claims, read-only API client behavior, and browser endpoint polling.

Live records require:

- Foundation-issued JWT.
- Valid JWKS signature validation.
- CORS-enabled live APIs.
- Existing read-only backend endpoints.
- Production authorization and tenant isolation.

If those prerequisites are unavailable, the UI shows `Live API unavailable` and keeps demo data clearly separated.
