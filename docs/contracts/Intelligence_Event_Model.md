# Intelligence Event Model

## Event Envelope

Every event contains:

- `id`
- `tenantId`
- `eventType`
- `aggregateId`
- `aggregateType`
- `actorId`
- `schemaVersion`
- `payload`
- `occurredAt`

## Published Events

- `intelligence.capability.registered`
- `intelligence.policy.created`
- `recommendation.governance.started`
- `recommendation.governance.completed`
- `human.approval.required`
- `unsafe.recommendation.blocked`
- `intelligence.trace.created`
- `governance.audit.generated`

## Event Rules

- Events are persisted before publication.
- Events include tenant, country, policy, governance, and approval context through the aggregate payload.
- Advisory recommendation events are distinct from approved clinical action records.
- Emergency stop and unsafe recommendation events must be auditable.
