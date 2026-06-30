# Radiology Workspace Guide

## Purpose

The Radiology Workspace provides a professional UI shell for imaging orders, study lists, DICOM metadata, PACS status, reporting worklists, report editing, approval, critical findings, imaging timeline, and analytics.

## Open

```text
http://localhost:5174/#/workspace/radiology/dashboard
```

Or use **Demo Role Switcher** and select **Radiology User**.

## Pages

- Radiology Dashboard.
- Imaging Orders.
- Study List.
- DICOM Metadata Viewer.
- PACS Status.
- Reporting Worklist.
- Report Editor UI.
- Report Approval.
- Critical Findings.
- Imaging Timeline.
- Radiology Analytics.

## DICOM Scope

```text
DICOM image viewer not implemented in this UI sprint.
```

The workspace still implements metadata, report workflow, PACS status, critical finding visibility, and analytics UI surfaces.

## Data Mode

The workspace is read-only demo/operator mode using radiology documentation, DICOM metadata references, OpenAPI evidence, and command intelligence status.

## What Requires Live Data

- Imaging order feed.
- PACS connection.
- DICOM object retrieval.
- Report editing writes.
- Report approval writes.
- Critical finding notification workflow.
