# LTS Event Model v3

Events are persisted in `v3_lts_events` with tenant, aggregate, actor, payload, schema version, occurrence time, and publication state.

## Events

- `lts.patch.created`
- `lts.patch.approved`
- `lts.patch.installed`
- `hotfix.created`
- `hotfix.applied`
- `maintenance.started`
- `maintenance.completed`
- `support.bundle.generated`
- `upgrade.validated`
- `rollback.validated`
- `ai.safety.patch.applied`
- `global.support.alert.created`

## Audit

Every maintenance, support, patch, rollback, upgrade, AI governance, security, and global operation action must produce a corresponding audit entry in `v3_lts_audit_entries`.
