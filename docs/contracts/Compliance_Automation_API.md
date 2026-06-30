# Compliance Automation API

The Compliance Automation API exposes Sprint 77 compliance tracking endpoints under `/api/v3/global-compliance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-compliance/compliance/rules` | Compliance Rules Engine |
| `POST /api/v3/global-compliance/compliance/checklists` | Compliance Checklist Automation |
| `POST /api/v3/global-compliance/compliance/evidence-collection` | Evidence Collection |
| `POST /api/v3/global-compliance/compliance/evidence-validation` | Evidence Validation |
| `POST /api/v3/global-compliance/compliance/status` | Compliance Status Tracking |
| `POST /api/v3/global-compliance/compliance/gaps` | Compliance Gap Detection |
| `POST /api/v3/global-compliance/compliance/remediation` | Compliance Remediation Workflow |
| `POST /api/v3/global-compliance/compliance/dashboard` | Compliance Dashboard |

Compliance automation is policy-controlled support infrastructure. It detects, tracks, validates, and routes compliance work but never performs autonomous clinical decisions, diagnosis, or treatment recommendations.
