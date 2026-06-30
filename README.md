# Panacea OS Enterprise

Panacea OS Enterprise is a governed healthcare operating system workspace. This repository contains Panacea-owned services, contracts, migrations, deployment manifests, release packages, tests, and sprint reports.

## Repository Status

- Current active branch: `develop/v4.0`
- Latest implemented sprint in this checkout: Sprint 85
- Current hardening sprint: Sprint 86
- Latest release tags present: `v3.0.0`, `v3.0.1-LTS`

## Root Quality Gates

The root package is dependency-free and orchestrates all tracked Panacea services.

```bash
npm run typecheck
npm run build
npm run check
npm run test:run
npm run test:unit
npm run test:integration
npm run test:contract
npm run openapi
npm run audit
npm run quality:gate
```

## Workspace Rules

- Keep unrelated experiments, generated state, and non-Panacea projects outside this repository.
- Keep all Panacea artifacts tracked.
- Keep OpenAPI paths versioned under `/api/v...`.
- Keep service persistence PostgreSQL-backed.
- Keep clinical and intelligence workflows governed, advisory, explainable, and auditable.
