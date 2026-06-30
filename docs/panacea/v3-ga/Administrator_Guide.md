# Version 3.0 Administrator Guide

## Scope

This guide finalizes administrator responsibilities for Panacea OS Enterprise Version 3.0 GA.

## Required Administrative Controls

- Identity provider integration.
- RBAC and ABAC policy assignment.
- Tenant isolation configuration.
- PostgreSQL connection secret management.
- Audit retention policy configuration.
- Country and jurisdiction policy configuration.
- Service endpoint configuration through platform config maps.

## GA Validation Checklist

- Confirm package versions are `3.0.0`.
- Confirm OpenAPI bundle is installed.
- Confirm database migration package is installed.
- Confirm Kubernetes manifests or Helm chart values match the target environment.
- Confirm `/live`, `/ready`, `/metrics`, and `/docs/openapi.json` health endpoints.

## Change Control

After GA, changes are limited to approved maintenance releases, hotfixes, and security patches.
