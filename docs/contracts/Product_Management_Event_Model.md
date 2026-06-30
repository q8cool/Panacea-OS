# Product Management Event Model

Sprint 76 publishes product, roadmap, innovation, requirements, feedback, and release governance events through the PostgreSQL outbox table `global_product_management_events`.

Events:

| Event | Trigger |
| --- | --- |
| `product.created` | Product registry record created |
| `feature.created` | Feature registry record created |
| `feature.approved` | Feature lifecycle or feature status tracking record approved |
| `requirement.created` | Requirements management record created |
| `roadmap.updated` | Roadmap management record created or updated |
| `milestone.completed` | Milestone planning record completed |
| `innovation.idea.submitted` | Innovation idea registry record submitted |
| `innovation.approved` | Innovation approval workflow record approved |
| `feedback.received` | Product feedback record received |
| `release.approved` | Release governance record approved |

Event envelope:

| Field | Description |
| --- | --- |
| `id` | Event identifier |
| `tenantId` | Tenant boundary |
| `eventType` | One of the Sprint 76 event types |
| `aggregateId` | Product management record identifier |
| `aggregateType` | Record type |
| `actorId` | Authenticated actor |
| `occurredAt` | Event timestamp |
| `schemaVersion` | Event schema version |
| `payload` | Record group, record type, status, country, and traceability references |

Every event is written in the same transaction as the source record and is auditable through `global_product_management_audit_entries`.
