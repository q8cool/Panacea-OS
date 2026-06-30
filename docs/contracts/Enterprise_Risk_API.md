# Enterprise Risk API

The Enterprise Risk API records governed enterprise, clinical, operational, financial, legal, and cybersecurity risk operations.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-legal-governance/risks/enterprise` | Enterprise Risk Register |
| `POST /api/v3/global-legal-governance/risks/clinical` | Clinical Risk Register |
| `POST /api/v3/global-legal-governance/risks/operational` | Operational Risk Register |
| `POST /api/v3/global-legal-governance/risks/financial` | Financial Risk Register |
| `POST /api/v3/global-legal-governance/risks/legal` | Legal Risk Register |
| `POST /api/v3/global-legal-governance/risks/cybersecurity` | Cybersecurity Risk Register |
| `POST /api/v3/global-legal-governance/risks/scoring` | Risk Scoring |
| `POST /api/v3/global-legal-governance/risks/mitigations` | Risk Mitigation Plans |
| `POST /api/v3/global-legal-governance/risks/reviews` | Risk Review Workflow |
| `POST /api/v3/global-legal-governance/risks/dashboard` | Risk Dashboard |

Risk records support risk score, risk level, owner, review evidence, and mitigation approval. Risk workflows are governance records only and do not execute clinical actions.
