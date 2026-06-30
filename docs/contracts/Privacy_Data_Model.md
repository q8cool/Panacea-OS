# Privacy Data Model

Primary table: `global_privacy_records`

## Core Fields

| Field | Purpose |
| --- | --- |
| `tenant_id` | Tenant isolation boundary |
| `record_group` | Consent, data rights, policy, sharing, trust, or monitoring group |
| `record_type` | Specific workflow or registry type |
| `status` | Governed lifecycle status |
| `country_code` | Country policy boundary |
| `jurisdiction_code` | Regional or country jurisdiction |
| `policy_controls` | Approved policy, consent, purpose, residency, minimization, retention, and disclosure controls |
| `governance_context` | Human governance, tenant isolation, data residency, and cross-border controls |
| `workflow_controls` | Workflow-specific proof controls |
| `evidence` | Auditable evidence references |

## Privacy Identifiers

The model supports data subject, patient, consent, data-rights request, policy, purpose, sharing agreement, trust relationship, processor, controller, monitoring, violation, incident, and risk identifiers.

## Persistence

The platform uses PostgreSQL only. Production persistence is implemented through:

- `global_privacy_records`
- `global_privacy_integration_references`
- `global_privacy_events`
- `global_privacy_audit_entries`
- `global_privacy_migrations`

No production in-memory repository is used.
