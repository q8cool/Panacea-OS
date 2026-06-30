# Remaining Work

## Release-Blocking Before Feature Work

- Commit Sprint 86 hardening artifacts after final review.
- Run CI on GitHub and confirm Docker build matrix succeeds in CI.
- Run migration validation against a disposable PostgreSQL instance with `PANACEA_POSTGRES_TEST_URL`.
- Add database-level row security validation where required.
- Decide whether Sprints 1-72 will be restored, rebuilt, or formally archived as external history.
- Add coverage reporting if numeric coverage thresholds become release criteria.

## Non-Blocking Hardening

- Add Helm chart generation for v4 services.
- Add image vulnerability scanning in CI.
- Add Kubernetes dry-run validation with a real cluster schema validator.
- Add SBOM generation for service images.
