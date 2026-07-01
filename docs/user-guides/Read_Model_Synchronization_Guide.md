# Read Model Synchronization Guide

Sprint 114 closes the visibility gap between live writes and role workspaces.

## What Changed

Accepted write workflow events now create or update read-model rows in:

```text
global_command_intelligence_read_models
```

The web UI reads those models through:

```text
/api/v4/global-command-intelligence/read-models/...
```

## Synchronization Rules

- Projection preserves tenant scope.
- Projection preserves actor, request ID, and correlation ID.
- Projection payloads include `source: live-write-projection`.
- Projection payloads include `demoData: false` through the live read-model contract.
- Projection uses deterministic IDs for replay safety.
- Existing rows are updated through upsert behavior.

## Operator Verification

After submitting a live write:

1. Check the write confirmation panel for **Projection Status**.
2. Open `#/command/transaction-review`.
3. Confirm a projection row exists for the event.
4. Return to the relevant role workspace and refresh the live read model.

In Live Mode, demo rows are never mixed into the backend read-model view.
