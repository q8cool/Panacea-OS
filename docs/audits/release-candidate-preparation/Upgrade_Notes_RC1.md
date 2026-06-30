# Upgrade Notes RC1

Audit date: 2026-06-30

## Upgrade Scope

RC1 is an evidence and readiness package for Panacea OS Enterprise v4.0. It does not introduce new product features.

## Database

- Apply active migrations in deterministic order.
- Migrations are idempotent forward migrations.
- Take a verified backup before migration execution.
- Rollback uses backup/restore.

## Configuration

Set Foundation provider variables for target environments:

- `PANACEA_FOUNDATION_URL`
- `PANACEA_FOUNDATION_JWT_ISSUER`
- `PANACEA_FOUNDATION_JWKS_URL` or `PANACEA_FOUNDATION_JWT_PUBLIC_KEY`
- `PANACEA_FOUNDATION_AUDIT_APPEND_PATH`
- `PANACEA_FOUNDATION_POLICY_EVALUATION_PATH`
- `PANACEA_FOUNDATION_HEALTH_PATH`
- `PANACEA_FOUNDATION_READY_PATH`
- `PANACEA_FOUNDATION_METRICS_PATH`
- `PANACEA_FOUNDATION_TIMEOUT_MS`
- `PANACEA_FOUNDATION_RETRY_ATTEMPTS`
- `PANACEA_FOUNDATION_RETRY_BACKOFF_MS`
- `PANACEA_FOUNDATION_CIRCUIT_BREAKER_FAILURE_THRESHOLD`
- `PANACEA_FOUNDATION_CIRCUIT_BREAKER_RESET_MS`

## Validation

Run all quality gates, runtime orchestration, disaster recovery, and secret scanning before promoting the release candidate.
