# HR API

The HR API supports governed human-resources operations for recruitment, onboarding, contracts, performance reviews, disciplinary actions, HR documents, payroll integration references, and exit workflows.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-workforce/hr/recruitment-pipeline` | Recruitment Pipeline |
| `POST /api/v3/global-workforce/hr/onboarding` | Onboarding Workflow |
| `POST /api/v3/global-workforce/hr/contracts` | Contract Management |
| `POST /api/v3/global-workforce/hr/performance-reviews` | Performance Review |
| `POST /api/v3/global-workforce/hr/disciplinary-actions` | Disciplinary Actions |
| `POST /api/v3/global-workforce/hr/documents` | HR Documents |
| `POST /api/v3/global-workforce/hr/payroll-integration` | Payroll Integration Interface |
| `POST /api/v3/global-workforce/hr/exit-workflows` | Exit Workflow |

The HR workflow controls require HR authorization, audit enablement, tenant isolation, policy checks, and human review. Sensitive HR records are scoped by tenant, country, jurisdiction, department, and actor permission.
