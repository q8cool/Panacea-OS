# Intelligence Data Model

## Tables

### `autonomous_healthcare_intelligence_records`

Stores governed intelligence foundation, clinical governance, orchestration, safety, and traceability records.

Key fields:

- `tenant_id`
- `record_group`
- `record_type`
- `status`
- `country_code`
- `jurisdiction_code`
- `recommendation_id`
- `trace_id`
- `emergency_stop_id`
- `policy_controls`
- `governance_context`
- `workflow_controls`
- `evidence`
- `metrics`
- `metadata`

### `autonomous_healthcare_intelligence_events`

Stores persisted domain events for event-driven publishing.

### `autonomous_healthcare_intelligence_audit_entries`

Stores immutable audit entries for every governed action.

### `autonomous_healthcare_intelligence_integration_references`

Stores references to AI Runtime v2, AHOS Core, Clinical Intelligence, AI Assurance, Privacy and Consent, Global Knowledge, Enterprise Data, Audit, and Notification services.

## Governance Constraints

- Records must be advisory only.
- Human and clinician approval must be required.
- Autonomous diagnosis and treatment must be disabled by governance context.
- Tenant isolation and country authorization must be recorded.
- Evidence must contain at least one governed item.
