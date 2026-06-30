# AI Incident API

The AI Incident API exposes Sprint 78 AI incident management endpoints under `/api/v3/global-ai-assurance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-ai-assurance/incidents/registries` | AI Incident Registry |
| `POST /api/v3/global-ai-assurance/incidents/workflows` | AI Safety Incident Workflow |
| `POST /api/v3/global-ai-assurance/incidents/severity` | AI Incident Severity |
| `POST /api/v3/global-ai-assurance/incidents/investigations` | AI Incident Investigation |
| `POST /api/v3/global-ai-assurance/incidents/corrective-actions` | AI Incident Corrective Actions |
| `POST /api/v3/global-ai-assurance/incidents/closures` | AI Incident Closure |
| `POST /api/v3/global-ai-assurance/incidents/reporting` | AI Incident Reporting |

AI incidents require severity review, investigation evidence, corrective action traceability, closure approval, tenant isolation, and immutable audit entries.
