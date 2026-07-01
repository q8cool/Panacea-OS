# Pilot Rollback And Recovery Runbook

Date: 2026-07-01
Scope: External controlled pilot rollback and recovery

This runbook is for controlled pilot recovery only. Do not destroy data without explicit approval.

## 1. Declare Rollback

Record:

- incident identifier
- operator
- current commit or tag
- target rollback commit or tag
- affected services
- database backup selected for restore
- approval owner

## 2. Stop Current Deployment

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml down --remove-orphans
```

Do not remove volumes unless the release owner explicitly approves destructive recovery.

## 3. Restore Previous Image Or Tag

```bash
git fetch origin
git checkout <APPROVED_PREVIOUS_COMMIT_OR_TAG>
```

If prebuilt images are used by the operator, set the approved image tag in the local environment file outside Git:

```text
PANACEA_IMAGE_TAG=<APPROVED_PREVIOUS_IMAGE_TAG>
```

## 4. Restore Previous Environment

Restore the approved environment file from the operator secret store:

```bash
cp <APPROVED_ENV_BACKUP_PATH> .env.pilot
set -a
. ./.env.pilot
set +a
```

Never commit `.env.pilot`.

## 5. Restore Database Backup

Restore only after approval:

```bash
cat "$PANACEA_BACKUP_DIR/<APPROVED_BACKUP_FILE>.backup" | docker exec -i panacea-pilot-postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists
```

If PostgreSQL must be recreated, follow the database owner's approved recovery procedure first.

## 6. Start Rolled-Back Deployment

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml up -d --build
```

## 7. Verify Health

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml ps
```

Verify every external route in `docs/operations/External_Pilot_Route_Verification_Template.md`.

## 8. Verify Audit, Event, And Projection Consistency

Run database checks:

```bash
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%events';"
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%audit%';"
docker exec panacea-pilot-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%projection%';"
```

Confirm:

- event tables exist
- audit tables exist
- projection tables exist where applicable
- tenant isolation columns remain present
- OpenAPI routes still return HTTP 200

## 9. Report Incident

Create a rollback record containing:

- trigger
- timeline
- services impacted
- data impact
- backup used
- validation evidence
- final status
- follow-up actions

## 10. Destructive Data Warning

Do not run:

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml down -v --remove-orphans
```

unless the release owner explicitly approves data destruction and backup restore evidence is available.

## Final Boundary

Rollback completion restores controlled pilot operation only. It does not approve real clinical production use.
