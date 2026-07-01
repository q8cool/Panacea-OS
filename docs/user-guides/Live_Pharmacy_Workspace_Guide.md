# Live Pharmacy Workspace Guide

The pharmacy workspace uses read-only medication, queue, inventory, and safety visibility read models.

## Routes

| UI route | Backend read model |
|---|---|
| `#/workspace/pharmacy/dashboard` | `/api/v4/global-command-intelligence/read-models/pharmacy/dashboard` |
| `#/workspace/pharmacy/medication-catalog` | `/api/v4/global-command-intelligence/read-models/pharmacy/medications` |
| `#/workspace/pharmacy/prescription-queue` | `/api/v4/global-command-intelligence/read-models/pharmacy/prescriptions` |
| `#/workspace/pharmacy/prescription-review` | `/api/v4/global-command-intelligence/read-models/pharmacy/prescriptions` |
| `#/workspace/pharmacy/dispensing` | `/api/v4/global-command-intelligence/read-models/pharmacy/dispensing` |
| `#/workspace/pharmacy/inventory` | `/api/v4/global-command-intelligence/read-models/pharmacy/inventory` |
| `#/workspace/pharmacy/batch-lot-tracking` | `/api/v4/global-command-intelligence/read-models/pharmacy/batches` |
| `#/workspace/pharmacy/expiration-tracking` | `/api/v4/global-command-intelligence/read-models/pharmacy/expiration-warnings` |
| `#/workspace/pharmacy/drug-safety-alerts` | `/api/v4/global-command-intelligence/read-models/pharmacy/safety-alerts` |
| `#/workspace/pharmacy/controlled-medications` | `/api/v4/global-command-intelligence/read-models/pharmacy/controlled-medications` |

## Boundary

Sprint 111 does not add medication safety logic or dispensing actions. Live Mode displays approved backend read rows only.
