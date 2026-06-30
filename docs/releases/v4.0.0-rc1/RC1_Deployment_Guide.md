# RC1 Deployment Guide

## Prerequisites

- Docker runtime available.
- PostgreSQL available for service metadata.
- Foundation provider endpoint configured.
- JWT issuer and key material configured.
- Tenant, RBAC, ABAC, and audit policies configured.

## Deployment Flow

1. Build service images from the active service Dockerfiles.
2. Apply PostgreSQL migrations in service order.
3. Configure Foundation provider environment variables.
4. Apply Kubernetes manifests from `infra/kubernetes/`.
5. Verify health, readiness, metrics, and OpenAPI endpoints.
6. Run `npm run runtime:orchestration`.
7. Run `npm run runtime:disaster-recovery`.

## Rollback

Use backup and restore evidence from the disaster recovery drill. Down migration scripts are not part of this RC package.
