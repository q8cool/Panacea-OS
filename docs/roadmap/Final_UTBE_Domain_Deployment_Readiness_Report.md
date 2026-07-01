# Final UTBE Domain Deployment Readiness Report

Date: 2026-07-01
Branch: `develop/v4.0`
Real domain selected: `utbe.ai`
Web subdomain: `panacea.utbe.ai`
API subdomain: `api.panacea.utbe.ai`

## Final Decision

PASS for repository-side UTBE deployment readiness.

Ready for UTBE controlled external pilot deployment execution.
Not approved for real clinical production use.

## DNS Requirements

Required DNS records:

```text
A     panacea       <SERVER_PUBLIC_IP>
A     api.panacea   <SERVER_PUBLIC_IP>
```

Alternative full-host records:

```text
A     panacea.utbe.ai       <SERVER_PUBLIC_IP>
A     api.panacea.utbe.ai   <SERVER_PUBLIC_IP>
```

Guide created:

- `docs/user-guides/UTBE_Domain_DNS_Setup_Guide.md`

## HTTPS Requirements

Required HTTPS endpoints:

- `https://panacea.utbe.ai`
- `https://api.panacea.utbe.ai`

Runbook created:

- `docs/user-guides/UTBE_HTTPS_Certificate_Runbook.md`

## Nginx Configuration

Created:

- `infra/reverse-proxy/nginx.utbe.panacea.conf`

The configuration includes HTTP to HTTPS redirects, separate HTTPS virtual hosts for web and API, TLS certificate placeholders, reverse proxy routing, security headers, CORS restricted to `https://panacea.utbe.ai`, proxy timeout settings, and request body size limits.

## Environment Template

Created:

- `.env.utbe.pilot.example`

The template sets:

```text
PANACEA_PUBLIC_WEB_URL=https://panacea.utbe.ai
PANACEA_API_PUBLIC_BASE_URL=https://api.panacea.utbe.ai
PANACEA_CORS_ALLOWED_ORIGINS=https://panacea.utbe.ai
```

All secret-bearing values remain placeholders for operator-provided values outside Git.

## External API Route Matrix

Created:

- `docs/operations/UTBE_External_API_Route_Matrix.md`

The matrix contains live, ready, metrics, and OpenAPI URLs for all 9 active services under `https://api.panacea.utbe.ai`.

## Verification Commands

Created:

- `npm run panacea:utbe:verify`
- `npm run panacea:utbe:external-health`

`panacea:utbe:verify` validates repository-side UTBE readiness only. It does not require live DNS or HTTPS.

`panacea:utbe:external-health` is reserved for an explicit real external check and must fail clearly if DNS, HTTPS, or the public pilot stack is not configured.

## Validation Commands

| Command | Result |
|---|---|
| `npm run check` | PASS |
| `npm run build` | PASS |
| `npm run test:run` | PASS, 148 tests |
| `npm run openapi` | PASS, 26 OpenAPI documents |
| `npm run web:check` | PASS, 53 web tests |
| `npm run web:build` | PASS |
| `npm run quality:gate` | PASS |
| `npm run runtime:orchestration` | PASS |
| `npm run panacea:start` | PASS |
| `npm run panacea:health` | PASS |
| `npm run panacea:pilot:health` | PASS |
| `npm run panacea:stop` | PASS |
| `npm run panacea:pilot:check` | PASS |
| `npm run panacea:pilot:config` | PASS |
| `npm run panacea:deployment:verify` | PASS |
| `npm run panacea:utbe:verify` | PASS |
| `npm run audit` | PASS, 0 moderate-or-higher vulnerabilities |
| `gitleaks detect --source . --no-git --verbose` | PASS via `ghcr.io/gitleaks/gitleaks:latest`, no leaks found |

## GitHub Actions Status

PASS for post-update GitHub Actions run:

- Run: `28529355083`
- Commit: `f1e3315f86d5d22d41cb0a9f308126f7c94a002d`
- Status: `completed`
- Conclusion: `success`
- URL: `https://github.com/q8cool/Panacea-OS/actions/runs/28529355083`

The observed run passed automated tests, dependency audit, OpenAPI validation, build validation, Kubernetes manifest validation, Docker build validation, forbidden marker scan, live infrastructure validation, and external secret scan.

## Remaining Manual Steps

- Create DNS records for `panacea.utbe.ai` and `api.panacea.utbe.ai`.
- Prepare the server public IP.
- Create real `.env.utbe.pilot` outside Git.
- Install Nginx and Certbot.
- Issue TLS certificates.
- Start Docker pilot stack.
- Run public HTTPS health checks.

## Boundary

Ready for UTBE controlled external pilot deployment execution.
Not approved for real clinical production use.
