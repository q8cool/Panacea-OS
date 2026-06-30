# Version 3.0 Maintenance Guide

## Maintenance Policy

Version 3.0 GA enters controlled maintenance after release. Changes must be classified as security patch, defect fix, compatibility fix, or approved maintenance update.

## Release Channels

- GA production
- Maintenance patch
- Security hotfix
- Long-term support candidate

## Maintenance Workflow

1. Register issue or patch.
2. Classify severity.
3. Approve maintenance scope.
4. Implement fix on a maintenance branch.
5. Re-run validation gates.
6. Publish release notes.

## Prohibited Maintenance Changes

- Unapproved new business features.
- Unapproved new AI capabilities.
- Autonomous diagnosis or treatment behavior.
