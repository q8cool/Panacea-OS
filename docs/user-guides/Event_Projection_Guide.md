# Event Projection Guide

Sprint 114 projects accepted live write workflow events into Panacea OS read models.

## Projection Boundary

Projection is a deterministic synchronization step:

```text
accepted write workflow -> write workflow event -> projection tracking -> read model upsert
```

It does not perform diagnosis, treatment, prescribing, clinical reasoning, AI expansion, or autonomous execution.

## Projection Tracking

Projection state is stored in PostgreSQL:

```text
global_command_intelligence_write_workflow_projections
```

Each row includes:

- `event_id`
- `event_type`
- `tenant_id`
- `projection_target`
- `projection_status`
- `processed_at`
- `failure_reason`
- `retry_count`
- `correlation_id`
- `request_id`
- `actor_id`

The uniqueness rule is:

```text
tenant_id + event_id + projection_target
```

This makes projection replay idempotent.

## Event Coverage

Sprint 113 write events project into the existing read-model workspaces:

- Clinical events update clinical patient, timeline, medication, allergy, condition, vitals, notes, encounter, alert, order, lab, radiology, and pharmacy-review models.
- Laboratory events update laboratory orders, specimens, results, critical results, and patient clinical order/lab/alert views.
- Radiology events update radiology orders, studies, reports, critical findings, timelines, and patient clinical radiology/alert views.
- Pharmacy events update pharmacy prescriptions, dispensing, inventory, safety alerts, and clinical pharmacy-review views.
- Scheduling events update patient portal appointments/visits and clinical encounter/order views.
- Administration events update admin users, roles, tenants, organizations, departments, and configuration models.
- Patient portal requests update patient messages, appointments, documents, medications, and pharmacy queues where applicable.

## Status Values

```text
pending
projected
failed
skipped
replayed
```

Normal accepted writes are projected immediately in the same transactional persistence path.
