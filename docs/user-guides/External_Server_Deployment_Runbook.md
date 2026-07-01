# External Server Deployment Runbook

Date: 2026-07-01
Scope: Panacea OS external controlled pilot deployment

This runbook installs and validates Panacea OS for an external controlled pilot. It does not approve real clinical production use.

## 1. Prepare Server

Use an approved Ubuntu server that satisfies `docs/user-guides/External_Server_Prerequisite_Checklist.md`.

```bash
sudo apt update
sudo apt upgrade
sudo timedatectl set-timezone <APPROVED_TIMEZONE>
```

## 2. Install Docker

Install Docker Engine using the approved operating-system package process or Docker's official repository.

```bash
docker --version
sudo systemctl enable docker
sudo systemctl start docker
```

## 3. Install Docker Compose

Verify the Docker Compose plugin:

```bash
docker compose version
```

## 4. Clone Repository

Use the official repository URL provided by the operator:

```bash
git clone <OFFICIAL_REPOSITORY_URL> panacea-os
cd panacea-os
```

## 5. Select Branch

```bash
git fetch origin
git checkout develop/v4.0
git pull --ff-only origin develop/v4.0
```

## 6. Create `.env.pilot`

Create the operator-local environment file outside Git tracking:

```bash
cp .env.pilot.example .env.pilot
```

Edit `.env.pilot` and replace every `REPLACE_WITH_REAL_VALUE_OUTSIDE_GIT` value with approved operator-provided values. Do not commit `.env.pilot`.

Load it:

```bash
set -a
. ./.env.pilot
set +a
```

## 7. Configure Domain

Follow `docs/user-guides/UTBE_Domain_DNS_Setup_Guide.md`.

Use these controlled pilot domains:

```text
panacea.utbe.ai
api.panacea.utbe.ai
```

## 8. Configure HTTPS Reverse Proxy

For the UTBE pilot, use:

```bash
sudo cp infra/reverse-proxy/nginx.utbe.panacea.conf /etc/nginx/sites-available/panacea-utbe.conf
sudo ln -sfn /etc/nginx/sites-available/panacea-utbe.conf /etc/nginx/sites-enabled/panacea-utbe.conf
sudo nginx -t
sudo systemctl reload nginx
```

Confirm certificate paths before reload.

## 9. Start Services

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml up -d --build
```

## 10. Run Health Checks

Inspect containers:

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml ps
```

Validate public routes with `docs/operations/External_Pilot_Route_Verification_Template.md`.

For local runtime validation on the same package:

```bash
npm run panacea:deployment:verify
npm run panacea:pilot:check
npm run panacea:pilot:config
```

## 11. Start Web UI

For a controlled pilot server without a separate web image:

```bash
npm --prefix apps/panacea-web ci
npm run web:build
npm --prefix apps/panacea-web run preview -- --host 0.0.0.0 --port 5174
```

Place the web UI behind the HTTPS reverse proxy. Do not expose unauthenticated internal ports to the public internet.

## 12. Stop Services

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml down --remove-orphans
```

## 13. Restart Services

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml restart
```

## 14. Inspect Logs

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml logs --tail=200
docker compose -f infra/docker-compose/pilot/docker-compose.yml logs -f
```

## 15. Backup Database

Follow `docs/user-guides/Pilot_Backup_Restore_Runbook.md`.

```bash
mkdir -p "$PANACEA_BACKUP_DIR"
docker exec panacea-pilot-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > "$PANACEA_BACKUP_DIR/panacea_runtime_$(date +%Y%m%d_%H%M%S).backup"
```

## 16. Restore Database

Restore only after operator approval:

```bash
cat "$PANACEA_BACKUP_DIR/<BACKUP_FILE>.backup" | docker exec -i panacea-pilot-postgres pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists
```

## 17. Rollback Deployment

Follow `docs/user-guides/Pilot_Rollback_And_Recovery_Runbook.md`.

At minimum:

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml down --remove-orphans
git checkout <APPROVED_PREVIOUS_COMMIT_OR_TAG>
set -a
. ./.env.pilot
set +a
docker compose -f infra/docker-compose/pilot/docker-compose.yml up -d --build
```

## Final Boundary

Ready for controlled external pilot go-live preparation.
Not approved for real clinical production use.
