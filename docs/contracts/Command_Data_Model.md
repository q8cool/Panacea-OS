# Command Data Model

## Tables

### `global_command_intelligence_records`

Stores command centers, operational intelligence, alerts, crisis coordination, decision support recommendations, and executive intelligence records.

Key fields:

- `tenant_id`
- `record_group`
- `record_type`
- `status`
- `country_code`
- `region_code`
- `jurisdiction_code`
- `command_center_id`
- `situation_id`
- `alert_id`
- `crisis_event_id`
- `recommendation_id`
- `briefing_id`
- `policy_controls`
- `governance_context`
- `workflow_controls`
- `evidence`
- `metrics`
- `metadata`

### `global_command_intelligence_events`

Stores domain events for command center, situation, alert, crisis, recommendation, and briefing workflows.

### `global_command_intelligence_audit_entries`

Stores immutable audit entries for every command action, alert, recommendation, escalation, and integration reference.

### `global_command_intelligence_integration_references`

Stores governed references to Autonomous Intelligence Foundation, AHOS Core, Enterprise Operations, Global Healthcare, Public Health, Facility, Workforce, Supply Chain, Analytics, Audit, and Notification services.

## Governance Constraints

- Records must remain advisory.
- Autonomous diagnosis, treatment, and emergency enforcement are prohibited.
- Tenant, country, and region controls are mandatory.
- Regional and country policies must be checked.
- Evidence is required for every persisted command record.
