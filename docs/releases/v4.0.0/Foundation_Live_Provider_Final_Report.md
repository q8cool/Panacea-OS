# Foundation Live Provider Final Report

Report date: 2026-06-30
Branch: `develop/v4.0`

## Result

Live Foundation provider validation was not executed because no live Foundation provider configuration is present in this shell.

## Configuration Check

No environment variables matching `FOUNDATION_`, `PANACEA_FOUNDATION_`, `JWT_`, or `JWKS_` were available for a live provider validation run.

The following live values are still required from the operator or deployment environment:

- Foundation base URL
- JWT issuer
- JWKS URL or public key
- Audit append endpoint
- Policy evaluation endpoint, where configured
- Health endpoint
- Readiness endpoint
- Metrics endpoint
- Timeout settings
- Retry settings
- Circuit breaker settings

## Local Contract Evidence

Foundation provider wiring and contract configuration are validated locally by:

- `scripts/lib/foundation-provider.mjs`
- `scripts/validate-foundation-provider.mjs`
- `tests/foundation-integration/foundation-provider-contract.test.mjs`
- Kubernetes ConfigMap wiring for all active service manifests
- Docker Compose runtime provider configuration
- Remote CI run `28448921412`

## Accepted Operator Condition

Status: `ACCEPTED OPERATOR CONDITION`

The live provider condition is not marked as formally approved or live-validated. It is accepted for release closure only as an operator condition. The operator remains responsible for validating the approved Foundation provider in the target environment before production use.

## Required Operator Validation

Before production traffic is served, validate:

1. Foundation URL is reachable.
2. JWT issuer and JWKS or public key are valid.
3. Health endpoint returns success.
4. Readiness endpoint returns success.
5. Audit append endpoint accepts the expected contract shape.
6. Policy endpoint returns expected permit and deny responses, if configured.
7. Timeout, retry, and circuit breaker settings behave as expected.

## Foundation Provider Status

ACCEPTED OPERATOR CONDITION.
