# Clinical Safety And Doctor Approval Guide

## Safety Position

Panacea OS supports operational healthcare workflows, but it does not autonomously diagnose, treat, prescribe, dispense, or execute clinical orders.

## Approval Model

Clinical actions require a human clinician or authorized reviewer. The operational core records:

- request details
- clinical context
- approval owner
- safety gate status
- audit metadata
- event projection status

## Medication Safety

Prescription workflows require pharmacy safety review for allergy, interaction, duplicate therapy, controlled medication, and dispensing readiness checks.

## Treatment And Order Safety

Treatment and order requests are routed for approval. Panacea OS records governance evidence and workflow state; it does not execute orders without an approved operational system and human sign-off.

## Audit Evidence

Every operational core transaction records:

- actor
- tenant
- role
- request ID
- correlation ID
- workflow key
- event type
- projection targets
- clinical safety boundary

## Production Governance

Real clinical use requires institutional approval, privacy approval, regulatory review, security validation, operating procedures, and assigned clinical accountability.
