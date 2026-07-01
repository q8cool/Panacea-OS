# Admin Write Workflows Guide

Administrative writes support governed user, role, tenant, organization, department, and configuration operations.

| Workflow | Endpoint | Event |
|---|---|---|
| Create user | `/api/v4/global-command-intelligence/write-workflows/admin/users` | `user.created` |
| Update user | `/api/v4/global-command-intelligence/write-workflows/admin/users/{userId}` | `user.updated` |
| Assign role | `/api/v4/global-command-intelligence/write-workflows/admin/users/{userId}/roles` | `role.assigned` |
| Create role | `/api/v4/global-command-intelligence/write-workflows/admin/roles` | `role.created` |
| Create tenant | `/api/v4/global-command-intelligence/write-workflows/admin/tenants` | `tenant.created` |
| Create organization | `/api/v4/global-command-intelligence/write-workflows/admin/organizations` | `organization.created` |
| Create department | `/api/v4/global-command-intelligence/write-workflows/admin/departments` | `department.created` |
| Update configuration | `/api/v4/global-command-intelligence/write-workflows/admin/configuration` | `configuration.updated` |

Dangerous deletes, audit disabling, and destructive configuration changes are out of scope.
