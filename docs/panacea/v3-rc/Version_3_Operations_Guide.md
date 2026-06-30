# Version 3 Operations Guide

## Operations Scope

Version 3 RC operations cover monitored service health, API readiness, database migration state, audit persistence, event publication state, Kubernetes deployment status, backup readiness, restore readiness, rollback readiness, and documentation completeness.

## Standard Checks

- `npm run check` per service
- `npm test` per service
- `npm audit --audit-level=moderate` per service
- OpenAPI file presence
- Migration file presence
- Kubernetes manifest presence

## Incident Response

Release-candidate issues are classified as release-blocking only when they affect build success, automated tests, security audit, OpenAPI completeness, migrations, deployment, rollback, clinical safety, AI governance, privacy, or interoperability.

## Operational Freeze

No new features or services are allowed during RC stabilization.
