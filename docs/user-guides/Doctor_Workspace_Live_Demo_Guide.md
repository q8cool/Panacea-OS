# Doctor Workspace Live Demo Guide

The Doctor / Clinician workspace gives a visible operational demo for patient lookup, chart review, timeline review, safety context, and advisory-only recommendation visibility.

## Open

```text
http://localhost:5174/#/workspace/doctor/dashboard
```

## Demo Pages

| Page | What You Can See |
|---|---|
| Dashboard | Patient search, watchlist, summary chart |
| Patient Search | Synthetic patient directory with MRN, ward, status, risk |
| Patient Profile | Summary card, demographics, location, allergies, conditions |
| Clinical Timeline | Synthetic lab, radiology, pharmacy, encounter timeline |
| Allergies | Demo allergy list |
| Conditions | Demo conditions |
| Medications | Demo medication list |
| Vital Signs | Synthetic vital sign trend table |
| Encounters | Demo encounter history |
| Clinical Notes | Synthetic notes clearly marked as demo content |
| Orders Overview | Lab, radiology, and pharmacy order status visibility |
| Lab Results | Demo lab result table |
| Radiology Reports | Demo radiology report summaries |
| Pharmacy Review | Medication review visibility |
| AI Recommendations | Advisory-only cards with clinician approval boundary |
| Clinical Alerts | Synthetic watchlist |
| Task List | Demo clinical tasks |
| Care Team View | Role and care-team visibility |

## Safety Boundary

The workspace does not perform diagnosis, treatment, prescribing, or autonomous clinical decisions. The clinician remains the final decision maker.

## Live Mode

Live Mode requires a Foundation-issued JWT. When live APIs are unavailable, the demo remains labeled and separate from live status panels.

