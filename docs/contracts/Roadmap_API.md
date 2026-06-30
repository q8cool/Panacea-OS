# Roadmap API

The Roadmap API exposes Sprint 76 roadmap governance endpoints under `/api/v3/global-product-management`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-product-management/roadmaps/registries` | Roadmap Registry |
| `POST /api/v3/global-product-management/roadmaps/versions` | Version Roadmaps |
| `POST /api/v3/global-product-management/roadmaps/release-planning` | Release Planning |
| `POST /api/v3/global-product-management/roadmaps/milestones` | Milestone Planning |
| `POST /api/v3/global-product-management/roadmaps/sprints` | Sprint Planning |
| `POST /api/v3/global-product-management/roadmaps/dependencies` | Roadmap Dependencies |
| `POST /api/v3/global-product-management/roadmaps/approvals` | Roadmap Approval Workflow |
| `POST /api/v3/global-product-management/roadmaps/history` | Roadmap History |

Roadmap approval and milestone completion records require human-governed approval references, dependency review evidence, tenant isolation, and full audit capture.
