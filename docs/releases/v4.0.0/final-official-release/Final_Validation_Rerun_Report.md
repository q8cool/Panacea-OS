# Final Validation Rerun Report

Report date: 2026-06-30
Branch: `develop/v4.0`

## Local Validation Results

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run check` | PASS |
| `npm run test:run` | PASS, 117 passed and 0 failed |
| `npm run openapi` | PASS, 26 OpenAPI documents validated |
| `npm run audit` | PASS, 0 moderate vulnerabilities |
| `npm run quality:gate` | PASS |
| `npm run runtime:orchestration` | PASS |
| `npm run runtime:disaster-recovery` | PASS |
| Secret scan | PASS, Dockerized gitleaks scanned 4.33 MB and found no leaks |

## Runtime Evidence

- Runtime orchestration validated 9 active services.
- Health, readiness, metrics, OpenAPI exposure, protected writes, audit writes, event outbox writes, expected security denials, structured logs, and clean exits passed.
- Disaster recovery validated forward migrations, idempotency, backup, restore, indexes, audit records, and event outbox tables.

## Decision

PASS. Final validation passed before final official release report generation.
