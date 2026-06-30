# Known Issues RC1

Audit date: 2026-06-30

| Issue | Severity | Status | Mitigation |
|---|---|---|---|
| Release evidence changes are not committed | High | Open | Commit the current RC1 evidence package before tagging. |
| Remote CI run not captured | Medium | Open | Configure approved remote and capture workflow URL. |
| Foundation provider not verified against real endpoint | Medium | Open | Run provider validation in target environment. |
| Down migrations are not present | Medium | Waived for RC1 | Use backup/restore rollback strategy. |
| Sprint 1-72 evidence missing | Medium | Waived for RC1 | Approve governance waiver or recover external archive later. |

## Release Impact

These issues do not prevent RC1 preparation if accepted by release governance, but they must remain visible in the RC package.
