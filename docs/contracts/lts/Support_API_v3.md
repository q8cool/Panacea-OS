# Support API v3

Base path: `/api/v3/lts-maintenance`

The Support API defines support operations for tickets, incidents, problems, changes, support bundles, diagnostics, health snapshots, and environment reports.

## Endpoints

- `POST /support/tickets`
- `POST /support/incidents`
- `POST /support/problems`
- `POST /support/changes`
- `POST /support/bundles`
- `POST /support/diagnostics`
- `POST /support/health-snapshots`
- `POST /support/environment-reports`

## Events

- `support.bundle.generated`
- `global.support.alert.created`

## Auditability

Every support action must persist an audit entry with tenant, actor, country, service, version, evidence, and approval context.
