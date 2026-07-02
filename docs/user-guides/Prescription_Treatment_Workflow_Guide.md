# Prescription and Treatment Workflow Guide

## Purpose

This guide explains how restored prescription, order, treatment, and safety workflows operate in Panacea OS v4.

## Prescription Draft

1. Sign in through the Foundation provider.
2. Open `https://panacea.utbe.ai/#/hospital-core`.
3. Enter the patient ID.
4. Use Draft Prescription to record the medication draft.
5. The draft remains governed evidence until authorized clinician approval and pharmacy safety review are completed.

## Pharmacy Safety Check

1. Use Pharmacy Safety Check for allergy, interaction, duplicate therapy, contraindication, and documented medication safety review.
2. Review pharmacy safety output through:

```text
GET /api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/pharmacy-review
```

## Orders and Treatment

1. Use Create Order to start an order workflow.
2. Use the workflow and order read routes to review status:

```text
GET /api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/orders
GET /api/v4/global-command-intelligence/read-models/clinical/patients/{patientId}/workflow
```

3. Use Advance Workflow when an authorized handoff or approval step is completed.

## Safety Boundary

Panacea OS records prescription and treatment/order workflows. It does not autonomously prescribe, dispense, administer, or execute treatment. Human approval remains mandatory.

## Verification

Run:

```bash
node --test tests/real-time-global-healthcare-command-intelligence-platform/write-workflows.test.mjs
```

