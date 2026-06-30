# Release Notes RC1

Release candidate: `v4.0.0-rc1`
Audit date: 2026-06-30

## Included

- Panacea OS Enterprise v4.0 RC1 release evidence package.
- Runtime orchestration validation with Docker Compose and PostgreSQL.
- Disaster recovery mini-drill evidence.
- External Foundation provider configuration wiring.
- Foundation provider contract tests.
- Kubernetes and Docker readiness validation.
- OpenAPI validation evidence.
- Security audit and secret scan evidence.
- Migration rollback waiver.
- Historical Sprint 1-72 evidence waiver.

## Excluded

- New healthcare modules.
- New AI capabilities.
- New clinical workflows.
- New product services.
- Git tag creation.
- Remote CI execution from this local workspace.

## Known Limitations

- Remote CI has not been observed because no Git remote is configured and GitHub CLI is unavailable in this shell.
- Foundation provider wiring is validated locally but not against a real external Foundation endpoint.
- Migration rollback is backup/restore based.
- Sprint 1-72 primary evidence is not present in the active repository.
- RC1 evidence changes must be committed before tagging.

## Accepted Waivers

- Migration rollback waiver: backup/restore strategy accepted for RC1 preparation pending release-board approval.
- Historical evidence waiver: Sprint 1-72 evidence gap accepted for RC1 preparation pending governance approval.

## Runtime Validation Status

Runtime orchestration and disaster recovery mini-drill pass locally.

## Production Readiness Status

RC1 is ready for tag review with conditions. It is not a final production GA decision.

## Required Operator Actions

1. Commit the RC1 evidence package.
2. Configure an approved Git remote.
3. Push the RC1 branch after approval.
4. Capture remote CI workflow evidence.
5. Verify the external Foundation endpoint in the target environment.
6. Approve the migration and historical evidence waivers.
7. Create `v4.0.0-rc1` only after release owner approval.
