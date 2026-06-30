# Foundation Provider Configuration Guide

Audit date: 2026-06-30

## Required Variables

| Variable | Purpose |
|---|---|
| `PANACEA_FOUNDATION_URL` | External Foundation base URL. |
| `PANACEA_FOUNDATION_JWT_ISSUER` | Accepted Foundation JWT issuer. |
| `PANACEA_FOUNDATION_JWKS_URL` | Foundation JWKS URL. |
| `PANACEA_FOUNDATION_JWT_PUBLIC_KEY` | Alternative to JWKS URL when static public key validation is required. |
| `PANACEA_FOUNDATION_AUDIT_APPEND_PATH` | Audit append endpoint path. |
| `PANACEA_FOUNDATION_POLICY_EVALUATION_PATH` | Policy evaluation endpoint path. |
| `PANACEA_FOUNDATION_HEALTH_PATH` | Foundation health endpoint path. |
| `PANACEA_FOUNDATION_READY_PATH` | Foundation readiness endpoint path. |
| `PANACEA_FOUNDATION_METRICS_PATH` | Foundation metrics endpoint path. |
| `PANACEA_FOUNDATION_TIMEOUT_MS` | Provider call timeout in milliseconds. |
| `PANACEA_FOUNDATION_RETRY_ATTEMPTS` | Retry attempts for transient provider failures. |
| `PANACEA_FOUNDATION_RETRY_BACKOFF_MS` | Delay between retries in milliseconds. |
| `PANACEA_FOUNDATION_CIRCUIT_BREAKER_FAILURE_THRESHOLD` | Failures before circuit opens. |
| `PANACEA_FOUNDATION_CIRCUIT_BREAKER_RESET_MS` | Circuit reset window in milliseconds. |

## Docker Compose

Runtime Compose uses a shared `x-foundation-provider-env` block and applies it to every active service.

## Kubernetes

Each active service ConfigMap under `infra/kubernetes/` includes the required Foundation provider variables.

## Validation

Run:

```sh
node scripts/validate-foundation-provider.mjs
```

The command validates sample provider config, Docker Compose provider keys, and Kubernetes provider keys for all active services.

## Production Notes

Use the approved Foundation URL, issuer, JWKS URL or public key, endpoint paths, timeout settings, retry settings, and circuit breaker policy for the deployment environment. Do not embed secrets in ConfigMaps.
