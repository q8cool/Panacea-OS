# Version 3 Administrator Guide

## Administrative Responsibilities

Administrators manage environment configuration, tenant boundaries, service deployment, identity provider integration, PostgreSQL connectivity, audit retention, and release-candidate evidence packages.

## Required Configuration

- Service endpoint configuration through platform config maps.
- PostgreSQL connection strings through secrets.
- Identity, RBAC, ABAC, tenant isolation, and audit headers.
- Country and jurisdiction policies for global services.
- Notification and audit service endpoints.

## Administrative Validation

Before RC promotion, administrators must confirm:

- All services pass `npm run check`.
- All service tests pass.
- All package audits report zero moderate-or-higher vulnerabilities.
- OpenAPI specs are present for every tracked service.
- Kubernetes manifests are present and non-empty.
- Database migrations are present for every tracked service.

## Change Freeze

No feature changes are permitted on the RC branch. Only release-blocking defect fixes may be considered after governance review.
