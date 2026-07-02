# Final UTBE External Pilot Deployment Evidence Report

Date: 2026-07-02 07:03:19 +03
Branch: `develop/v4.0`
Repository commit at validation start: `c595bbf`

## Final Decision

Panacea OS is live on UTBE domains for controlled external pilot validation.
Not approved for real clinical production use.

## Deployment Targets

| Surface | URL | Evidence |
|---|---|---|
| Web UI | `https://panacea.utbe.ai` | HTTP 200, `text/html`, TLS verified |
| API gateway domain | `https://api.panacea.utbe.ai` | 36 runtime API checks returned HTTP 200 |
| Foundation provider | `https://foundation.utbe.ai` | DNS resolves to the same UTBE server IP |

## DNS Evidence

| Hostname | A record |
|---|---|
| `panacea.utbe.ai` | `162.0.228.10` |
| `api.panacea.utbe.ai` | `162.0.228.10` |
| `foundation.utbe.ai` | `162.0.228.10` |

DNS was verified with `dig +short` and `nslookup`.

## HTTPS Evidence

| Hostname | TLS result |
|---|---|
| `panacea.utbe.ai:443` | TLS 1.3, `TLS_AES_256_GCM_SHA384`, certificate verification OK |
| `api.panacea.utbe.ai:443` | TLS 1.3, `TLS_AES_256_GCM_SHA384`, certificate verification OK |

`curl -fsSI https://panacea.utbe.ai` returned HTTP 200 with security headers:

- `strict-transport-security: max-age=31536000; includeSubDomains`
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: no-referrer`
- `permissions-policy: camera=(), microphone=(), geolocation=()`

## Web UI Evidence

Command:

```bash
curl -fsS -o /tmp/panacea_web.html -w 'web_status=%{http_code} content_type=%{content_type} time_total=%{time_total}\n' --max-time 15 https://panacea.utbe.ai
```

Result:

```text
web_status=200 content_type=text/html time_total=0.723055
```

The returned body starts with the deployed web application document:

```html
<!doctype html>
<html lang="en">
```

## API Runtime Evidence

Command:

```bash
npm run panacea:utbe:external-health
```

Result:

```text
panacea.utbe.external-health result=pass routes=36
```

The command validated `live`, `ready`, `metrics`, and `docs/openapi.json` endpoints for all 9 active services through `https://api.panacea.utbe.ai`.

## Live Endpoint Evidence

| Service | Live URL | HTTP |
|---|---|---|
| autonomous-healthcare-intelligence-foundation | `https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/live` | 200 |
| real-time-global-healthcare-command-intelligence-platform | `https://api.panacea.utbe.ai/api/v4/global-command-intelligence/live` | 200 |
| global-workforce-hr-credentialing-staff-experience-platform | `https://api.panacea.utbe.ai/api/v3/global-workforce/live` | 200 |
| global-legal-contracting-risk-governance-platform | `https://api.panacea.utbe.ai/api/v3/global-legal-governance/live` | 200 |
| global-customer-success-support-service-management-platform | `https://api.panacea.utbe.ai/api/v3/global-customer-success/live` | 200 |
| global-product-management-roadmap-innovation-portfolio-platform | `https://api.panacea.utbe.ai/api/v3/global-product-management/live` | 200 |
| global-compliance-automation-regulatory-intelligence-platform | `https://api.panacea.utbe.ai/api/v3/global-compliance/live` | 200 |
| global-ai-assurance-safety-model-risk-management-platform | `https://api.panacea.utbe.ai/api/v3/global-ai-assurance/live` | 200 |
| global-enterprise-data-privacy-consent-trust-platform | `https://api.panacea.utbe.ai/api/v3/global-privacy/live` | 200 |

Direct sample command:

```bash
curl -fsS -o /tmp/panacea_api_live.json -w 'api_live_status=%{http_code} content_type=%{content_type} time_total=%{time_total}\n' --max-time 15 https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/live
```

Result:

```text
api_live_status=200 content_type=application/json; charset=utf-8 time_total=0.749374
{"status":"live","service":"autonomous-healthcare-intelligence-foundation"}
```

## Docker Runtime Evidence

External runtime health was validated through the deployed service endpoints:

- 9 live endpoints returned HTTP 200.
- 9 readiness endpoints returned HTTP 200.
- 9 metrics endpoints returned HTTP 200.
- 9 OpenAPI endpoints returned HTTP 200.

This indicates the Docker-backed runtime services are reachable through the public UTBE API domain. Direct SSH access to the remote Docker daemon was not used from this workstation.

## CORS Evidence

Allowed origin preflight:

```bash
curl -sS -D - -o /tmp/cors_allowed_body.txt -X OPTIONS \
  https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/live \
  -H 'Origin: https://panacea.utbe.ai' \
  -H 'Access-Control-Request-Method: GET'
```

Result:

```text
HTTP/2 204
access-control-allow-origin: https://panacea.utbe.ai
access-control-allow-credentials: true
access-control-allow-headers: Authorization, Content-Type, X-Tenant-ID, X-Request-ID
access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

Disallowed origin preflight using `Origin: https://evil.example` did not echo the disallowed origin. The response continued to restrict `access-control-allow-origin` to `https://panacea.utbe.ai`.

## Backup Evidence

Command:

```bash
node scripts/disaster-recovery-mini-drill.mjs --keep
docker exec panacea-runtime-postgres ls -lh /tmp/panacea_runtime_dr.dump
docker exec panacea-runtime-postgres sh -c 'test -s /tmp/panacea_runtime_dr.dump && echo backup_file_generated=yes'
docker compose -f infra/docker-compose/runtime/docker-compose.yml down -v --remove-orphans
```

Result:

```text
Disaster recovery mini-drill passed. records=1 events=1 audits=1 indexes=206 eventOutboxTables=11
-rw-r--r--    1 root     root      189.9K Jul  2 04:02 /tmp/panacea_runtime_dr.dump
backup_file_generated=yes
```

No backup artifact was committed to Git.

## Firewall And Network Exposure Evidence

Network probe summary:

| Host | Ports observed open |
|---|---|
| `panacea.utbe.ai` | 80, 443, 22, 18094, 18095, 18141, 18142, 18143, 18144, 18145, 18146, 18147 |
| `api.panacea.utbe.ai` | 80, 443, 22, 18094, 18095, 18141, 18142, 18143, 18144, 18145, 18146, 18147 |

Database ports were not externally reachable:

| Host | Port | Result |
|---|---:|---|
| `panacea.utbe.ai` | 5432 | closed or filtered |
| `panacea.utbe.ai` | 55433 | closed or filtered |
| `api.panacea.utbe.ai` | 5432 | closed or filtered |
| `api.panacea.utbe.ai` | 55433 | closed or filtered |

Pilot interpretation:

- HTTP 80 and HTTPS 443 are required for web/API access and certificate renewal.
- SSH 22 is open for server administration and should be restricted to operator IPs.
- Direct service runtime ports are currently reachable for pilot validation; before real clinical production, restrict these ports to localhost, the reverse proxy network, VPN, or an allowlisted operator network.
- PostgreSQL is not publicly exposed.

## Patient Data Boundary

No real patient data was used in this validation.

The validation used:

- HTTP GET, HEAD, and OPTIONS checks.
- Public health/readiness/metrics/OpenAPI endpoints.
- Synthetic disaster recovery validation actor `sprint89-dr-validator`.
- Tenant marker `tenant-runtime-drill`.

No PHI payloads, real credentials, real patient identifiers, clinical diagnosis data, treatment recommendations, or production patient records were transmitted or committed.

## Validation Commands

| Command | Result |
|---|---|
| `npm run check` | PASS |
| `npm run openapi` | PASS, 26 OpenAPI documents |
| `npm run test:run` | PASS, 148 tests |
| `npm run panacea:utbe:verify` | PASS |
| `npm run panacea:utbe:external-health` | PASS, 36 public UTBE routes |
| `node scripts/disaster-recovery-mini-drill.mjs --keep` | PASS |

## Remaining Production Hardening Before Clinical Use

This deployment is suitable for controlled external pilot validation only. Before real clinical production use:

- Close or source-restrict direct service runtime ports.
- Restrict SSH to operator IPs or VPN.
- Confirm remote backup retention outside the container host.
- Confirm monitoring, alerting, and log retention on the external server.
- Complete formal clinical, privacy, security, and operational approvals.
- Continue to prohibit real patient data until clinical production approval is granted.

## Final Status

Panacea OS is live on UTBE domains for controlled external pilot validation.
Not approved for real clinical production use.
