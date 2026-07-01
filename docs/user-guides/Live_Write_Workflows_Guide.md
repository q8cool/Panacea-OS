# Live Write Workflows Guide

Sprint 113 adds governed transactional write workflows to Panacea OS through the existing Real-Time Global Healthcare Command Intelligence service.

## Runtime Boundary

Live writes are available only in authenticated Live Mode. Each browser write uses a versioned endpoint under:

```text
/api/v4/global-command-intelligence/write-workflows/...
```

Every write request must include:

- Foundation-issued authentication.
- Tenant ID.
- Role and permission claims.
- Workflow controls confirming Live Mode, audit, tenant isolation, and human user action.
- `demoData: false`.

The browser allowlist permits only approved Sprint 113 POST endpoints. Unknown writes, dangerous admin actions, autonomous clinical actions, autonomous diagnosis, and autonomous treatment remain blocked.

## Persistence

The backend persists live writes in PostgreSQL:

- `global_command_intelligence_write_workflows`
- `global_command_intelligence_write_workflow_events`
- `global_command_intelligence_write_workflow_projections`

Each accepted workflow also writes an audit entry to:

- `global_command_intelligence_audit_entries`

## Sprint 114 Projection Update

Accepted live write events are now projected into live read models immediately. The write response includes projection summaries, and the operator can review event/projection state at:

```text
http://localhost:5174/#/command/transaction-review
```

Projection review endpoints:

```text
GET  /api/v4/global-command-intelligence/write-workflows/events
GET  /api/v4/global-command-intelligence/write-workflows/projections
GET  /api/v4/global-command-intelligence/write-workflows/projections/{projectionId}
POST /api/v4/global-command-intelligence/write-workflows/projections/{projectionId}/retry
```

Retry is allowed only for failed projections and uses idempotent read-model upsert. It never re-executes diagnosis, treatment, prescribing, or autonomous clinical decisions.

## How To Test

1. Start backend runtime:

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

2. Start the web app:

```sh
npm run web:dev
```

3. Open:

```text
http://localhost:5174/#/auth/login
```

4. Sign in with a Foundation-issued token that contains the correct tenant, role, and permission:

```text
global_command_intelligence.write_workflows.write
```

5. Open a role workspace and use the Transactional Write Workflow panel.
6. Open `#/command/transaction-review` and verify the accepted event, projection target, request ID, correlation ID, and read-model status.

## Demo Mode Boundary

Demo Mode displays:

```text
Demo action only — not persisted to production backend
إجراء تجريبي فقط — لا يتم حفظه في قاعدة الإنتاج
```

Demo actions do not call production APIs.
