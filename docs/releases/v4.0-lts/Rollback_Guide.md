# v4 LTS Rollback Guide

## Strategy

Rollback uses backup and restore unless a future approved migration policy introduces reversible migration scripts.

## Steps

1. Stop traffic.
2. Preserve incident evidence.
3. Restore approved backup.
4. Restore configuration.
5. Restart services.
6. Validate service readiness and audit continuity.
