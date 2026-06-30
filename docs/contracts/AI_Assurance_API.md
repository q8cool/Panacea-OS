# AI Assurance API

The AI Assurance API exposes Sprint 78 AI assurance endpoints under `/api/v3/global-ai-assurance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-ai-assurance/assurance/registries` | AI Assurance Registry |
| `POST /api/v3/global-ai-assurance/assurance/systems` | AI System Inventory |
| `POST /api/v3/global-ai-assurance/assurance/use-cases` | AI Use Case Registry |
| `POST /api/v3/global-ai-assurance/assurance/risk-classifications` | AI Risk Classification |
| `POST /api/v3/global-ai-assurance/assurance/safety-assessments` | AI Safety Assessment |
| `POST /api/v3/global-ai-assurance/assurance/impact-assessments` | AI Impact Assessment |
| `POST /api/v3/global-ai-assurance/assurance/workflows` | AI Assurance Workflow |
| `POST /api/v3/global-ai-assurance/assurance/dashboard` | AI Assurance Dashboard |

Every request requires identity, RBAC, ABAC, tenant isolation, AI governance permissions, policy controls, workflow controls, production-promotion approval controls, and evidence.
