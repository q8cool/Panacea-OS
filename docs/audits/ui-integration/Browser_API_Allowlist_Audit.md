# Browser API Allowlist Audit

Generated: 2026-07-01T06:07:01.266Z

| Validation item | Status | Evidence |
| --- | --- | --- |
| Every UI live request is checked against allowlist | PASS | `apiRequest` calls `evaluateBrowserApiRequest` before browser transport |
| Unknown endpoints are blocked | PASS | Web tests cover unknown endpoint blocking before fetch |
| Write endpoints are blocked unless explicitly allowed | PASS | Non-GET endpoints are classified as blocked unless operator audit test |
| Clinical action endpoints are blocked | PASS | Clinical terms classify non-GET endpoints as `BLOCKED_CLINICAL_ACTION` |
| Dangerous admin endpoints are blocked | PASS | Admin/governance/release/destructive terms classify as `BLOCKED_ADMIN_DANGEROUS` |
| Operator test endpoints are restricted | PASS | `ALLOWED_OPERATOR_TEST` requires operator role claim |
| Read-only runtime endpoints are allowed | PASS | GET `*/live`, `*/ready`, `*/metrics`, `*/docs/openapi.json` are allowed from OpenAPI |
| Foundation auth endpoints are not generally allowlisted as business APIs | PASS | Auth client uses explicit Foundation login flow, not workspace live-data path |

Allowlist result: PASS. Browser Live Mode remains read-only except for the explicitly scoped operator audit test.
