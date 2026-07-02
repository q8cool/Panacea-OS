# Clinical Safety and Doctor Approval Guide

## Purpose

The restored AI Hospital Core keeps the old operational workflows executable while enforcing modern Panacea clinical safety controls.

## Required Controls

Every live write workflow includes:

- Foundation-authenticated user.
- Tenant-scoped request.
- Role and permission checks.
- Audit requirement.
- Human user confirmation.
- No autonomous diagnosis.
- No autonomous treatment.
- No autonomous clinical decision.
- Medication safety rules when pharmacy workflows are involved.

## Doctor Approval Boundary

Doctor approval is required before clinical recommendations, prescriptions, or treatment/order workflows can be acted on operationally. The system records requests, review evidence, and approval boundaries; it does not replace the authorized clinician.

## Pharmacy Boundary

Pharmacy safety workflow records medication safety checks and produces pharmacy review read models. It does not bypass pharmacist or clinician policy.

## Audit Boundary

Write workflow events and read-model projections are reviewable through:

```text
https://panacea.utbe.ai/#/command/transaction-review
```

## Verification

Run:

```bash
npm run test:run
npm run web:check
```

The tests reject unsafe workflow controls such as disabled human approval, autonomous diagnosis, autonomous treatment, or missing pharmacy safety evidence.
