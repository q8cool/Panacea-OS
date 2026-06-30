# GA Disaster Recovery Guide

## Strategy

The current rollback strategy is backup and restore based. This is documented as an accepted release condition pending release governance approval.

## Validation

Run:

```bash
npm run runtime:disaster-recovery
```

## Recovery Steps

1. Stop affected service traffic.
2. Preserve audit and event evidence.
3. Restore the approved PostgreSQL backup.
4. Reapply configuration and secrets.
5. Restart services.
6. Verify health, readiness, metrics, audit append, and event outbox behavior.
