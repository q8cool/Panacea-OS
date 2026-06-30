# Version 3.0 Operations Guide

## Operational Scope

Operations teams maintain production deployment, observability, logging, metrics, tracing, backup, restore, rollback, disaster recovery, and incident response for Panacea OS Enterprise Version 3.0.

## Standard Commands

- `npm --prefix <service> run check`
- `npm --prefix <service> test`
- `npm --prefix <service> audit --audit-level=moderate`

## Health Endpoints

Each tracked v3 service exposes:

- `/live`
- `/ready`
- `/metrics`
- `/docs/openapi.json`

## Operational Quality Gates

- Zero critical defects.
- Zero critical security vulnerabilities.
- Successful deployment validation.
- Successful rollback validation.
- Successful backup and restore validation.
- Complete audit and observability coverage.
