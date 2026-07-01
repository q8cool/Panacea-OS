# Transaction Review Guide

Sprint 114 adds an operator review surface for live write workflow events and read-model projections.

## Route

```text
http://localhost:5174/#/command/transaction-review
```

## Purpose

The page shows:

- Recent accepted live write workflow events.
- Event type, actor, tenant, request ID, correlation ID, and timestamp.
- Projection targets created from each event.
- Projection status: `pending`, `projected`, `failed`, `skipped`, or `replayed`.
- Failure reason and retry count when available.

The page is review-oriented. It does not create clinical decisions, diagnosis, treatment, prescribing, or autonomous workflow execution.

## Required Access

Use Live Mode with a Foundation-issued token containing:

```text
global_command_intelligence.write_workflows.read
```

Safe retry of failed projections also requires:

```text
global_command_intelligence.write_workflows.retry
```

Operator or administrator role claims are required for review and retry.

## API Endpoints

```text
GET  /api/v4/global-command-intelligence/write-workflows/events
GET  /api/v4/global-command-intelligence/write-workflows/projections
GET  /api/v4/global-command-intelligence/write-workflows/projections/{projectionId}
POST /api/v4/global-command-intelligence/write-workflows/projections/{projectionId}/retry
```

## How To Test

1. Sign in through `#/auth/login`.
2. Submit an approved live write from any role workspace.
3. Open `#/command/transaction-review`.
4. Select **Refresh Transactions**.
5. Confirm the event and projection rows show the same request and correlation IDs.

Retry appears only for failed projections. The retry endpoint upserts the stored read-model payload and never re-executes clinical logic.
