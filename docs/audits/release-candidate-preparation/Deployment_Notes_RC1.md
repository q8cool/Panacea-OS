# Deployment Notes RC1

Audit date: 2026-06-30

## Deployment Readiness

RC1 deployment readiness is validated locally through Docker Compose, PostgreSQL, Docker readiness checks, Kubernetes manifest checks, OpenAPI validation, and quality gates.

## Required Environment

- Node.js 22 or later for repository validation.
- Docker runtime for Compose and secret scan validation.
- PostgreSQL runtime for live migration and DR drills.
- Approved external Foundation provider endpoint for target environment validation.

## Deployment Flow

1. Commit RC1 evidence changes.
2. Run local quality gates.
3. Push to approved remote.
4. Capture remote CI run.
5. Apply database migrations to a clean test environment.
6. Run runtime orchestration.
7. Run disaster recovery drill.
8. Verify Foundation provider endpoint configuration.
9. Approve waivers.
10. Create RC1 tag only after explicit approval.

## Rollback

Rollback is backup/restore based for RC1.
