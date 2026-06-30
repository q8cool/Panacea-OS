# GA Security Guide

## Required Controls

- Authentication through configured Foundation provider.
- RBAC and ABAC checks before protected actions.
- Tenant isolation on service data.
- Audit append on write operations.
- Secret material outside source control.
- Secure transport for provider and service communication.

## Validation

Run:

```bash
npm run audit
npm run quality:gate
```

Also run the approved external secret scanner before tag approval.
