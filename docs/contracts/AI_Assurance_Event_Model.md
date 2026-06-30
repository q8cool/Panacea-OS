# AI Assurance Event Model

Sprint 78 publishes AI assurance, model risk, prompt, agent, safety, incident, and regulatory governance events through the PostgreSQL outbox table `global_ai_assurance_events`.

Events:

| Event | Trigger |
| --- | --- |
| `ai.assurance.review.created` | AI assurance review or general assurance record created |
| `ai.risk.classified` | AI risk classification record created |
| `model.validation.started` | Model validation workflow started |
| `model.validation.completed` | Model validation workflow completed |
| `model.approved` | Model approval workflow approved |
| `model.rejected` | Model approval workflow rejected |
| `prompt.approved` | Prompt approval workflow approved |
| `agent.approved` | Agent runtime approval completed |
| `ai.safety.test.completed` | Safety test record completed or validated |
| `ai.incident.created` | AI incident record created |
| `ai.incident.closed` | AI incident closure approved |
| `ai.audit.package.generated` | AI audit package generated |

Event envelope:

| Field | Description |
| --- | --- |
| `id` | Event identifier |
| `tenantId` | Tenant boundary |
| `eventType` | One of the Sprint 78 event types |
| `aggregateId` | AI assurance record identifier |
| `aggregateType` | Record type |
| `actorId` | Authenticated actor |
| `occurredAt` | Event timestamp |
| `schemaVersion` | Event schema version |
| `payload` | Record group, record type, status, country, and AI assurance traceability references |

Every event is written in the same transaction as the source record and is auditable through `global_ai_assurance_audit_entries`.
