# Pharmacy Workspace Guide

## Purpose

The Pharmacy Workspace provides a professional UI shell for medication catalog, prescription queue, review, dispensing, administration overview, inventory, batch/lot tracking, expiration tracking, drug safety alerts, controlled medications, and pharmacy reports.

## Open

```text
http://localhost:5174/#/workspace/pharmacy/dashboard
```

Or use **Demo Role Switcher** and select **Pharmacist**.

## Pages

- Pharmacy Dashboard.
- Medication Catalog.
- Prescription Queue.
- Prescription Review.
- Dispensing.
- Medication Administration Overview.
- Inventory.
- Batch / Lot Tracking.
- Expiration Tracking.
- Drug Safety Alerts.
- Controlled Medications.
- Pharmacy Reports.

## Visible Safety Areas

- Allergy safety status.
- Interaction safety status.
- Duplicate therapy warnings.
- Dispensing workflow.
- Stock status.
- Controlled medication audit.

## Safety Boundary

No new medication safety backend logic is implemented in this sprint.

The UI displays existing API/documented status only.

## What Requires Live Data

- Medication catalog feed.
- Prescription queue.
- Real safety checks.
- Dispensing writes.
- Inventory stock counts.
- Controlled medication audit entries.
