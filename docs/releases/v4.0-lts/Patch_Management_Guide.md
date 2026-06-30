# v4 LTS Patch Management Guide

## Patch Rules

- Limit patches to maintenance scope.
- Preserve API compatibility unless release governance approves an exception.
- Preserve database compatibility where possible.
- Record evidence for every patch.

## Patch Flow

1. Register patch request.
2. Classify severity.
3. Implement approved fix.
4. Run quality gate and relevant runtime validation.
5. Update release notes.
6. Tag only after approval.
