# Live Admin Workspace Guide

The administration workspace uses read-only system, identity, compliance, privacy, and release-evidence read models.

## Routes

| UI route | Backend read model |
|---|---|
| `#/workspace/administrator/users` | `/api/v4/global-command-intelligence/read-models/admin/users` |
| `#/workspace/administrator/roles` | `/api/v4/global-command-intelligence/read-models/admin/roles` |
| `#/workspace/administrator/permissions` | `/api/v4/global-command-intelligence/read-models/admin/permissions` |
| `#/workspace/administrator/tenants` | `/api/v4/global-command-intelligence/read-models/admin/tenants` |
| `#/workspace/administrator/organizations` | `/api/v4/global-command-intelligence/read-models/admin/organizations` |
| `#/workspace/administrator/facilities` | `/api/v4/global-command-intelligence/read-models/admin/facilities` |
| `#/workspace/administrator/departments` | `/api/v4/global-command-intelligence/read-models/admin/departments` |
| `#/workspace/administrator/configuration` | `/api/v4/global-command-intelligence/read-models/admin/configuration` |
| `#/workspace/administrator/audit-logs` | `/api/v4/global-command-intelligence/read-models/admin/audit-logs` |
| `#/workspace/administrator/security` | `/api/v4/global-command-intelligence/read-models/admin/security` |
| `#/workspace/administrator/privacy` | `/api/v4/global-command-intelligence/read-models/admin/privacy` |
| `#/workspace/administrator/compliance` | `/api/v4/global-command-intelligence/read-models/admin/compliance` |
| `#/workspace/administrator/release-evidence` | `/api/v4/global-command-intelligence/read-models/admin/release-evidence` |
| `#/workspace/administrator/system-health` | `/api/v4/global-command-intelligence/read-models/admin/system-health` |

## Boundary

The admin workspace does not create, update, or delete users, roles, tenants, policies, or configuration in Sprint 111. All administrative changes still require approved backend workflows.
