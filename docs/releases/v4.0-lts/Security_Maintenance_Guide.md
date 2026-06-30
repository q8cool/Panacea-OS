# v4 LTS Security Maintenance Guide

## Activities

- CVE review
- Dependency audit
- Secret scan
- Certificate expiration review
- Foundation provider configuration review
- RBAC and ABAC policy review
- Tenant isolation validation

## Commands

```bash
npm run audit
npm run quality:gate
```

Use the approved external secret scanner before publishing an LTS maintenance release.
