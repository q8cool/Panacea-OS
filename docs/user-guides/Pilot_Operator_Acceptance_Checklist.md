# Pilot Operator Acceptance Checklist

Status: controlled external pilot operator acceptance checklist
Scope: operator readiness before pilot go-live
Clinical status: not approved for real clinical production use

## System Operations

| Capability | Evidence command | Expected result | Status | Operator sign-off |
|---|---|---|---|---|
| Can start system | `npm run panacea:start` or pilot compose startup command | services start | Pending | |
| Can stop system | `npm run panacea:stop` or pilot compose stop command | services stop cleanly | Pending | |
| Can restart system | `npm run panacea:restart` or pilot compose restart flow | services restart cleanly | Pending | |
| Can inspect status | `npm run panacea:status` | containers listed | Pending | |
| Can inspect logs | `docker compose logs --tail=200` | structured logs visible | Pending | |
| Can run health checks | `npm run panacea:health` | all active services healthy | Pending | |
| Can run pilot health checks | `npm run panacea:pilot:health` | pilot health passes | Pending | |

## Release And CI Acceptance

| Capability | Evidence command or source | Expected result | Status | Operator sign-off |
|---|---|---|---|---|
| Can validate branch | `git branch --show-current` | `develop/v4.0` or approved release branch | Pending | |
| Can validate commit | `git rev-parse --short HEAD` | approved commit | Pending | |
| Can validate CI status | GitHub Actions run URL | successful latest run | Pending | |
| Can validate secret scan status | CI secret scan or Docker gitleaks output | no leaks found | Pending | |
| Can validate OpenAPI status | `npm run openapi` | pass | Pending | |

## Backup, Restore, And Rollback Acceptance

| Capability | Evidence command or source | Expected result | Status | Operator sign-off |
|---|---|---|---|---|
| Can create database backup | approved `pg_dump` command | backup created | Pending | |
| Can store backup safely | operator backup storage record | backup protected | Pending | |
| Can validate restore | approved restore drill | restore succeeds | Pending | |
| Can validate rollback | rollback runbook execution | previous approved version starts | Pending | |
| Can confirm audit/event/projection consistency | approved consistency check | no inconsistency detected | Pending | |

## Security And Data Boundary Acceptance

| Capability | Evidence | Expected result | Status | Operator sign-off |
|---|---|---|---|---|
| Can confirm no real patient data | operator attestation | no real patient data used | Pending | |
| Can confirm live/demo boundary | UI and API mode review | demo actions do not grant production access | Pending | |
| Can confirm `.env.pilot` outside Git | `git status --short --ignored` | environment file not tracked | Pending | |
| Can confirm security checklist complete | `Pilot_Security_Deployment_Checklist.md` | all required items signed | Pending | |
| Can confirm CORS restricted | reverse proxy and env review | approved origins only | Pending | |
| Can confirm firewall restrictions | `sudo ufw status verbose` | only approved ports exposed | Pending | |

## Operator Decision

| Decision item | Status | Required approver | Date |
|---|---|---|---|
| Controlled external pilot may proceed | Pending | Platform owner | |
| Clinical production use remains prohibited | Required | Clinical governance owner | |
| Real patient data remains prohibited without approval | Required | Privacy/legal owner | |
| Rollback plan accepted | Pending | Release owner | |

## Final Acceptance Boundary

This checklist supports controlled pilot operator acceptance only.

Not approved for real clinical production use.
