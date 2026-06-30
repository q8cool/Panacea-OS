# Patient Portal Guide

## Purpose

The Patient Portal Workspace provides a simple, mobile-friendly patient-facing UI shell for profile, appointments, visit history, medications, allergies, results, documents, messages, telemedicine, invoices, notifications, and care instructions.

## Open

```text
http://localhost:5174/#/workspace/patient/dashboard
```

Or use **Demo Role Switcher** and select **Patient**.

## Pages

- Patient Dashboard.
- Profile.
- Appointments.
- Visit History.
- Medications.
- Allergies.
- Lab Results.
- Radiology Reports.
- Clinical Documents.
- Secure Messages.
- Telemedicine.
- Invoices / Payments.
- Notifications.
- Care Instructions.

## Data Mode

The portal is read-only demo/operator mode.

It uses:

- Patient experience documentation.
- Patient portal documentation.
- Privacy, consent, and trust service status.
- OpenAPI and release evidence.

No real patient record is loaded.

## Patient Safety Boundary

Patient-facing content is educational and does not replace clinician advice.

The portal does not show AI recommendations as medical advice and does not expose unexplained internal risk scores.

## What Requires Live Data

- Patient login.
- Appointments.
- Messages.
- Payment records.
- Results.
- Clinical documents.
- Care instructions from a real care team.

Those require authenticated patient APIs, consent enforcement, and production privacy controls.
