# Clinician Workspace Guide

## Purpose

The Doctor / Clinician Workspace gives clinicians a professional read-only UI shell for reviewing clinical context, documented clinical coverage, safety areas, advisory-only intelligence, audit evidence, and OpenAPI-backed platform status.

## Open

```text
http://localhost:5174/#/workspace/doctor/dashboard
```

Or use **Demo Role Switcher** and select **Doctor**.

## Pages

- Clinician Dashboard.
- Patient Search.
- Patient Profile.
- Clinical Timeline.
- Encounters.
- Allergies.
- Conditions.
- Medications.
- Vital Signs.
- Clinical Notes.
- Orders Overview.
- Lab Results Viewer.
- Radiology Reports Viewer.
- Pharmacy / Medication Review.
- AI Recommendations Viewer.
- Clinical Alerts.
- Task List.
- Care Team View.

## Data Mode

The workspace is read-only demo/operator mode.

It uses:

- OpenAPI documents.
- Clinical documentation.
- AI governance evidence.
- Autonomous intelligence governance service status.
- Release evidence.

No real patient record is loaded. The UI labels role workspaces with:

```text
DEMO DATA -- NOT REAL PATIENT DATA
```

## Safety Boundary

All AI-related UI states:

```text
Advisory only. Clinician remains final decision maker.
```

The workspace does not diagnose, prescribe, execute treatment, or bypass clinical approval.

## What Requires Live Data

- Authenticated patient search.
- Real patient profile.
- Encounter history.
- Orders.
- Results.
- Notes.
- Clinical task execution.
- Audit trail drill-through.

Those require approved clinical backend APIs and Foundation authentication.
