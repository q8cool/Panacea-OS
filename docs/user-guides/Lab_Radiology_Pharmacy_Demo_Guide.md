# Laboratory, Radiology, and Pharmacy Demo Guide

This guide explains the operational demo for hospital diagnostic and medication workspaces.

## Laboratory

Open:

```text
http://localhost:5174/#/workspace/laboratory/dashboard
```

Visible demo areas:

- Lab orders.
- Specimen tracking.
- Result entry visibility.
- Result validation and approval.
- Critical results.
- Quality control.
- Lab analytics and reports.

Result entry is visual only and is not persisted to the production backend.

## Radiology

Open:

```text
http://localhost:5174/#/workspace/radiology/dashboard
```

Visible demo areas:

- Imaging orders.
- Study list.
- DICOM metadata.
- PACS status.
- Reporting worklist.
- Report approval.
- Critical findings.
- Imaging timeline.

DICOM image viewing is not available in this UI. The demo shows metadata and workflow visibility only.

## Pharmacy

Open:

```text
http://localhost:5174/#/workspace/pharmacy/dashboard
```

Visible demo areas:

- Medication catalog.
- Prescription queue.
- Prescription review.
- Dispensing visibility.
- Inventory.
- Batch and lot tracking.
- Expiration tracking.
- Drug safety alert visibility.
- Controlled medication audit visibility.

The pharmacy demo does not add medication safety backend logic and does not prescribe or dispense real medication.

