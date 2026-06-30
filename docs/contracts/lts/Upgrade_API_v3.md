# Upgrade API v3

Base path: `/api/v3/lts-maintenance`

The Upgrade API defines upgrade and rollback validation contracts for Version 3.0 LTS.

## Endpoints

- `POST /upgrade/validations`
- `POST /upgrade/schema-compatibility`
- `POST /upgrade/configuration-compatibility`
- `POST /upgrade/data-migration-validation`
- `POST /rollback/validations`

## Events

- `upgrade.validated`
- `rollback.validated`

## Compatibility

Version 3.0 LTS must remain backward compatible with Version 3.0 GA. Validation must cover schemas, APIs, events, configuration, data migration, and rollback.
