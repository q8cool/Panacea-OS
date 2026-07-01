# Admin and Operator Demo Guide

The administration and operator areas show Panacea OS as an enterprise operating platform with release evidence, service visibility, user-role visibility, tenant visibility, and API discovery.

## Operator Overview

Open:

```text
http://localhost:5174/#/command/executive-overview
```

The operator view includes:

- Release status.
- Runtime readiness.
- Active service count.
- OpenAPI document count.
- Operational demo board.
- Quick links to role workspaces.
- Demo system health.

## Administration Workspace

Open:

```text
http://localhost:5174/#/workspace/administrator/dashboard
```

Visible demo pages:

- Users.
- Roles.
- Permissions.
- Tenants.
- Organizations.
- Facilities.
- Departments.
- Configuration.
- Audit logs.
- Security.
- Privacy.
- Compliance.
- Release evidence.
- System health.
- API Explorer.
- Documentation Center.

## Operator Checks

Useful checks:

```sh
npm run check
npm run openapi
npm run web:check
```

## Boundary

Administration pages are read-only in this demo. They do not create users, edit tenants, modify permissions, or write production configuration.

