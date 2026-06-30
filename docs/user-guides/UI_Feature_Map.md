# UI Feature Map

## Summary

Panacea OS v4.0 now includes a professional operator platform and role-based user workspaces in `apps/panacea-web`.

| UI area | Route | Active now | Backing evidence |
|---|---|---:|---|
| Executive Overview | `#/command/executive-overview` | YES | Release docs, service inventory, OpenAPI docs |
| System Health | `#/command/system-health` | YES | Docker Compose ports, service package metadata |
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

Live records require authenticated backend APIs and real production authorization.
