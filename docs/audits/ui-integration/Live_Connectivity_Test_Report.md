# Live Connectivity Test Report

Generated: 2026-07-01T06:07:01.266Z

| Test | Result | Evidence |
| --- | --- | --- |
| Foundation health | PASS for GET, HEAD returns 404 | GET https://foundation.utbe.ai/health -> HTTP 200; curl -I observed HTTP 404 |
| Foundation readiness | PASS for GET, HEAD returns 404 | GET https://foundation.utbe.ai/ready -> HTTP 200; curl -I observed HTTP 404 |
| Foundation JWKS | PASS for GET, HEAD returns 404 | GET https://foundation.utbe.ai/.well-known/jwks.json -> HTTP 200; JWKS shape returned from existing provider |
| Login discovery | FAIL LIVE / PASS REPOSITORY | https://foundation.utbe.ai/.well-known/openid-configuration -> HTTP 404; repository auth provider test passes |
| Token mode | NOT EXECUTED LIVE | No Foundation-issued test JWT present in environment during this audit |
| API allowlist | PASS | web:check covers allowed reads, unknown blocking, write blocking, clinical/admin blocking, operator-only test restriction |
| Service OpenAPI availability | CONTRACT PASS | 26 OpenAPI documents validated; local service runtime was not started for browser polling in this audit |
| Service health endpoints | CONTRACT PASS / LOCAL LIVE NOT RUNNING | Runtime URLs generated and Docker/Kubernetes validation passes; local probes to ports 18094, 18095, and 18141-18147 returned curl error 7 because service containers were not running during this UI audit |
| Service readiness endpoints | CONTRACT PASS / LOCAL LIVE NOT RUNNING | Same as health endpoints |
| Local web UI smoke test | PASS | `curl -I http://localhost:5174/` returned HTTP 200 |
| Foundation required HEAD checks | FAIL FOR HEAD | `curl -I` returned HTTP 404 for `/health`, `/ready`, and `/.well-known/jwks.json`; GET requests returned HTTP 200 for the same three URLs |
| Foundation auth/audit/policy preflight | FAIL LIVE | OPTIONS returned HTTP 404 for `/api/v1/auth/login`, `/api/v1/audit-records`, and `/api/v1/policy/evaluate` |
| Protected API access | NOT EXECUTED LIVE | Requires valid token and local/remote service runtime |
| Tenant header propagation | TEST PASS | Repository integration tests validate tenant headers and tenant mismatch rejection |
| 401 behavior | TEST PASS | Repository tests validate unauthenticated rejection |
| 403 behavior | TEST PASS | Repository tests validate RBAC/ABAC denials |
| CORS behavior | PARTIAL | Foundation auth CORS test passes in repository provider; live auth route returns HTTP 404 |

No live success was inferred for routes that returned 404 or were not reachable with credentials.
