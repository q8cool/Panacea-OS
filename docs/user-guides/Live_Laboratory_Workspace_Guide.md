# Live Laboratory Workspace Guide

The laboratory workspace uses tenant-scoped operational read models.

## Routes

| UI route | Backend read model |
|---|---|
| `#/workspace/laboratory/dashboard` | `/api/v4/global-command-intelligence/read-models/laboratory/dashboard` |
| `#/workspace/laboratory/lab-orders` | `/api/v4/global-command-intelligence/read-models/laboratory/orders` |
| `#/workspace/laboratory/specimen-tracking` | `/api/v4/global-command-intelligence/read-models/laboratory/specimens` |
| `#/workspace/laboratory/result-entry` | `/api/v4/global-command-intelligence/read-models/laboratory/results` |
| `#/workspace/laboratory/critical-results` | `/api/v4/global-command-intelligence/read-models/laboratory/critical-results` |
| `#/workspace/laboratory/quality-control` | `/api/v4/global-command-intelligence/read-models/laboratory/quality-control` |
| `#/workspace/laboratory/lab-reports` | `/api/v4/global-command-intelligence/read-models/laboratory/reports` |

## Boundary

Live laboratory routes are read-only. Result entry and approval pages remain visual read surfaces until approved write workflows exist.
