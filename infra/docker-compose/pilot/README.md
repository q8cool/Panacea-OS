# Panacea OS Pilot Docker Compose

This profile prepares an external controlled pilot deployment for Panacea OS. It is not a real clinical production approval.

## Scope

The pilot profile starts:

- PostgreSQL 16
- 9 active Panacea runtime services
- an isolated Docker network
- named volumes for PostgreSQL and backups
- health checks for PostgreSQL and every service

## Environment

Create an operator-local environment file outside Git:

```bash
cp .env.pilot.example .env.pilot.local
```

Replace every `REPLACE_WITH_REAL_VALUE_OUTSIDE_GIT` value in `.env.pilot.local` before pilot use. Do not commit `.env.pilot.local`.

Load the environment:

```bash
set -a
. ./.env.pilot.local
set +a
```

## Start

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml up -d --build
```

## Inspect

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml ps
docker compose -f infra/docker-compose/pilot/docker-compose.yml logs --tail=200
```

## Health

Use the health matrix:

```bash
cat docs/operations/Pilot_Service_Health_Matrix.json
```

For the local runtime profile, use:

```bash
npm run panacea:pilot:health
```

For an external pilot behind a reverse proxy, use the external URLs from the health matrix and the approved domain.

## Stop

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml down --remove-orphans
```

The default stop command preserves named volumes. Remove volumes only during an operator-approved destructive pilot reset:

```bash
docker compose -f infra/docker-compose/pilot/docker-compose.yml down -v --remove-orphans
```

## Boundaries

- Do not use real patient data until legal, privacy, clinical, and operational approvals are complete.
- Do not commit real credentials or private keys.
- Do not expose services without HTTPS and restricted CORS.
- The Foundation Provider must be live and approved before Live Mode access.
- This profile does not add healthcare features, AI capabilities, or clinical behavior.
