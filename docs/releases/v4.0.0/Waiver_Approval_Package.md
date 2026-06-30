# Waiver Approval Package

Package date: 2026-06-30
Release target: Panacea OS Enterprise v4.0.0

## Approval Summary

No waiver is marked as formally approved in this checkout. Every waiver below remains `PENDING APPROVAL` until the named approver records acceptance.

| Waiver | Reason | Risk level | Mitigation | Release impact | Approval status | Required approver |
|---|---|---|---|---|---|---|
| Foundation external provider condition | Live Foundation provider endpoint is not configured in this shell. Contract wiring and configuration tests pass locally. | Medium | Validate approved Foundation URL, issuer, JWKS or public key, health, readiness, audit append, and policy endpoints in target environment. | GA tagging should wait or release governance must accept the condition. | PENDING APPROVAL | Platform owner and release board |
| Migration rollback waiver | Service migrations are forward and idempotent; rollback uses backup and restore rather than down migration scripts. | Medium | Maintain tested backups, restore procedure, and disaster recovery drill evidence. | Release can proceed only if release board accepts backup and restore rollback. | PENDING APPROVAL | Release board and database owner |
| Historical Sprint 1-72 evidence waiver | Active repository evidence supersedes missing historical sprint artifacts, but archived sprint records remain incomplete. | Low | Retain active repository evidence and continue archive recovery as a records task. | Release can proceed if governance accepts the historical evidence gap. | PENDING APPROVAL | Governance board |
| Remote CI limitation | No remote is configured, so GitHub Actions or equivalent remote CI cannot be observed from this checkout. | Medium | Configure official remote, push release branch, capture workflow URL and result. | Tags should wait unless release governance accepts local evidence as sufficient. | PENDING APPROVAL | Release engineering lead |

## Known Limitations

- Existing local validation passed before this package was generated; final post-package validation is recorded separately.
- No production deployment was executed from this checkout.
- No official remote repository was configured.

## Approval Rule

Do not mark any waiver as approved unless the required approver records explicit acceptance in the release record.
