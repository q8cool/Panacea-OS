# Projection Retry Guide

Projection retry is intentionally narrow and operator controlled.

## When Retry Is Allowed

Retry is allowed only when:

- The projection exists in the same tenant.
- The projection status is `failed`.
- The actor has operator or administrator role.
- The actor has `global_command_intelligence.write_workflows.retry`.

## What Retry Does

Retry replays the stored projection payload into the read-model table using idempotent upsert behavior.

It updates the projection row to:

```text
projection_status = replayed
retry_count = retry_count + 1
failure_reason = null
```

## What Retry Never Does

Retry does not:

- Re-execute the original write workflow.
- Duplicate clinical records.
- Execute diagnosis.
- Execute treatment.
- Execute prescribing.
- Bypass clinician or governance approval.

## API

```text
POST /api/v4/global-command-intelligence/write-workflows/projections/{projectionId}/retry
```

Use it only from the Transaction Review page or an operator-controlled tool with valid Foundation authentication.
