# Pilot Go-Live Checklist

Date: 2026-07-01
Scope: Controlled external pilot go-live preparation

This checklist must be completed before pilot access is opened. It does not approve real clinical production use.

## Release Evidence

- [ ] GitHub Actions PASS.
- [ ] Gitleaks PASS.
- [ ] Build validation PASS.
- [ ] OpenAPI validation PASS.
- [ ] Runtime orchestration PASS.
- [ ] Deployment verification PASS.

## Environment

- [ ] `.env.pilot` created outside Git.
- [ ] `.env.pilot` is not tracked by Git.
- [ ] No real secrets are committed to Git.
- [ ] JWT issuer configured.
- [ ] JWT audience configured.
- [ ] Foundation Provider URLs configured.
- [ ] Database password replaced with an approved secret outside Git.

## Runtime Health

- [ ] Docker services healthy.
- [ ] PostgreSQL healthy.
- [ ] Live endpoints return HTTP 200.
- [ ] Ready endpoints return HTTP 200.
- [ ] Metrics endpoints return HTTP 200.
- [ ] OpenAPI endpoints return HTTP 200.
- [ ] Health matrix completed.

## HTTPS And Browser Access

- [ ] HTTPS configured.
- [ ] Web domain resolves.
- [ ] API domain resolves.
- [ ] CORS restricted to approved origins.
- [ ] Reverse proxy reload validated.
- [ ] Browser can load Panacea web UI over HTTPS.

## Data And Safety

- [ ] Backup tested.
- [ ] Restore tested.
- [ ] Demo and Live Mode separation verified.
- [ ] Tenant isolation tested.
- [ ] Role isolation tested.
- [ ] Audit/event behavior verified.
- [ ] No real patient data loaded before legal, clinical, privacy, security, and operator approval.

## Operations

- [ ] Deployment operator assigned.
- [ ] Rollback plan approved.
- [ ] Support contact assigned.
- [ ] Incident reporting path approved.
- [ ] Monitoring recommended or configured.

## Final Statement

Ready for controlled external pilot go-live preparation.
Not approved for real clinical production use.
