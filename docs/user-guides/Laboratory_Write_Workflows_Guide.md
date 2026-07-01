# Laboratory Write Workflows Guide

Laboratory Live Mode supports order, specimen, result, approval, and critical-result write workflows.

| Workflow | Endpoint | Event |
|---|---|---|
| Create lab order | `/api/v4/global-command-intelligence/write-workflows/laboratory/orders` | `lab.order.created` |
| Collect specimen | `/api/v4/global-command-intelligence/write-workflows/laboratory/specimens/{specimenId}/collect` | `specimen.collected` |
| Receive specimen | `/api/v4/global-command-intelligence/write-workflows/laboratory/specimens/{specimenId}/receive` | `specimen.received` |
| Enter result | `/api/v4/global-command-intelligence/write-workflows/laboratory/results` | `lab.result.entered` |
| Validate result | `/api/v4/global-command-intelligence/write-workflows/laboratory/results/{resultId}/validate` | `lab.result.validated` |
| Approve result | `/api/v4/global-command-intelligence/write-workflows/laboratory/results/{resultId}/approve` | `lab.result.approved` |
| Flag critical result | `/api/v4/global-command-intelligence/write-workflows/laboratory/results/{resultId}/critical` | `critical.lab.result.flagged` |

All writes require Live Mode, tenant scope, audit controls, and laboratory role authorization.
