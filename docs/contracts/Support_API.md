# Support API

The Support API supports enterprise support operations for ticket intake, lifecycle, priority, SLA, escalation, assignment, queue, history, and dashboards.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-customer-success/support/tickets` | Support Ticket Registry |
| `POST /api/v3/global-customer-success/support/ticket-lifecycle` | Ticket Lifecycle |
| `POST /api/v3/global-customer-success/support/priorities` | Priority Classification |
| `POST /api/v3/global-customer-success/support/slas` | SLA Management |
| `POST /api/v3/global-customer-success/support/escalations` | Escalation Workflow |
| `POST /api/v3/global-customer-success/support/assignments` | Assignment Workflow |
| `POST /api/v3/global-customer-success/support/queue` | Support Queue |
| `POST /api/v3/global-customer-success/support/history` | Support History |
| `POST /api/v3/global-customer-success/support/dashboard` | Support Dashboard |

Escalation workflows require escalation approval and reference. Resolved ticket lifecycle records require validated resolution evidence.
