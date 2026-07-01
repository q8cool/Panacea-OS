# Pilot Security Deployment Checklist

Date: 2026-07-01
Scope: External controlled pilot security readiness

This checklist must be completed before external pilot access. It does not approve real clinical production use.

## Secrets

- [ ] No real secrets are committed to Git.
- [ ] `.env.pilot.local` exists only on the deployment host or approved secret store.
- [ ] `POSTGRES_PASSWORD` is changed from any template value.
- [ ] JWT issuer, audience, and JWKS settings point to the approved Foundation Provider.
- [ ] TLS private keys are stored outside the repository.

## HTTPS And Network

- [ ] HTTPS is enabled for the web domain.
- [ ] HTTPS is enabled for the API domain.
- [ ] HTTP redirects to HTTPS.
- [ ] PostgreSQL is not exposed to the public internet.
- [ ] SSH is restricted to VPN or approved operator IP ranges.
- [ ] Firewall allows only required inbound ports.

## Browser And API Security

- [ ] CORS is restricted to approved pilot origins.
- [ ] API routes remain under `/api/v...`.
- [ ] OpenAPI endpoints are intentionally exposed for pilot validation.
- [ ] Metrics endpoints are reviewed for sensitive data exposure.
- [ ] Reverse proxy request size limits are configured.
- [ ] Proxy timeout settings are explicit.

## Identity And Access

- [ ] JWT issuer is configured.
- [ ] JWT audience is configured.
- [ ] Tenant isolation is tested.
- [ ] Role isolation is tested.
- [ ] ABAC policy behavior is tested where applicable.
- [ ] Audit append behavior is tested with safe pilot events.

## Data And Operations

- [ ] Backups are enabled.
- [ ] Restore rehearsal is completed.
- [ ] Disaster recovery mini-drill passes.
- [ ] Audit logging is enabled.
- [ ] Demo and Live Mode separation is verified.
- [ ] No real patient data is loaded until legal, privacy, clinical, and security approval.
- [ ] External penetration test is recommended before real production.

## Final Gate

External controlled pilot may proceed only when all required checks are complete and the deployment owner accepts any documented residual risk.
