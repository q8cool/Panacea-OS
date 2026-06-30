# Governance API

The Governance API supports board, committee, meeting, agenda, minutes, decision, policy approval, and governance audit workflows.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-legal-governance/governance/boards` | Board Governance Registry |
| `POST /api/v3/global-legal-governance/governance/committees` | Committee Management |
| `POST /api/v3/global-legal-governance/governance/meetings` | Meeting Management |
| `POST /api/v3/global-legal-governance/governance/agendas` | Agenda Management |
| `POST /api/v3/global-legal-governance/governance/minutes` | Minutes Management |
| `POST /api/v3/global-legal-governance/governance/decisions` | Decision Registry |
| `POST /api/v3/global-legal-governance/governance/policy-approvals` | Policy Approval Workflow |
| `POST /api/v3/global-legal-governance/governance/audits` | Governance Audit |

Governance payloads require governance body verification and decision traceability. Decision registry records publish `governance.decision.recorded`.
