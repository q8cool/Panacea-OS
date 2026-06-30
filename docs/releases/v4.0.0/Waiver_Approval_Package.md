# Waiver Approval Package

Package date: 2026-06-30
Release target: Panacea OS Enterprise v4.0.0

## Approval Summary

No waiver is marked as formally approved in this checkout. The final closure classification is recorded as accepted risk or operator action required.

| Waiver | Reason | Risk level | Mitigation | Release impact | Final status | Required owner |
|---|---|---|---|---|---|---|
| Foundation external provider condition | Live Foundation provider endpoint is not configured in this shell. Contract wiring, provider validation logic, service configuration, and remote CI checks pass. | Medium | Validate approved Foundation URL, issuer, JWKS or public key, health, readiness, audit append, and policy endpoints in the target environment before production traffic. | Blocks unconditional release; does not block release with operator action required. | OPERATOR ACTION REQUIRED | Platform owner and release board |
| Migration rollback backup and restore condition | Service migrations are forward and idempotent; rollback uses backup and restore rather than down migration scripts. | Medium | Maintain tested backups, restore procedure, and disaster recovery drill evidence. `npm run runtime:disaster-recovery` passed locally and in remote CI. | Does not block final release closure. | ACCEPTED RISK | Release board and database owner |
| Historical Sprint 1-72 evidence condition | Active repository evidence supersedes missing historical sprint artifacts, but archived sprint records remain incomplete. | Low | Retain active repository evidence and continue archive recovery as a records task outside release closure. | Does not block final release closure. | ACCEPTED RISK | Governance board |
| Remote CI limitation | Remote CI was previously unobserved because authentication was unavailable. Remote CI is now observed and passing. | Low | Keep remote CI evidence with release records. | Closed by observed CI evidence. | ACCEPTED RISK | Release engineering lead |

## Evidence

- Final waiver closure: `docs/releases/v4.0.0/final-official-release/Formal_Waiver_Closure_Report.md`
- Foundation provider validation: `docs/releases/v4.0.0/final-official-release/Foundation_Live_Provider_Validation_Report.md`
- Final validation rerun: `docs/releases/v4.0.0/final-official-release/Final_Validation_Rerun_Report.md`
- Remote CI rerun: `docs/releases/v4.0.0/final-official-release/Remote_CI_Final_Rerun_Report.md`

## Approval Rule

Do not mark any waiver as formally approved unless the required owner records explicit approval in the release record.
