# Pharmacy Write Workflows Guide

Pharmacy Live Mode supports prescription, safety validation, dispensing, inventory, and safety alert writes.

| Workflow | Endpoint | Event |
|---|---|---|
| Create prescription | `/api/v4/global-command-intelligence/write-workflows/pharmacy/prescriptions` | `prescription.created` |
| Review prescription | `/api/v4/global-command-intelligence/write-workflows/pharmacy/prescriptions/{prescriptionId}/review` | `prescription.reviewed` |
| Validate medication safety | `/api/v4/global-command-intelligence/write-workflows/pharmacy/prescriptions/{prescriptionId}/validate` | `medication.safety.validated` |
| Dispense medication | `/api/v4/global-command-intelligence/write-workflows/pharmacy/prescriptions/{prescriptionId}/dispense` | `medication.dispensed` |
| Update inventory | `/api/v4/global-command-intelligence/write-workflows/pharmacy/inventory` | `pharmacy.inventory.updated` |
| Flag safety alert | `/api/v4/global-command-intelligence/write-workflows/pharmacy/safety-alerts` | `medication.safety.alert.flagged` |

The backend requires `documentedMedicationSafetyRulesApplied: true` for pharmacy workflows. Sprint 113 does not add new medication-safety logic.
