# Requirements API

The Requirements API exposes Sprint 76 requirements management endpoints under `/api/v3/global-product-management`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-product-management/requirements/registries` | Requirement Registry |
| `POST /api/v3/global-product-management/requirements/functional` | Functional Requirements |
| `POST /api/v3/global-product-management/requirements/non-functional` | Non-Functional Requirements |
| `POST /api/v3/global-product-management/requirements/prioritization` | Requirement Prioritization |
| `POST /api/v3/global-product-management/requirements/traceability` | Requirement Traceability |
| `POST /api/v3/global-product-management/requirements/approvals` | Requirement Approval |
| `POST /api/v3/global-product-management/requirements/change-control` | Requirement Change Control |
| `POST /api/v3/global-product-management/requirements/coverage-dashboard` | Requirement Coverage Dashboard |

Requirement records require an owner, traceability validation, policy controls, auditable evidence, and tenant-scoped authorization. Change-control records require approved change governance.
