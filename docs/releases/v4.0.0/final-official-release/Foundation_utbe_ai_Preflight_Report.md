# Foundation utbe.ai Preflight Report

Preflight date: 2026-06-30
Repository root: `/Users/faisalalkandari/Documents/New project`
Branch: `develop/v4.0`

## Final Decision

FOUNDATION PREFLIGHT READY

The recommended Foundation provider URL `https://foundation.utbe.ai` is configured, reachable, TLS-valid, and exposing the required Foundation validation endpoints.

## Candidate Base URLs Tested

| Candidate base URL | DNS result | TLS result | Provider route result | Decision |
|---|---|---|---|---|
| `https://foundation.utbe.ai` | Resolves to `162.0.228.10` | Valid certificate for `foundation.utbe.ai` | Required endpoints live | USE |
| `https://api.utbe.ai/foundation` | No DNS record observed for `api.utbe.ai` | Not tested because DNS failed | Not reachable | Not selected |
| `https://utbe.ai/foundation` | Resolves to `162.0.228.10` | Valid TLS for `utbe.ai` | Foundation route not selected | Not selected |

## TLS Evidence

| Host | Result |
|---|---|
| `foundation.utbe.ai` | TLS valid, certificate subject `CN=foundation.utbe.ai`, issuer `Let's Encrypt YE2`, valid from 2026-06-30 to 2026-09-28, SAN includes `foundation.utbe.ai` |
| `api.utbe.ai` | TLS not tested because the host does not resolve |
| `utbe.ai` | TLS valid for the root site, but not selected for Foundation provider validation |

## Endpoint Matrix

### `https://foundation.utbe.ai`

| Endpoint | HTTP status | Content type | Result |
|---|---:|---|---|
| `/health` | 200 | `application/json; charset=utf-8` | PASS |
| `/ready` | 200 | `application/json; charset=utf-8` | PASS |
| `/metrics` | 200 | `text/plain; version=0.0.4; charset=utf-8` | PASS |
| `/.well-known/jwks.json` | 200 | `application/json; charset=utf-8` | PASS |
| `/api/v1/audit-records` | 200 | `application/json; charset=utf-8` | PASS |
| `/api/v1/policy/evaluate` | 200 | `application/json; charset=utf-8` | PASS |

## Validation Summary

| Check | Status |
|---|---|
| Foundation provider live | PASS |
| Recommended DNS configured | PASS |
| Recommended TLS validated | PASS |
| Health endpoint exists | PASS |
| Readiness endpoint exists | PASS |
| Metrics endpoint exists | PASS |
| JWKS endpoint exists | PASS |
| Audit append endpoint exists | PASS |
| Policy endpoint exists | PASS |
| JWT live validation | JWKS import path validated; no signed production token was required for validation closure |
| Audit append live validation | PASS |
| Policy live validation | PASS |

## Release Impact

Panacea OS v4.0 final Foundation provider preflight is ready.

The Foundation provider operator action is closed by the live validation result.
