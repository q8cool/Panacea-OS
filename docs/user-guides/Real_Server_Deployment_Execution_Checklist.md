# Real Server Deployment Execution Checklist

Status: controlled external pilot execution checklist
Scope: Panacea OS external pilot deployment on an operator-controlled server
Clinical status: not approved for real clinical production use

Use operator-supplied values outside Git. Do not paste real secrets into this checklist or commit `.env.pilot`.

## 1. Server Access

| Step | Command or evidence | Status | Operator sign-off |
|---|---|---|---|
| Confirm approved server owner | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | Pending | |
| Confirm SSH access method | `ssh <DEPLOY_USER>@<SERVER_HOSTNAME_OR_IP>` | Pending | |
| Confirm non-root deploy user exists | `id <DEPLOY_USER>` | Pending | |
| Confirm sudo policy | `sudo -l` | Pending | |
| Confirm no real patient data is present | Operator attestation | Pending | |

## 2. OS Package Update

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo reboot
```

After reconnecting:

```bash
uname -a
lsb_release -a
```

Expected: supported Ubuntu LTS release, patched packages, and stable SSH reconnect.

## 3. Docker Installation Verification

```bash
docker --version
docker info
docker run --rm hello-world
```

Expected: Docker command succeeds for the deploy user or through approved sudo policy.

## 4. Docker Compose Verification

```bash
docker compose version
docker compose ls
```

Expected: Docker Compose v2 is available.

## 5. Repository Clone

```bash
mkdir -p /opt/panacea
cd /opt/panacea
git clone <OFFICIAL_PANACEA_REPOSITORY_URL> panacea-os
cd panacea-os
git remote -v
```

Expected: remote points to the official Panacea OS repository.

## 6. Branch Checkout

```bash
git fetch origin
git checkout develop/v4.0
git pull --ff-only origin develop/v4.0
git rev-parse --short HEAD
```

Expected: deployed commit matches the approved release evidence commit.

## 7. Environment File Creation Outside Git

```bash
cp .env.pilot.example .env.pilot
chmod 600 .env.pilot
${EDITOR:-nano} .env.pilot
```

Required rules:

- Keep `.env.pilot` outside commits.
- Use only approved secret storage as the source for secret values.
- Set `PANACEA_RUNTIME_MODE=pilot`.
- Set public URL, CORS origins, JWT issuer, PostgreSQL settings, and service URLs.
- Do not use real patient data for validation.

Verification:

```bash
git status --short --ignored
```

Expected: `.env.pilot` is not tracked.

## 8. Pilot Compose Startup

```bash
npm ci
npm run panacea:pilot:config
npm run panacea:deployment:verify
docker compose -f infra/docker-compose/pilot/docker-compose.yml --env-file .env.pilot up -d --build
docker ps
```

Expected: PostgreSQL and all active Panacea services are running or healthy.

## 9. Health Validation

```bash
npm run panacea:health
npm run panacea:pilot:health
```

Expected:

- PostgreSQL ready.
- All active service live endpoints return HTTP 200.
- All active service ready endpoints return HTTP 200.
- Metrics endpoints return HTTP 200.
- OpenAPI endpoints return HTTP 200.

## 10. Nginx Reverse Proxy Setup

```bash
sudo cp infra/reverse-proxy/nginx.panacea.example.conf /etc/nginx/sites-available/panacea.conf
sudo ${EDITOR:-nano} /etc/nginx/sites-available/panacea.conf
sudo ln -sfn /etc/nginx/sites-available/panacea.conf /etc/nginx/sites-enabled/panacea.conf
sudo nginx -t
sudo systemctl reload nginx
```

Expected: Nginx configuration test passes and reverse proxy routes to internal service ports.

## 11. HTTPS Certificate Setup

Use the operator-approved certificate process. Example with Certbot:

```bash
sudo certbot --nginx -d api.panacea.example.com
sudo certbot certificates
```

Expected: valid certificate for the pilot domain, automatic renewal configured, and no private key committed to Git.

## 12. Domain Verification

```bash
dig +short api.panacea.example.com
curl -I https://api.panacea.example.com/api/v4/autonomous-healthcare-intelligence/live
```

Expected: DNS resolves to the approved server and HTTPS returns a successful response.

## 13. Firewall Verification

```bash
sudo ufw status verbose
sudo ss -tulpn
```

Expected:

- SSH allowed only from approved operator locations where possible.
- HTTP and HTTPS open as needed for certificate issuance and pilot traffic.
- Internal service ports are not exposed publicly unless explicitly approved.

## 14. Backup Verification

```bash
mkdir -p backups
docker exec panacea-runtime-postgres pg_dump -U panacea -d panacea_runtime > backups/panacea_runtime_$(date +%Y%m%d_%H%M%S).sql
ls -lh backups/
```

Expected: backup file is created and stored in approved secure storage.

## 15. Restore Verification

Run restore only in an approved validation environment or during a controlled drill:

```bash
createdb panacea_restore_drill
psql panacea_restore_drill < backups/<APPROVED_BACKUP_FILE>.sql
```

Expected: restore completes and schema integrity checks pass.

## 16. Rollback Verification

```bash
git rev-parse --short HEAD
git checkout <PREVIOUS_APPROVED_COMMIT_OR_TAG>
docker compose -f infra/docker-compose/pilot/docker-compose.yml --env-file .env.pilot up -d --build
npm run panacea:health
```

Expected: previous approved version can start, health checks pass, and data rollback actions follow the approved recovery runbook.

## 17. Operator Sign-Off

| Area | Required sign-off | Status | Name/date |
|---|---|---|---|
| Server access approved | Platform owner | Pending | |
| Environment configured outside Git | Operator | Pending | |
| HTTPS validated | Operator | Pending | |
| Health checks passed | Operator | Pending | |
| Backup/restore validated | Operator | Pending | |
| Rollback validated | Operator | Pending | |
| No real patient data used | Clinical/privacy owner | Pending | |
| Pilot boundary accepted | Release owner | Pending | |

## Final Execution Boundary

Ready to execute real external controlled pilot deployment on a server after operator completion of this checklist.

Not approved for real clinical production use.
