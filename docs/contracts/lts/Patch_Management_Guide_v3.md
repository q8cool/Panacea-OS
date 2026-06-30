# Patch Management Guide v3

## Patch Lifecycle

1. Create patch.
2. Classify severity.
3. Attach impact and compatibility evidence.
4. Review security and privacy implications.
5. Run automated checks.
6. Approve patch.
7. Install patch.
8. Publish audit and event records.

## Emergency Patches

Emergency patches require expedited approval, security review, rollback plan, audit evidence, and post-installation validation.

## Required Events

- `lts.patch.created`
- `lts.patch.approved`
- `lts.patch.installed`
- `hotfix.created`
- `hotfix.applied`
