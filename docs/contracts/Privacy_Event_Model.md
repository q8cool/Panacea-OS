# Privacy Event Model

All events are emitted into `global_privacy_events` with tenant, actor, aggregate, schema version, payload, and publication state.

## Required Events

- `consent.created`
- `consent.updated`
- `consent.withdrawn`
- `data.access.requested`
- `data.export.completed`
- `privacy.policy.updated`
- `data.sharing.approved`
- `privacy.violation.detected`
- `trust.relationship.created`
- `trust.relationship.expired`

## Auditability

Every record creation stores an audit entry in `global_privacy_audit_entries`. Audit metadata includes event type, jurisdiction, policy, governing body, purpose, consent, data residency verification, cross-border verification, priority, severity, and risk.

## Event Routing

Events are derived from record type and status. Data sharing approval, trust expiration, consent withdrawal, data export completion, and privacy violation detection have explicit event mappings.
