# LTS Data Model v3

Primary table: `v3_lts_maintenance_records`

## Tables

- `v3_lts_maintenance_records`
- `v3_lts_events`
- `v3_lts_audit_entries`
- `v3_lts_migrations`

## Key Fields

| Field | Purpose |
| --- | --- |
| `tenant_id` | Tenant isolation boundary |
| `record_group` | LTS functional group |
| `record_type` | Maintenance workflow type |
| `status` | Lifecycle status |
| `release_channel` | GA, LTS, maintenance, security hotfix, or emergency patch |
| `affected_version` | Source version, default `3.0.0` |
| `target_version` | LTS target, default `3.0.1-LTS` |
| `policy_controls` | Approved policy, audit, tenant, global, AI governance, and support controls |
| `governance_context` | Maintenance-only governance boundary |
| `workflow_controls` | Workflow-specific evidence |
| `evidence` | Auditable evidence references |

## Persistence

PostgreSQL is the production persistence mechanism. No in-memory repository is used for LTS records.
