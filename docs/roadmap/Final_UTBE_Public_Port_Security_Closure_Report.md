# Final UTBE Public Port Security Closure Report

Date: 2026-07-02 07:13:35 +03
Branch: `develop/v4.0`
Baseline commit before this closure: `2ac8a19`

## Final Decision

Repository-side port hardening is complete and validated.

External server public-port closure is not yet fully validated because SSH access to `162.0.228.10` was not available from this workstation:

```text
root@162.0.228.10: Permission denied (publickey,password).
```

Current public probing still shows direct runtime service ports open on the UTBE server. Therefore the final external security closure is **pending server redeploy and firewall application**.

Target final decision after the server applies this commit and UFW rules:

```text
Panacea OS UTBE external pilot is HTTPS-routed and direct runtime service ports are restricted.
Still not approved for real clinical production use.
```

## Ports Previously Exposed

The following direct runtime service ports were previously observed as publicly reachable:

```text
18094
18095
18141
18142
18143
18144
18145
18146
18147
```

PostgreSQL public exposure remained blocked:

```text
5432 blocked
55433 blocked
```

## Changes Made

### Docker Runtime Compose

Updated `infra/docker-compose/runtime/docker-compose.yml` so PostgreSQL and all runtime service host ports bind to loopback only:

```text
127.0.0.1:55433:5432
127.0.0.1:18094:8094
127.0.0.1:18095:8095
127.0.0.1:18141:8141
127.0.0.1:18142:8142
127.0.0.1:18143:8143
127.0.0.1:18144:8144
127.0.0.1:18145:8145
127.0.0.1:18146:8146
127.0.0.1:18147:8147
```

### Docker Pilot Compose

Updated `infra/docker-compose/pilot/docker-compose.yml` so pilot PostgreSQL and service ports bind to loopback only by default:

```text
127.0.0.1:${POSTGRES_PORT:-5432}:5432
127.0.0.1:${PANACEA_PORT_AUTONOMOUS_HEALTHCARE_INTELLIGENCE:-18094}:8094
127.0.0.1:${PANACEA_PORT_GLOBAL_COMMAND_INTELLIGENCE:-18095}:8095
127.0.0.1:${PANACEA_PORT_GLOBAL_WORKFORCE:-18141}:8141
127.0.0.1:${PANACEA_PORT_GLOBAL_LEGAL_GOVERNANCE:-18142}:8142
127.0.0.1:${PANACEA_PORT_GLOBAL_CUSTOMER_SUCCESS:-18143}:8143
127.0.0.1:${PANACEA_PORT_GLOBAL_PRODUCT_MANAGEMENT:-18144}:8144
127.0.0.1:${PANACEA_PORT_GLOBAL_COMPLIANCE:-18145}:8145
127.0.0.1:${PANACEA_PORT_GLOBAL_AI_ASSURANCE:-18146}:8146
127.0.0.1:${PANACEA_PORT_GLOBAL_PRIVACY:-18147}:8147
```

### Deployment Verification

Updated `scripts/panacea-runtime.mjs` so `npm run panacea:deployment:verify`, `npm run panacea:pilot:check`, and `npm run panacea:utbe:verify` fail if runtime or pilot compose files expose direct service ports publicly.

### Automated Tests

Updated `tests/runtime-orchestration/runtime-orchestration.test.mjs` to assert:

- runtime Docker Compose binds service ports to `127.0.0.1` only.
- runtime PostgreSQL binds to `127.0.0.1:55433`.
- pilot Docker Compose binds service and PostgreSQL ports to `127.0.0.1` only.

### Operator Checklist

Updated `docs/user-guides/Real_Server_Deployment_Execution_Checklist.md` with an explicit UFW baseline:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 18094/tcp
sudo ufw deny 18095/tcp
sudo ufw deny 18141:18147/tcp
sudo ufw deny 5432/tcp
sudo ufw deny 55433/tcp
sudo ufw enable
sudo ufw status verbose
```

## Docker Binding Status

Local validation after the compose changes:

```text
panacea-runtime-autonomous-healthcare-intelligence-foundation 127.0.0.1:18094->8094/tcp
panacea-runtime-real-time-global-healthcare-command-intelligence-platform 127.0.0.1:18095->8095/tcp
panacea-runtime-global-workforce-hr-credentialing-staff-experience-platform 127.0.0.1:18141->8141/tcp
panacea-runtime-global-legal-contracting-risk-governance-platform 127.0.0.1:18142->8142/tcp
panacea-runtime-global-customer-success-support-service-management-platform 127.0.0.1:18143->8143/tcp
panacea-runtime-global-product-management-roadmap-innovation-portfolio-platform 127.0.0.1:18144->8144/tcp
panacea-runtime-global-compliance-automation-regulatory-intelligence-platform 127.0.0.1:18145->8145/tcp
panacea-runtime-global-ai-assurance-safety-model-risk-management-platform 127.0.0.1:18146->8146/tcp
panacea-runtime-global-enterprise-data-privacy-consent-trust-platform 127.0.0.1:18147->8147/tcp
panacea-runtime-postgres 127.0.0.1:55433->5432/tcp
```

`npm run runtime:orchestration` passed after the binding change, confirming internal runtime checks still work.

## Nginx Routing Status

`infra/reverse-proxy/nginx.utbe.panacea.conf` already proxies to `127.0.0.1` upstreams:

```text
127.0.0.1:18094
127.0.0.1:18095
127.0.0.1:18141
127.0.0.1:18142
127.0.0.1:18143
127.0.0.1:18144
127.0.0.1:18145
127.0.0.1:18146
127.0.0.1:18147
```

Therefore the loopback Docker binding is compatible with host-level Nginx HTTPS routing.

## Public HTTPS API Validation

Command:

```bash
npm run panacea:utbe:external-health
```

Result:

```text
panacea.utbe.external-health result=pass routes=36
```

All API routes through `https://api.panacea.utbe.ai` continued to return expected HTTP 200 responses at validation time.

## Direct Runtime Port Blocking Validation

External probe after the repository change but before server redeploy:

```text
api.panacea.utbe.ai:18094 open
api.panacea.utbe.ai:18095 open
api.panacea.utbe.ai:18141 open
api.panacea.utbe.ai:18142 open
api.panacea.utbe.ai:18143 open
api.panacea.utbe.ai:18144 open
api.panacea.utbe.ai:18145 open
api.panacea.utbe.ai:18146 open
api.panacea.utbe.ai:18147 open
```

This confirms the external server still needs a pull/redeploy and firewall apply step. The repository changes are ready, but the live server closure has not been completed from this workstation.

Expected result after server redeploy:

```text
api.panacea.utbe.ai:18094 blocked
api.panacea.utbe.ai:18095 blocked
api.panacea.utbe.ai:18141 blocked
api.panacea.utbe.ai:18142 blocked
api.panacea.utbe.ai:18143 blocked
api.panacea.utbe.ai:18144 blocked
api.panacea.utbe.ai:18145 blocked
api.panacea.utbe.ai:18146 blocked
api.panacea.utbe.ai:18147 blocked
```

## PostgreSQL Exposure Validation

External PostgreSQL exposure remains blocked:

```text
api.panacea.utbe.ai:5432 blocked
api.panacea.utbe.ai:55433 blocked
```

## Required Server Commands

Run on `162.0.228.10` with approved operator access:

```bash
cd <PANACEA_OS_REPOSITORY>
git pull origin develop/v4.0
docker compose -f infra/docker-compose/pilot/docker-compose.yml down --remove-orphans
docker compose --env-file .env.utbe.pilot -f infra/docker-compose/pilot/docker-compose.yml up -d --build
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 18094/tcp
sudo ufw deny 18095/tcp
sudo ufw deny 18141:18147/tcp
sudo ufw deny 5432/tcp
sudo ufw deny 55433/tcp
sudo ufw status verbose
```

Then rerun from an external network:

```bash
npm run panacea:utbe:external-health
for port in 18094 18095 18141 18142 18143 18144 18145 18146 18147 5432 55433; do
  nc -G 3 -z api.panacea.utbe.ai "$port" && echo "open $port" || echo "blocked $port"
done
```

## Validation Commands Run Locally

| Command | Result |
|---|---|
| `docker compose -f infra/docker-compose/runtime/docker-compose.yml config --quiet` | PASS |
| `docker compose -f infra/docker-compose/pilot/docker-compose.yml --env-file .env.utbe.pilot.example config --quiet` | PASS |
| `npm run panacea:deployment:verify` | PASS |
| `npm run panacea:utbe:verify` | PASS |
| `npm run runtime:orchestration` | PASS |
| `npm run panacea:start && docker ps && npm run panacea:health && npm run panacea:stop` | PASS |
| `npm run check` | PASS |
| `npm run test:run` | PASS, 148 tests |
| `npm run openapi` | PASS |
| `npm run panacea:utbe:external-health` | PASS, 36 routes |

## Final Status

Configuration and repository validation are complete.

Live server public-port closure remains pending because direct runtime ports are still externally reachable and SSH access was not available for applying the change.

Panacea OS remains live on UTBE domains for controlled external pilot validation.
Still not approved for real clinical production use.
