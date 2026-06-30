# Legal Governance Event Model

Sprint 74 publishes events through the `global_legal_events` outbox. Every event includes tenant, actor, aggregate, payload, schema version, and occurrence time.

Required events:

| Event | Trigger |
| --- | --- |
| `legal.matter.created` | Legal matter registry and general legal management creation |
| `contract.created` | Contract registry creation |
| `contract.approved` | Contract approval workflow |
| `contract.expiring` | Contract expiration tracking |
| `risk.created` | Enterprise risk register and risk records |
| `risk.mitigated` | Risk mitigation plan approval |
| `policy.created` | Policy registry creation |
| `policy.approved` | Policy approval workflow |
| `policy.published` | Policy publication |
| `governance.decision.recorded` | Decision registry |
| `regulatory.obligation.updated` | Regulatory obligation and compliance updates |

Events never authorize autonomous clinical decisions, diagnosis, or treatment recommendations. They record governance activity only.
