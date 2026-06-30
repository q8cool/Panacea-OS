# Workforce Event Model

Sprint 73 publishes workforce events through the persistent `global_workforce_events` outbox. Each event includes tenant, actor, aggregate, schema version, payload, and occurrence time.

Required events:

| Event | Trigger |
| --- | --- |
| `staff.created` | Staff registry creation |
| `staff.updated` | Staff, employee, HR, planning, or staff experience updates |
| `credential.created` | Provider credential registry creation |
| `credential.verified` | Credential verification workflow completion |
| `credential.expired` | Credential expiration tracking |
| `shift.assigned` | Staff schedule or shift assignment |
| `shift.completed` | Shift completion or attendance tracking |
| `leave.requested` | Leave request workflow |
| `leave.approved` | Approved leave workflow |
| `training.assigned` | Staff training assignment |
| `compliance.updated` | Workforce compliance updates |

Every event is paired with an audit entry. Event payloads intentionally carry references and governance state, not diagnosis, treatment instructions, or autonomous clinical decisions.
