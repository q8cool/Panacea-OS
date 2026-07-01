# Pilot Database Setup Guide

Date: 2026-07-01
Scope: External controlled pilot PostgreSQL readiness

This guide prepares PostgreSQL for an external controlled pilot. Do not load real patient data until legal, clinical, privacy, and security approvals are complete.

## Database Creation

Use approved operator credentials outside Git. Example names are safe to keep; passwords are not.

```sql
CREATE USER panacea_pilot WITH PASSWORD '<REPLACE_WITH_REAL_VALUE_OUTSIDE_GIT>';
CREATE DATABASE panacea_runtime OWNER panacea_pilot;
GRANT ALL PRIVILEGES ON DATABASE panacea_runtime TO panacea_pilot;
```

## Environment

Create an operator-local environment file:

```bash
cp .env.pilot.example .env.pilot.local
```

Set at minimum:

```text
POSTGRES_HOST=<PILOT_POSTGRES_HOST>
POSTGRES_PORT=5432
POSTGRES_DB=panacea_runtime
POSTGRES_USER=<PILOT_DATABASE_USER>
POSTGRES_PASSWORD=<REPLACE_WITH_REAL_VALUE_OUTSIDE_GIT>
```

Do not commit `.env.pilot.local`.

## Migration Execution

For the local runtime proof:

```bash
npm run runtime:orchestration
```

For a pilot database running through Docker Compose:

```bash
set -a
. ./.env.pilot.local
set +a
docker compose -f infra/docker-compose/pilot/docker-compose.yml up -d --build
```

Migration execution is performed by the runtime orchestration tooling and service startup paths already validated in CI. Operators must run a migration rehearsal against a clean pilot database before opening external access.

## Migration Verification

Verify migration version tracking:

```bash
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT service_name, version FROM panacea_migration_versions ORDER BY service_name, version;"
```

Verify tenant and audit columns exist:

```bash
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT table_name FROM information_schema.columns WHERE column_name = 'tenant_id' ORDER BY table_name;"
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT table_name FROM information_schema.columns WHERE column_name IN ('created_at', 'updated_at') ORDER BY table_name;"
```

Verify event/outbox tables:

```bash
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%events' ORDER BY table_name;"
```

## Destructive Reset Warning

Never run volume deletion or database drop commands against a pilot or production database unless the release owner explicitly approves the reset and verified backups exist.

Local-only destructive reset:

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml down -v --remove-orphans
```

## Approval Boundary

The pilot database is for controlled pilot validation only. Real clinical production use requires formal approval, completed backup/restore rehearsal, security review, privacy review, and operational go-live authorization.
