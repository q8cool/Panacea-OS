# Policy Management API

The Policy Management API supports enterprise policy lifecycle workflows.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-legal-governance/policies/registries` | Policy Registry |
| `POST /api/v3/global-legal-governance/policies/versioning` | Policy Versioning |
| `POST /api/v3/global-legal-governance/policies/reviews` | Policy Review |
| `POST /api/v3/global-legal-governance/policies/approvals` | Policy Approval |
| `POST /api/v3/global-legal-governance/policies/publications` | Policy Publication |
| `POST /api/v3/global-legal-governance/policies/attestations` | Policy Attestation |
| `POST /api/v3/global-legal-governance/policies/exceptions` | Policy Exception Workflow |
| `POST /api/v3/global-legal-governance/policies/compliance` | Policy Compliance Tracking |

Policy records require owner verification, version control, policy reference, and publication approval controls when status is `approved` or `published`.
