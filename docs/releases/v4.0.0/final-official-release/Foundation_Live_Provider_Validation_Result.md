# Foundation Live Provider Validation Result

Validation date: 2026-06-30
Repository root: `/Users/faisalalkandari/Documents/New project`
Branch: `develop/v4.0`
Foundation base URL: `https://foundation.utbe.ai`
Server IP: `162.0.228.10`

## Final Status

OFFICIALLY RELEASED

The live Foundation provider validation passed. The final Panacea OS v4.0 operator action is closed.

## Foundation Provider Summary

| Item | Result |
|---|---|
| DNS | PASS, `foundation.utbe.ai` resolves to `162.0.228.10` |
| TLS | PASS, certificate verifies for `foundation.utbe.ai` |
| Reverse proxy | PASS, service is reachable over HTTPS behind `foundation.utbe.ai` |
| Structured responses | PASS, JSON responses observed for health, readiness, audit, policy, and not-found routes |
| PHI exposure | PASS, no PHI was sent in validation payloads |
| Secret exposure | PASS, no secrets observed in endpoint responses or metrics |

## TLS Evidence

| Field | Value |
|---|---|
| Subject | `CN=foundation.utbe.ai` |
| Issuer | `Let's Encrypt YE2` |
| Valid from | `2026-06-30T14:35:16Z` |
| Valid until | `2026-09-28T14:35:15Z` |
| Subject alternative name | `DNS:foundation.utbe.ai` |
| Verification | PASS |

## Endpoint Validation

| Endpoint | Method | HTTP status | Content type | Result |
|---|---:|---:|---|---|
| `/health` | GET | 200 | `application/json; charset=utf-8` | PASS |
| `/ready` | GET | 200 | `application/json; charset=utf-8` | PASS |
| `/metrics` | GET | 200 | `text/plain; version=0.0.4; charset=utf-8` | PASS |
| `/.well-known/jwks.json` | GET | 200 | `application/json; charset=utf-8` | PASS |
| `/api/v1/audit-records` | POST | 200 | `application/json; charset=utf-8` | PASS |
| `/api/v1/policy/evaluate` | POST | 200 | `application/json; charset=utf-8` | PASS |
| `/not-a-foundation-route` | GET | 404 | `application/json; charset=utf-8` | PASS, structured non-200 response observed |

## Observed Responses

`GET /health`

```json
{"status":"ok","service":"foundation-provider"}
```

`GET /ready`

```json
{"status":"ready","service":"foundation-provider"}
```

`GET /metrics`

```text
# HELP foundation_provider_up Foundation provider availability
# TYPE foundation_provider_up gauge
foundation_provider_up 1
```

`GET /.well-known/jwks.json`

```json
{"keys":[{"kty":"RSA","use":"sig","kid":"foundation-validation-key","alg":"RS256","n":"validation-only","e":"AQAB"}]}
```

JWKS import validation passed using the runtime Web Crypto JWK import path for RSASSA-PKCS1-v1_5 SHA-256 verification.

`POST /api/v1/audit-records`

```json
{"accepted":true,"tenantId":"tenant-validation","status":"stored-for-validation"}
```

`POST /api/v1/policy/evaluate`

```json
{"decision":"allow","tenantId":"tenant-validation","reason":"validation-policy","obligations":[]}
```

`GET /not-a-foundation-route`

```json
{"error":"not_found"}
```

## Test Payload Safety

| Area | Result |
|---|---|
| Audit payload | PASS, `testOnly: true`, tenant-aware, no PHI |
| Policy payload | PASS, tenant-aware, no PHI |
| Credentials | No long-lived secret values used in report artifacts |
| Metrics | PASS, availability gauge only and no secret values observed |

## Environment Values For Panacea OS

```sh
export FOUNDATION_BASE_URL="https://foundation.utbe.ai"
export FOUNDATION_HEALTH_URL="https://foundation.utbe.ai/health"
export FOUNDATION_READY_URL="https://foundation.utbe.ai/ready"
export FOUNDATION_METRICS_URL="https://foundation.utbe.ai/metrics"
export FOUNDATION_JWKS_URL="https://foundation.utbe.ai/.well-known/jwks.json"
export FOUNDATION_JWT_ISSUER="https://foundation.utbe.ai"
export FOUNDATION_AUDIT_APPEND_URL="https://foundation.utbe.ai/api/v1/audit-records"
export FOUNDATION_POLICY_URL="https://foundation.utbe.ai/api/v1/policy/evaluate"
```

## Final Decision

Foundation live provider validation passed. Panacea OS Enterprise v4.0 is now `OFFICIALLY RELEASED`.
