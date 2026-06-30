# Command Event Model

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

- `command.center.created`
- `command.event.created`
- `situation.updated`
- `alert.correlated`
- `alert.escalated`
- `crisis.event.created`
- `emergency.coordination.started`
- `command.recommendation.generated`
- `executive.briefing.generated`

## Rules

- Events are persisted before publication.
- Recommendation events are advisory and cannot represent execution.
- Crisis and emergency events require emergency access governance.
- Alert escalation events require approval evidence.
- Event payloads carry tenant, country, region, policy, and governance context.
