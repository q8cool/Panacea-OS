# Compliance Event Model

Sprint 77 publishes regulatory, compliance, audit, certification, policy, reporting, and remediation events through the PostgreSQL outbox table `global_compliance_events`.

Events:

| Event | Trigger |
| --- | --- |
| `regulation.created` | Regulatory registry record created |
| `regulation.updated` | Regulatory change or impact record updated |
| `compliance.check.completed` | Compliance automation record completed |
| `compliance.gap.detected` | Compliance gap detection record created |
| `audit.created` | Audit plan or audit management record created |
| `audit.completed` | Audit closure workflow completed |
| `certification.expiring` | Certification expiration alert recorded |
| `policy.violation.detected` | Policy violation tracking record detected |
| `regulatory.report.generated` | Regulatory reporting record generated |
| `remediation.completed` | Compliance remediation workflow completed |

Event envelope:

| Field | Description |
| --- | --- |
| `id` | Event identifier |
| `tenantId` | Tenant boundary |
| `eventType` | One of the Sprint 77 event types |
| `aggregateId` | Compliance record identifier |
| `aggregateType` | Record type |
| `actorId` | Authenticated actor |
| `occurredAt` | Event timestamp |
| `schemaVersion` | Event schema version |
| `payload` | Record group, record type, status, country, and compliance traceability references |

Every event is written in the same transaction as the source record and is auditable through `global_compliance_audit_entries`.
