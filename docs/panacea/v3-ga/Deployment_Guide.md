# Version 3.0 Deployment Guide

## Deployment Modes

Panacea OS Enterprise Version 3.0 supports deployment validation for:

- Single hospital
- Multi-hospital network
- Multi-region
- Multi-country
- Cloud
- On-premise
- Hybrid

## Deployment Package

The production deployment package is stored under `release/v3.0`.

## Required Steps

1. Apply PostgreSQL migrations from `release/v3.0/database`.
2. Load configuration templates from `release/v3.0/templates`.
3. Load secrets templates into the target secret manager.
4. Deploy Kubernetes manifests or Helm chart.
5. Confirm health endpoints.
6. Run smoke tests.
7. Validate rollback and restore.

## Production Gate

Production exposure requires completed deployment, rollback, backup, restore, disaster recovery, service discovery, health check, observability, logging, and secrets validation.
