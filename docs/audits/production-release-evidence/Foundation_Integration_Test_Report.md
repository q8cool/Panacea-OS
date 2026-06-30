# Foundation Integration Test Report

Audit date: 2026-06-30
Result: PASS

## Test Harness

File: `tests/foundation-integration/foundation-contract.test.mjs`

The harness does not add product behavior. It creates a test-only external Foundation authenticator that validates the required JWT contract, maps validated claims to the existing service principal model, and exercises the current service authorization, audit, event, and operational endpoint behavior.

## Validated Cases

| Case | Expected | Result |
|---|---|---|
| Valid JWT accepted | HTTP `201` | PASS |
| Missing JWT rejected | HTTP `401` | PASS |
| Invalid JWT rejected | HTTP `401` | PASS |
| Missing tenant rejected | HTTP `401` | PASS |
| Tenant claim propagated | Persisted tenant matches claim | PASS |
| RBAC denial | HTTP `403` | PASS |
| ABAC denial | HTTP `403` | PASS |
| Audit append payload shape | Tenant, actor, action, resource, country, metadata present | PASS |
| Event outbox payload shape | Tenant, actor, aggregate, payload, schema version present | PASS |
| Health endpoint | HTTP `200` | PASS |
| Readiness endpoint | HTTP `200` | PASS |
| Metrics endpoint | HTTP `200` | PASS |
| OpenAPI endpoint | HTTP `200` | PASS |

## Command Evidence

`npm run test:contract` passed with the Foundation contract harness included in the contract suite.

## Conclusion

The current service runtime is compatible with the documented external Foundation contract. Production release requires running the same contract against the real Foundation runtime.
