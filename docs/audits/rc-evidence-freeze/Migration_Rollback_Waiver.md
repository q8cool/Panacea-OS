# Migration Rollback Waiver

Audit date: 2026-06-30
Decision: PASS WITH CONDITIONS

## Current Strategy

Active migrations are forward-only, idempotent SQL migrations. Rollback is handled by verified backup and restore.

## Why Down Migrations Are Not Currently Required

The migrations create regulated persistence structures for records, audit entries, event outbox tables, integration references, indexes, constraints, and migration tracking. Automated destructive down migrations could remove audit and governance evidence. Backup/restore is safer for the current release evidence stage.

## Backup/Restore Evidence

`npm run runtime:disaster-recovery` validates:

- clean PostgreSQL start;
- migration execution;
- repeated migration safety;
- protected sample write;
- audit row creation;
- event outbox row creation;
- `pg_dump` backup;
- database drop;
- database recreation;
- `pg_restore`;
- restored data, indexes, audit, and event tables.

## Risk Level

Medium.

## Mitigation

- Require pre-migration backups for every release deployment.
- Require restore drill evidence before production approval.
- Stop writes before rollback.
- Verify schema and audit/event records after restore.
- Capture release-board approval of this waiver.

## Future Requirement

If release policy requires reversible migrations, future hardening must add explicit down scripts or a formal reversible migration framework. This sprint does not rewrite existing migrations.

## Approval Implication

RC preparation may begin with this waiver. Final production release requires release-board approval.
