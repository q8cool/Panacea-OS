# Contract Management API

The Contract Management API supports governed contract lifecycle workflows.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-legal-governance/contracts/registries` | Contract Registry |
| `POST /api/v3/global-legal-governance/contracts/templates` | Contract Templates |
| `POST /api/v3/global-legal-governance/contracts/drafting-workflows` | Contract Drafting Workflow |
| `POST /api/v3/global-legal-governance/contracts/review-workflows` | Contract Review Workflow |
| `POST /api/v3/global-legal-governance/contracts/approval-workflows` | Contract Approval Workflow |
| `POST /api/v3/global-legal-governance/contracts/renewals` | Contract Renewal Tracking |
| `POST /api/v3/global-legal-governance/contracts/expirations` | Contract Expiration Tracking |
| `POST /api/v3/global-legal-governance/contracts/obligations` | Contract Obligation Tracking |
| `POST /api/v3/global-legal-governance/contracts/vendors` | Vendor Contract Management |
| `POST /api/v3/global-legal-governance/contracts/insurance` | Insurance Contract Management |
| `POST /api/v3/global-legal-governance/contracts/employment` | Employment Contract Management |
| `POST /api/v3/global-legal-governance/contracts/clinical-services` | Clinical Service Contract Management |

Approval workflows must include contract approval evidence. Expiration workflows must include monitoring and renewal owner controls. Contract events publish `contract.created`, `contract.approved`, and `contract.expiring`.
