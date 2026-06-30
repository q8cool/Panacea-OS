# Service Management API

The Service Management API supports governed ITIL-style support operations for incidents, problems, changes, service requests, knowledge base, service catalog, root cause analysis, and post-incident review.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-customer-success/service/incidents` | Incident Management |
| `POST /api/v3/global-customer-success/service/problems` | Problem Management |
| `POST /api/v3/global-customer-success/service/changes` | Change Management |
| `POST /api/v3/global-customer-success/service/requests` | Service Request Management |
| `POST /api/v3/global-customer-success/service/knowledge-base` | Knowledge Base |
| `POST /api/v3/global-customer-success/service/catalog` | Service Catalog |
| `POST /api/v3/global-customer-success/service/root-cause-analysis` | Root Cause Analysis |
| `POST /api/v3/global-customer-success/service/post-incident-reviews` | Post-Incident Review |

Sensitive incidents require incident controls, service management authorization, impact assessment, and audit evidence. Incident records publish `incident.created` or `incident.resolved`.
