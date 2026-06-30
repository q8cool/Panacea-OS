# Foundation utbe.ai Environment Template

Release: Panacea OS Enterprise v4.0.0
Recommended Foundation base URL: `https://foundation.utbe.ai`

## Required Foundation Provider Environment

Use these values when the Foundation provider is deployed and routed under `foundation.utbe.ai`.

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

## Required Live Validation Credentials

The following values are required only for authenticated live validation. Use short-lived validation credentials issued for this purpose.

```sh
export FOUNDATION_TEST_JWT="<short-lived-foundation-test-jwt>"
export FOUNDATION_TEST_AUTH_HEADER="Bearer <short-lived-foundation-test-token>"
export FOUNDATION_TEST_BEARER_TOKEN="<short-lived-foundation-test-token>"
```

If JWT audience validation is enforced by the live issuer, also set:

```sh
export FOUNDATION_AUDIENCE="<expected-foundation-audience>"
```

## Required Endpoints

| Purpose | URL |
|---|---|
| Health | `https://foundation.utbe.ai/health` |
| Readiness | `https://foundation.utbe.ai/ready` |
| Metrics | `https://foundation.utbe.ai/metrics` |
| JWKS | `https://foundation.utbe.ai/.well-known/jwks.json` |
| Audit append | `https://foundation.utbe.ai/api/v1/audit-records` |
| Policy evaluation | `https://foundation.utbe.ai/api/v1/policy/evaluate` |

## Expected Live Validation Results

| Check | Expected result |
|---|---|
| DNS | `foundation.utbe.ai` resolves to the production Foundation ingress |
| TLS | Valid certificate for `foundation.utbe.ai` |
| Health | HTTP 200 with a valid health response |
| Readiness | HTTP 200 with a ready response |
| Metrics | HTTP 200 with metrics content and no secret values |
| JWKS | HTTP 200 with a valid JWKS document containing at least one public key |
| JWT | Valid signature, issuer, expiry, tenant claim, and role or permission claims |
| Audit append | HTTP 200, 201, or accepted success response for a `testOnly: true` event |
| Policy evaluation | HTTP 200 with deterministic allow or deny response |

## Operator Setup Checklist

1. Create DNS for `foundation.utbe.ai`.
2. Route `foundation.utbe.ai` to the Foundation provider ingress or API gateway.
3. Issue a TLS certificate whose SAN includes `foundation.utbe.ai`.
4. Deploy the Foundation provider endpoints listed above.
5. Enable JWKS publication and configure issuer `https://foundation.utbe.ai`.
6. Provide short-lived validation credentials for audit append and policy evaluation tests.
7. Rerun the final live Foundation provider validation.
