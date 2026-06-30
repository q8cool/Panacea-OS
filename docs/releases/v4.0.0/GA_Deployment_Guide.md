# GA Deployment Guide

## Environments

Supported deployment modes for validation planning:

- Single hospital
- Multi-hospital network
- Multi-region
- Multi-country
- Cloud
- On-premise
- Hybrid

## Steps

1. Build approved Docker images.
2. Apply database migrations against a clean PostgreSQL instance.
3. Configure Foundation provider endpoints and JWT verification.
4. Configure tenant, RBAC, ABAC, audit, and event outbox settings.
5. Apply Kubernetes manifests.
6. Verify health, readiness, metrics, and OpenAPI endpoints.
7. Run operational smoke tests and runtime orchestration validation.
8. Confirm backup and restore drill.

## Go-Live Hold Point

Do not proceed to production traffic until release-owner approval and remote CI evidence requirements are satisfied.
