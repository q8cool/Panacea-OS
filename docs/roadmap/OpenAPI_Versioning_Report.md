# OpenAPI Versioning Report

Status: completed.

## Finding Reconciled

The Sprint 85 audit reported OpenAPI route versioning as absent because the audit check expected paths to start with `/vN`. The services already use `/api/v3/...` and `/api/v4/...` paths. Sprint 86 added the correct validator and contract tests to enforce this policy.

## Implemented

- Added root OpenAPI validator.
- Added OpenAPI sync from service contracts to `docs/contracts/openapi`.
- Added v4 contract copies for Sprint 84 and Sprint 85 services.
- Added contract tests that reject public paths outside `/api/vN`.

## Result

- OpenAPI documents validated: 26.
- Service OpenAPI documents: 9.
- Public unversioned paths: 0.
