# Version 3 Deployment Guide

## Release Candidate Deployment Scope

Deploy only validated Version 3 RC artifacts from `release/v3.0-rc`.

## Deployment Inputs

- Service source code under `services/`
- PostgreSQL migrations under each service `migrations/` directory
- OpenAPI specifications under `docs/contracts/openapi/`
- Kubernetes manifests under `infra/kubernetes/`
- Documentation package under `docs/panacea/v3-rc/`

## Required Steps

1. Apply database migrations in service order.
2. Deploy Kubernetes secrets for database URLs.
3. Deploy platform endpoint config maps.
4. Deploy service manifests.
5. Verify `/live`, `/ready`, `/metrics`, and `/docs/openapi.json`.
6. Run rollback rehearsal before production RC exposure.

## Deployment Quality Gate

Production deployment remains gated until environment-specific deployment, backup, restore, and rollback validations are completed by release operations.
