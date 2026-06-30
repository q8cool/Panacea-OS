# Innovation Portfolio API

The Innovation Portfolio API exposes Sprint 76 innovation portfolio endpoints under `/api/v3/global-product-management`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-product-management/innovation/ideas` | Innovation Idea Registry |
| `POST /api/v3/global-product-management/innovation/pipeline` | Innovation Pipeline |
| `POST /api/v3/global-product-management/innovation/scoring` | Innovation Scoring |
| `POST /api/v3/global-product-management/innovation/reviews` | Innovation Review Workflow |
| `POST /api/v3/global-product-management/innovation/approvals` | Innovation Approval Workflow |
| `POST /api/v3/global-product-management/innovation/experiments` | Innovation Experiment Registry |
| `POST /api/v3/global-product-management/innovation/impact-assessments` | Innovation Impact Assessment |
| `POST /api/v3/global-product-management/innovation/dashboard` | Innovation Portfolio Dashboard |

Innovation records are governance-only. Experiments require explicit experiment governance approval and never alter clinical care or production behavior automatically.
