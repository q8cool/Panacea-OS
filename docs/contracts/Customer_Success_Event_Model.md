# Customer Success Event Model

Sprint 75 publishes events through the `global_customer_success_events` outbox. Every event includes tenant, actor, aggregate, payload, schema version, and occurrence time.

Required events:

| Event | Trigger |
| --- | --- |
| `customer.created` | Customer registry creation |
| `customer.health.updated` | Customer health, success, adoption, engagement, dashboard, and analytics updates |
| `support.ticket.created` | Support ticket registry creation |
| `support.ticket.escalated` | Escalation workflow |
| `support.ticket.resolved` | Resolved ticket lifecycle |
| `incident.created` | Incident management creation |
| `incident.resolved` | Post-incident review or resolved incident |
| `service.request.created` | Service request management creation |
| `onboarding.started` | Customer onboarding workflow start |
| `onboarding.completed` | Customer onboarding workflow completion |
| `customer.feedback.received` | Customer feedback intake |

Events record governed service activity only. They do not authorize diagnosis, treatment recommendations, or autonomous clinical decisions.
