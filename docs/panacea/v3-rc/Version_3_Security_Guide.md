# Version 3 Security Guide

## Security Baseline

Version 3 RC requires authentication, authorization, RBAC, ABAC, audit, tenant isolation, cross-tenant access prevention, dependency scanning, vulnerability scanning, and secret scanning.

## Executed Checks

- Package audit for every tracked v3 service.
- Authorization and tenant tests in automated test suites.
- Service-level validation of authenticated request requirements.
- OpenAPI declaration of security schemes.
- Kubernetes manifest presence validation.

## Required Operational Controls

- Secrets are supplied through Kubernetes secrets.
- Service endpoints are supplied through config maps.
- PostgreSQL URLs are not hard-coded for production.
- Audit entries are persisted for every governed action.

## RC Finding

All tracked v3 service package audits completed with zero reported moderate-or-higher vulnerabilities.
