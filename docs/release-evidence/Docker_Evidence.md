# Docker Evidence

Audit date: 2026-06-30
Result: PASS

Docker evidence includes:

- Docker build matrix in `.github/workflows/panacea-ci.yml`.
- Runtime Docker Compose profile at `infra/docker-compose/runtime/docker-compose.yml`.
- Runtime orchestration validation for PostgreSQL plus 9 active services.
- Health checks and clean shutdown evidence.
