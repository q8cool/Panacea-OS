# Live Radiology Workspace Guide

The radiology workspace uses read-only imaging workflow read models.

## Routes

| UI route | Backend read model |
|---|---|
| `#/workspace/radiology/dashboard` | `/api/v4/global-command-intelligence/read-models/radiology/dashboard` |
| `#/workspace/radiology/imaging-orders` | `/api/v4/global-command-intelligence/read-models/radiology/orders` |
| `#/workspace/radiology/study-list` | `/api/v4/global-command-intelligence/read-models/radiology/studies` |
| `#/workspace/radiology/dicom-metadata/{id}` | `/api/v4/global-command-intelligence/read-models/radiology/studies/{studyId}/dicom-metadata` |
| `#/workspace/radiology/pacs-status` | `/api/v4/global-command-intelligence/read-models/radiology/pacs/status` |
| `#/workspace/radiology/reporting-worklist` | `/api/v4/global-command-intelligence/read-models/radiology/reporting-worklist` |
| `#/workspace/radiology/report-editor` | `/api/v4/global-command-intelligence/read-models/radiology/reports` |
| `#/workspace/radiology/critical-findings` | `/api/v4/global-command-intelligence/read-models/radiology/critical-findings` |
| `#/workspace/radiology/imaging-timeline` | `/api/v4/global-command-intelligence/read-models/radiology/timeline` |

## Boundary

DICOM image viewing is not implemented. The live read model can display metadata and worklist rows only.
