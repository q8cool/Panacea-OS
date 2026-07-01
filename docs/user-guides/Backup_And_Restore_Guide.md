# Backup And Restore Guide

Date: 2026-07-01
Scope: Runtime validation PostgreSQL profile

## PostgreSQL Configuration

The local production-like runtime uses PostgreSQL through Docker Compose:

```text
container: panacea-runtime-postgres
database: panacea_runtime
user: panacea
host port: 55433
```

Services receive the internal Docker network connection string:

```text
postgres://panacea:panacea@postgres:5432/panacea_runtime
```

## Migrations

Runtime orchestration applies all SQL migrations from active services in sorted order and reruns them for idempotency:

```bash
npm run runtime:orchestration
```

The validation covers tenant columns, audit columns, indexes, event/outbox tables, and migration version tracking.

## Local Backup

Start the runtime first:

```bash
npm run panacea:start
```

Create a compressed backup:

```bash
docker exec panacea-runtime-postgres pg_dump -U panacea -d panacea_runtime -Fc > panacea_runtime.backup
```

## Local Restore

Use restore only against an operator-approved local validation database.

```bash
cat panacea_runtime.backup | docker exec -i panacea-runtime-postgres pg_restore -U panacea -d panacea_runtime --clean --if-exists
```

## Development Reset

The safe default stop command preserves the database volume:

```bash
npm run panacea:stop
```

For a local-only reset, the operator may intentionally remove the runtime volume:

```bash
docker compose -f infra/docker-compose/runtime/docker-compose.yml down -v --remove-orphans
```

## Production Warning

Do not run destructive reset commands against production infrastructure. Production rollback remains a governed backup/restore procedure and requires release-owner approval, verified backups, restore rehearsal evidence, and a communications plan.

## Disaster Recovery Validation

Use:

```bash
npm run runtime:disaster-recovery
```

The mini-drill validates backup, database recreation, restore, indexes, event/outbox tables, and audit records in the local runtime profile.
