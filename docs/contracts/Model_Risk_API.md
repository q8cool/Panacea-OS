# Model Risk API

The Model Risk API exposes Sprint 78 model risk management endpoints under `/api/v3/global-ai-assurance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-ai-assurance/models/risks` | Model Risk Registry |
| `POST /api/v3/global-ai-assurance/models/risk-scoring` | Model Risk Scoring |
| `POST /api/v3/global-ai-assurance/models/validation` | Model Validation Workflow |
| `POST /api/v3/global-ai-assurance/models/approvals` | Model Approval Workflow |
| `POST /api/v3/global-ai-assurance/models/limitations` | Model Limitation Registry |
| `POST /api/v3/global-ai-assurance/models/risk-reviews` | Model Risk Review |
| `POST /api/v3/global-ai-assurance/models/retirements` | Model Retirement Workflow |
| `POST /api/v3/global-ai-assurance/models/dashboard` | Model Risk Dashboard |

Model validation and model approval records require protocol approval, validation evidence, governance review, and authorized approval before any production promotion.
