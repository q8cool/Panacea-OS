# Real Server Deployment Evidence Template

Status: operator evidence template
Scope: controlled external pilot environment verification
Clinical status: not approved for real clinical production use

Do not include secrets, private keys, access tokens, patient data, or credential material in this document.

## Deployment Identity

| Evidence item | Value | Evidence source | Operator sign-off |
|---|---|---|---|
| Server hostname | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | `hostname -f` | |
| Server IP | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | approved infrastructure record | |
| OS version | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | `lsb_release -a` | |
| Docker version | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | `docker --version` | |
| Docker Compose version | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | `docker compose version` | |
| Repository URL | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | `git remote -v` | |
| Branch deployed | `develop/v4.0` | `git branch --show-current` | |
| Commit deployed | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | `git rev-parse --short HEAD` | |
| Deployment date/time | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | operator record | |

## Domain And HTTPS Evidence

| Evidence item | Value | Expected result | Actual result | Operator sign-off |
|---|---|---|---|---|
| Public API domain | `https://api.panacea.example.com` | DNS resolves to approved server | Pending | |
| TLS certificate issuer | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | approved CA | Pending | |
| TLS expiry date | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | renewal window documented | Pending | |
| HTTPS status | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | HTTP 200 on live endpoints | Pending | |
| Nginx config test | `sudo nginx -t` | success | Pending | |

## Service Health Evidence

| Service | Live status | Ready status | Metrics status | OpenAPI status | Evidence command | Operator sign-off |
|---|---|---|---|---|---|---|
| autonomous-healthcare-intelligence-foundation | Pending | Pending | Pending | Pending | `curl -fsS <URL>` | |
| real-time-global-healthcare-command-intelligence-platform | Pending | Pending | Pending | Pending | `curl -fsS <URL>` | |
| global-workforce | Pending | Pending | Pending | Pending | `curl -fsS <URL>` | |
| global-legal | Pending | Pending | Pending | Pending | `curl -fsS <URL>` | |
| customer-success | Pending | Pending | Pending | Pending | `curl -fsS <URL>` | |
| product-management | Pending | Pending | Pending | Pending | `curl -fsS <URL>` | |
| compliance | Pending | Pending | Pending | Pending | `curl -fsS <URL>` | |
| ai-assurance | Pending | Pending | Pending | Pending | `curl -fsS <URL>` | |
| privacy-consent-trust | Pending | Pending | Pending | Pending | `curl -fsS <URL>` | |

## Backup, Restore, And Rollback Evidence

| Evidence item | Expected result | Actual result | Evidence location | Operator sign-off |
|---|---|---|---|---|
| Backup created | backup file exists in approved storage | Pending | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | |
| Backup encrypted if required | policy compliant | Pending | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | |
| Restore drill completed | restore completes without schema errors | Pending | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | |
| Rollback drill completed | previous approved version starts and passes health checks | Pending | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | |
| Audit/event/projection consistency checked | no inconsistency detected | Pending | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | |

## Security Evidence

| Evidence item | Expected result | Actual result | Operator sign-off |
|---|---|---|---|
| `.env.pilot` outside Git | not tracked | Pending | |
| No real secrets in Git | secret scan passes | Pending | |
| Firewall configured | only approved ports exposed | Pending | |
| CORS restricted | approved origins only | Pending | |
| No real patient data | operator attestation | Pending | |

## Final Operator Sign-Off

| Role | Name | Decision | Date |
|---|---|---|---|
| Platform operator | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | Pending | |
| Security owner | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | Pending | |
| Privacy/legal owner | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | Pending | |
| Clinical governance owner | `REPLACE_WITH_OPERATOR_VALUE_OUTSIDE_GIT` | Pending | |

## Final Boundary

This evidence template supports controlled pilot deployment verification only.

Not approved for real clinical production use.
