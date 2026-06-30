# Customer Success API

The Customer Success API exposes Sprint 75 customer lifecycle endpoints under `/api/v3/global-customer-success`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-customer-success/customers/registries` | Customer Registry |
| `POST /api/v3/global-customer-success/customers/accounts` | Account Registry |
| `POST /api/v3/global-customer-success/customers/health-scores` | Customer Health Score |
| `POST /api/v3/global-customer-success/customers/success-plans` | Customer Success Plans |
| `POST /api/v3/global-customer-success/customers/milestones` | Customer Milestones |
| `POST /api/v3/global-customer-success/customers/adoption` | Customer Adoption Tracking |
| `POST /api/v3/global-customer-success/customers/engagement` | Customer Engagement Tracking |
| `POST /api/v3/global-customer-success/customers/dashboard` | Customer Success Dashboard |

Every request requires identity, RBAC, ABAC, tenant isolation, audit controls, customer data access controls, policy approval, workflow controls, and evidence.
