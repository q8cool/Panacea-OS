# Waiver Approval Package

Package date: 2026-06-30
Release target: Panacea OS Enterprise v4.0.0

## Approval Summary

No waiver is marked as formally approved in this checkout. The remaining waivers are marked as `ACCEPTED OPERATOR CONDITION` per release closure instruction. This is an operational acceptance record, not a substitute for a signed governance approval.

| Waiver | Reason | Risk level | Mitigation | Release impact | Approval status | Required approver |
|---|---|---|---|---|---|---|
| Foundation external provider condition | Live Foundation provider endpoint is not configured in this shell. Contract wiring, provider validation logic, service configuration, and remote CI checks pass. | Medium | Validate approved Foundation URL, issuer, JWKS or public key, health, readiness, audit append, and policy endpoints in the target environment before production traffic. | Release closure may proceed with operator acceptance; production use still requires live provider validation. | ACCEPTED OPERATOR CONDITION | Platform owner and release board |
| Migration rollback waiver | Service migrations are forward and idempotent; rollback uses backup and restore rather than down migration scripts. | Medium | Maintain tested backups, restore procedure, and disaster recovery drill evidence. `npm run runtime:disaster-recovery` passed locally and in remote CI. | Release closure may proceed with operator acceptance of backup and restore rollback. | ACCEPTED OPERATOR CONDITION | Release board and database owner |
| Historical Sprint 1-72 evidence waiver | Active repository evidence supersedes missing historical sprint artifacts, but archived sprint records remain incomplete. | Low | Retain active repository evidence and continue archive recovery as a records task outside release tagging. | Release closure may proceed with operator acceptance of the historical evidence gap. | ACCEPTED OPERATOR CONDITION | Governance board |
| Remote CI limitation | Remote CI was previously unobserved because authentication was unavailable. | Low | GitHub Actions run `28448921412` was observed and passed on commit `2a4e3b9e53357e21fa1067b8fd5dfe23547f6a85`. | Closed by observed CI evidence. | CLOSED | Release engineering lead |

## Known Limitations

- No live production deployment was executed from this checkout.
- Foundation live provider validation remains an accepted operator condition until target-environment values are configured and tested.
- Waivers are not marked formally approved.

## Approval Rule

Do not mark any waiver as formally approved unless the required approver records explicit approval in the release record.
