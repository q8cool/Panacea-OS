# Foundation Live Provider Final Report

Report date: 2026-06-30
Branch: `develop/v4.0`
Foundation base URL: `https://foundation.utbe.ai`

## Final Result

FOUNDATION LIVE PROVIDER VALIDATED -- PASS.

The live Foundation provider is reachable over HTTPS, exposes the required validation endpoints, returns safe responses, and accepts tenant-aware validation payloads.

## Live Validation Status

| Check | Status |
|---|---|
| DNS | PASS, `foundation.utbe.ai` resolves to `162.0.228.10` |
| TLS | PASS, valid certificate for `foundation.utbe.ai` |
| Health endpoint | PASS, HTTP 200 |
| Readiness endpoint | PASS, HTTP 200 |
| Metrics endpoint | PASS, HTTP 200 and safe metrics response |
| JWKS endpoint | PASS, HTTP 200, JWKS object with one public key |
| JWKS import | PASS, key imported for RS256 verification path |
| Audit append endpoint | PASS, HTTP 200 for `testOnly: true` tenant-aware validation event |
| Policy endpoint | PASS, HTTP 200 deterministic allow response |
| Non-200 response model | PASS, invalid route returned JSON 404 |
| PHI handling | PASS, no PHI sent |
| Secret exposure | PASS, no secret values observed in live responses |

## Endpoint Evidence

| Endpoint | Method | HTTP status | Result |
|---|---:|---:|---|
| `https://foundation.utbe.ai/health` | GET | 200 | PASS |
| `https://foundation.utbe.ai/ready` | GET | 200 | PASS |
| `https://foundation.utbe.ai/metrics` | GET | 200 | PASS |
| `https://foundation.utbe.ai/.well-known/jwks.json` | GET | 200 | PASS |
| `https://foundation.utbe.ai/api/v1/audit-records` | POST | 200 | PASS |
| `https://foundation.utbe.ai/api/v1/policy/evaluate` | POST | 200 | PASS |

## Local Contract Evidence

Foundation provider wiring and contract configuration remain validated locally by:

- `scripts/lib/foundation-provider.mjs`
- `scripts/validate-foundation-provider.mjs`
- `tests/foundation-integration/foundation-provider-contract.test.mjs`
- Kubernetes ConfigMap wiring for all active service manifests
- Docker Compose runtime provider configuration
- Remote CI run `28455254596`

## Release Impact

The remaining Foundation provider operator action is closed.

Panacea OS Enterprise v4.0 final release status is now `OFFICIALLY RELEASED`.
