# Disaster Recovery Evidence

Audit date: 2026-06-30
Result: PASS

Evidence command:

- `npm run runtime:disaster-recovery`

Validated sequence:

1. Start clean PostgreSQL.
2. Apply migrations.
3. Rerun migrations.
4. Write protected sample data.
5. Create audit and event outbox records.
6. Backup with `pg_dump`.
7. Drop runtime database.
8. Recreate runtime database.
9. Restore with `pg_restore`.
10. Verify data, audit, event outbox, indexes, and event tables.
