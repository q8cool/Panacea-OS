# Maintenance API v3

Base path: `/api/v3/lts-maintenance`

The Maintenance API defines patch, hotfix, maintenance window, and maintenance lifecycle endpoints for Version 3.0 LTS.

## Endpoints

- `POST /patches`
- `POST /patches/approvals`
- `POST /patches/installations`
- `POST /hotfixes`
- `POST /hotfixes/applications`
- `POST /maintenance/windows`
- `POST /maintenance/start`
- `POST /maintenance/complete`

## Events

- `lts.patch.created`
- `lts.patch.approved`
- `lts.patch.installed`
- `hotfix.created`
- `hotfix.applied`
- `maintenance.started`
- `maintenance.completed`

## Security

Maintenance actions must be authenticated, authorized, audited, tenant-isolated, globally policy-controlled, and backward-compatible with Version 3.0 GA.
