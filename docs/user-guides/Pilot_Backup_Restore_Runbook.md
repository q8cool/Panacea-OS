# Pilot Backup Restore Runbook

Date: 2026-07-01
Scope: External controlled pilot backup and restore readiness

This runbook supports controlled pilot readiness. It is not a replacement for a production disaster recovery plan.

## Prerequisites

- PostgreSQL is running.
- `.env.pilot.local` is loaded by the operator.
- `PANACEA_BACKUP_DIR` points to an approved backup location.
- Backup storage is encrypted and access controlled.
- No real patient data is loaded before approval.

## Backup Command

Create a compressed PostgreSQL backup:

```bash
mkdir -p "$PANACEA_BACKUP_DIR"
docker exec panacea-pilot-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$PANACEA_BACKUP_DIR/panacea_runtime_$(date +%Y%m%d_%H%M%S).backup"
```

Record:

- backup filename
- backup size
- backup checksum
- operator
- source database
- retention class

Generate a checksum:

```bash
shasum -a 256 "$PANACEA_BACKUP_DIR"/panacea_runtime_*.backup
```

## Restore Command

Restore only into an approved pilot validation database:

```bash
cat "$PANACEA_BACKUP_DIR/<BACKUP_FILE>.backup" | docker exec -i panacea-pilot-postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists
```

## Restore Verification

```bash
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%events';"
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';"
```

## Disaster Recovery Mini-Drill

Run the local mini-drill before external pilot opening:

```bash
npm run runtime:disaster-recovery
```

The mini-drill validates backup, database recreation, restore, indexes, event/outbox tables, and audit records in the local runtime profile.

## Destructive Reset Warning

The following command deletes pilot Docker volumes. Use it only after written operator approval:

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml down -v --remove-orphans
```

## Data Boundary

Until formal approval exists:

- do not load real patient data
- do not load production credentials
- do not expose database ports publicly
- do not share backups outside approved storage
- do not use backup files for demonstrations
