# Foundation Runtime Assumption Register

Audit date: 2026-06-30
Decision: PASS WITH CONDITIONS

| Assumption | Status | Risk | Required production evidence |
|---|---|---|---|
| Foundation is deployed outside the active repository | Accepted | Medium | Approved Foundation endpoint and ownership record. |
| Foundation validates JWT signatures before service access | Accepted | Medium | JWKS configuration and signature validation evidence. |
| Foundation propagates tenant, actor, role, permission, and country context | Validated by contract harness | Low | Gateway or service mesh propagation proof. |
| Central audit service accepts append-only audit events | Validated locally through service audit persistence | Medium | Central audit endpoint integration evidence. |
| RBAC and ABAC policy results match local service expectations | Validated by contract harness | Low | Policy engine test output from Foundation. |
| Service discovery resolves Foundation consistently in Kubernetes | Not observed locally | Medium | Kubernetes service or mesh route evidence. |
| Foundation health endpoints are monitored by operations tooling | Not observed locally | Low | Monitoring dashboard or probe output. |
| Foundation outage handling is governed by release policy | Documented, not exercised | Medium | Resilience test and incident runbook. |

## Approval Implication

Sprint 90 evidence supports release preparation, not production go-live. The real Foundation runtime must be wired and verified before a production approval vote.
