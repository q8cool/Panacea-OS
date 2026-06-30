# Runtime Evidence

Audit date: 2026-06-30
Result: PASS

Runtime evidence is provided by:

- `npm run runtime:orchestration`
- `docs/audits/runtime-orchestration/Runtime_Orchestration_Master_Report.md`

Validated runtime behavior:

- PostgreSQL starts and becomes healthy.
- All 9 service containers build and start.
- `/live`, `/ready`, `/metrics`, and `/docs/openapi.json` respond.
- Protected write succeeds.
- RBAC denial returns expected authorization failure.
- Tenant mismatch returns expected authorization failure.
- Audit and event outbox rows are created.
- Services stop cleanly.
