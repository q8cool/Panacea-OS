# Runtime Security Report

Audit date: 2026-06-30

## Decision

PASS.

## Runtime Security Checks

| Check | Result |
|---|---|
| Unauthenticated protected request | PASS, HTTP `401` |
| Unauthorized protected request | PASS, HTTP `403` |
| Tenant mismatch request | PASS, HTTP `403` |
| Protected tenant-scoped request | PASS, HTTP `201` |
| Audit append enforcement | PASS |
| Event outbox append enforcement | PASS |
| Sensitive environment values absent from service logs | PASS |
| Structured JSON lifecycle logs | PASS |
| External secret scan | PASS |

## External Secret Scan

Command:

`docker run --rm -v "$PWD:/src:ro" zricethezav/gitleaks:latest detect --source /src --no-git --redact --exit-code 1`

Result:

- Scanned approximately 4.15 MB.
- No leaks found.

## Notes

Runtime validation exercised the existing service header authenticator and authorization checks. Full identity-provider integration remains dependent on a live external Foundation Platform runtime.
