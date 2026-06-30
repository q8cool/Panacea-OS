# Admin Console Guide

## Purpose

The Administration Workspace connects visually with the existing operator dashboard and helps administrators understand system configuration, identity, access, audit, security, privacy, compliance, release state, health, APIs, and documentation.

## Open

```text
http://localhost:5174/#/workspace/administrator/dashboard
```

Or use **Demo Role Switcher** and select **Administrator**.

## Pages

- Admin Dashboard.
- Users.
- Roles.
- Permissions.
- Tenants.
- Organizations.
- Facilities.
- Departments.
- Configuration.
- Audit Logs.
- Security.
- Privacy.
- Compliance.
- Release Evidence.
- System Health.
- API Explorer.
- Documentation Center.

## Data Mode

The admin console is read-only demo/operator mode using:

- Active service OpenAPI documents.
- Foundation Provider status.
- Release evidence.
- Security and compliance documentation.
- Runtime service inventory.

## Production Boundary

The Demo Role Switcher does not bypass real security in production.

Administrative write workflows require live admin APIs, Foundation authentication, RBAC, ABAC, tenant isolation, audit logging, and operator approval.

## What Requires Live Data

- Users.
- Roles.
- Permissions.
- Tenant records.
- Organization records.
- Facility records.
- Configuration writes.
- Audit-log drill-through.
- Security policy updates.
