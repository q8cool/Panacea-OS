# CI Evidence

Audit date: 2026-06-30
Result: PASS WITH CONDITIONS

CI workflow evidence:

- `.github/workflows/panacea-ci.yml`
- Typecheck job.
- Build job.
- Tests job.
- OpenAPI job.
- Dependency audit job.
- Forbidden marker scan job.
- External secret scan job.
- Docker build matrix job.
- Kubernetes validation job.
- Live infrastructure validation job.

Condition:

- Remote GitHub Actions was not observed because no Git remote is configured and GitHub CLI is not available or authenticated in this shell.
