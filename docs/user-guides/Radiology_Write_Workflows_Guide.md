# Radiology Write Workflows Guide

Radiology Live Mode supports imaging order, study status, report, approval, and critical-finding writes.

| Workflow | Endpoint | Event |
|---|---|---|
| Create imaging order | `/api/v4/global-command-intelligence/write-workflows/radiology/orders` | `imaging.order.created` |
| Start study | `/api/v4/global-command-intelligence/write-workflows/radiology/studies/{studyId}/start` | `imaging.study.started` |
| Complete study | `/api/v4/global-command-intelligence/write-workflows/radiology/studies/{studyId}/complete` | `imaging.study.completed` |
| Create report | `/api/v4/global-command-intelligence/write-workflows/radiology/reports` | `radiology.report.created` |
| Approve report | `/api/v4/global-command-intelligence/write-workflows/radiology/reports/{reportId}/approve` | `radiology.report.approved` |
| Flag critical finding | `/api/v4/global-command-intelligence/write-workflows/radiology/reports/{reportId}/critical-findings` | `critical.finding.flagged` |

DICOM image viewing is not implemented in this sprint.
