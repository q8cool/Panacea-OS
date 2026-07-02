# Final Hard Public Data Cleanup Report

Date: 2026-07-02
Branch: `develop/v4.0`
Scope: public browser data generation for Panacea OS web UI

## Final Decision

Panacea OS public browser data is now generated from a strict approved-document allowlist only.

The generated `apps/panacea-web/public/panacea-data.json` keeps UTBE API metadata and professional clinical/legal governance language, while excluding historical sprint notes, old workspace guides, internal audit reports, local runtime links, and unfinished product language from the public browser bundle.

## Issue Corrected

The public data bundle previously included broad documentation content from repository folders. That allowed older implementation notes, historical sprint references, local-only route examples, and product-development terminology to appear in `panacea-data.json`.

## Changes Made

- Updated `apps/panacea-web/scripts/generate-data.mjs` to stop broad documentation-folder scanning.
- Replaced broad document discovery with a strict public documentation allowlist.
- Excluded all sprint reports, historical audit/progress reports, legacy workspace guides, and internal implementation guides from the generated browser data.
- Added build-time public data enforcement that fails generation when forbidden public terms survive sanitization.
- Kept API metadata, OpenAPI-derived runtime routes, and UTBE public API URLs.
- Removed full release-evidence document bodies from the public JSON while retaining release evidence metadata.
- Updated the Documentation Center default document to the clinical/legal boundary statement.
- Added tests for the hard forbidden public-data terms and strict document allowlist behavior.

## Public Document Allowlist

The browser data generator now permits only the following public documents when present:

- `docs/user-guides/Clinical_And_Legal_Boundary_Statement.md`
- `docs/user-guides/Security_Boundary_Validation_Guide.md`
- `docs/user-guides/UTBE_Domain_DNS_Setup_Guide.md`
- `docs/user-guides/UTBE_HTTPS_Certificate_Runbook.md`
- `docs/user-guides/Backup_And_Restore_Guide.md`
- `docs/roadmap/Final_UTBE_External_Pilot_Deployment_Evidence_Report.md`
- `docs/roadmap/Final_UTBE_Public_Port_Security_Closure_Report.md`
- `docs/roadmap/Final_Professional_UI_Productization_Report.md`
- `docs/roadmap/Final_Public_Product_UI_Polish_Report.md`
- `docs/roadmap/Final_UTBE_UI_URL_Correction_Report.md`
- `docs/roadmap/Final_Public_Browser_Data_Cleanup_Report.md`
- `docs/roadmap/Final_Public_Data_Allowlist_Enforcement_Report.md`

## Forbidden Public Data Enforcement

Generation fails if public browser data contains hard-blocked public terms related to old access modes, historical sprint implementation notes, local-only addresses, unfinished workflow language, or unavailable live API labels.

The enforcement is applied to:

- sanitized allowlisted document bodies,
- generated public browser data before writing `panacea-data.json`.

## Validation Evidence

Initial generation after the cleanup produced:

- services: 9
- OpenAPI documents: 26
- browser-public documents: 10

The generated public data keeps:

- `https://api.panacea.utbe.ai`
- clinical/legal approval boundary language
- human approval requirements
- governed access and tenant/security boundaries

## Final Statement

Panacea OS public browser data now presents a professional enterprise product surface and no longer exposes old guided-access, historical sprint, local runtime, or incomplete-product documentation in the public web bundle.
