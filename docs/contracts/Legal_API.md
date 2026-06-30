# Legal API

The Legal API exposes Sprint 74 legal management endpoints under `/api/v3/global-legal-governance`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-legal-governance/legal/matters` | Legal Matter Registry |
| `POST /api/v3/global-legal-governance/legal/cases` | Legal Case Management |
| `POST /api/v3/global-legal-governance/legal/documents` | Legal Document Registry |
| `POST /api/v3/global-legal-governance/legal/reviews` | Legal Review Workflow |
| `POST /api/v3/global-legal-governance/legal/approvals` | Legal Approval Workflow |
| `POST /api/v3/global-legal-governance/legal/risk-registers` | Legal Risk Register |
| `POST /api/v3/global-legal-governance/legal/calendar` | Legal Calendar |
| `POST /api/v3/global-legal-governance/legal/audit-trails` | Legal Audit Trail |

All legal records require identity, RBAC, ABAC, audit, tenant isolation, legal data privacy controls, approved policy controls, governance context, workflow controls, and evidence.
