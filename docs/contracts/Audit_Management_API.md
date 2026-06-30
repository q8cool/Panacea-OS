# Audit Management API

The Audit Management API exposes Sprint 77 audit workflow endpoints under `/api/v3/global-compliance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-compliance/audits/plans` | Audit Plan Registry |
| `POST /api/v3/global-compliance/audits/schedules` | Audit Schedule |
| `POST /api/v3/global-compliance/audits/scopes` | Audit Scope Management |
| `POST /api/v3/global-compliance/audits/evidence` | Audit Evidence Repository |
| `POST /api/v3/global-compliance/audits/findings` | Audit Findings |
| `POST /api/v3/global-compliance/audits/corrective-actions` | Corrective Action Plans |
| `POST /api/v3/global-compliance/audits/closures` | Audit Closure Workflow |
| `POST /api/v3/global-compliance/audits/history` | Audit History |

Audit findings, corrective actions, and closures require evidence repository access controls, human review, tenant isolation, and immutable audit entries.
