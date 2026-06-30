# Version 3.0 Disaster Recovery Guide

## Scope

Disaster recovery covers backup, restore, rollback, database migrations, configuration, secrets, Kubernetes deployment, and service discovery.

## Required Procedures

- Scheduled PostgreSQL backups.
- Point-in-time recovery where supported.
- Restore validation in a non-production environment.
- Rollback rehearsal before production cutover.
- Configuration and secret recovery validation.
- Health checks after recovery.

## GA Package

Backup, restore, and rollback scripts are stored under `release/v3.0/scripts`.
