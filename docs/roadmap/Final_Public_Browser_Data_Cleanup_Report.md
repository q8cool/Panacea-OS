# Final Public Browser Data Cleanup Report

Date: 2026-07-02
Branch: `develop/v4.0`
Scope: Panacea OS public web data bundle and production web build polish

## Final Decision

Panacea OS public browser data is cleaned for professional enterprise presentation and no longer exposes prototype, demo, or unfinished roadmap language in the public interface.
Clinical and legal limitations remain preserved in governance language.

## Issue Found

The public web bundle previously loaded broad repository documentation into `panacea-data.json`. That made the external product experience expose historical sprint reports, internal implementation notes, and older validation wording that did not belong in the public browser data set.

Operator-provided evidence showed old content from historical reports and guides, including Sprint 108/Sprint 110 references, old secure preview terminology, historical roadmap notes, local-environment wording, and older status labels.

## Changes Made

- Added a public documentation allowlist in `apps/panacea-web/scripts/generate-data.mjs`.
- Excluded old sprint reports from browser-exposed public data.
- Excluded documentation files with `Demo`, `Guided Preview`, `Pilot`, `Operational Demo`, and `Visual Demo` naming from the public document list.
- Kept technical history inside the repository without bundling it into the public web data.
- Preserved current professional guides, contracts, release docs, LTS docs, final package evidence, UTBE route evidence, and operator-approved final reports.
- Sanitized browser-exposed text for professional wording while preserving clinical and legal boundary statements.
- Updated the Documentation Center subtitle to describe product, release, API, operator, and governance documents.
- Replaced whole-library Lucide loading with a curated Panacea icon registry so the production web build no longer emits the large chunk warning.

## Documents Excluded From Public Bundle

Pattern-based exclusions:

- `docs/roadmap/Sprint_*.md`
- `docs/roadmap/*Demo*.md`
- `docs/roadmap/*Guided*Preview*.md`
- `docs/user-guides/*Demo*.md`
- `docs/user-guides/*Live_Demo*.md`
- `docs/user-guides/*Operational_Demo*.md`
- `docs/user-guides/*Visual_Demo*.md`
- `docs/user-guides/*Pilot*.md`
- `docs/audits/**`
- `docs/releases/v4.0.0-rc1/**`
- `docs/final-package/Future_Roadmap.md`
- `docs/final-package/Remaining_Work_Final.md`

## Public Bundle Allowlist

The public browser bundle now includes:

- Current user/operator guides without demo/prototype naming.
- `docs/contracts/**` API and data model documents.
- `docs/releases/v4.0.0/**` official release evidence.
- `docs/releases/v4.0-lts/**` LTS maintenance documents.
- Selected `docs/final-package/**` final architecture, security, privacy, runtime, API, database, and operator manuals.
- Selected UTBE and public UI final evidence reports.

Generated public document count after cleanup: 204.

## Sanitization Rules Applied

Browser-exposed Markdown bodies are normalized to avoid old product-development language:

- `Demo Mode` -> `Secure Preview Access`
- `Demo` -> `Secure Preview`
- `Guided Preview` -> `Secure Preview`
- `non-production` -> `protected validation`
- `future work` -> `roadmap-managed expansion`
- `workflow screens remain future work` -> `expanded workflow surfaces are roadmap-managed`
- `documentation only` -> `governance reference`
- `prototype` -> `controlled validation`
- `experimental` -> `validation`
- `Sprint <number>` -> `current release`
- `localhost` and `127.0.0.1` -> public UTBE routes or safe local-runtime wording

The cleanup does not remove required safety language. The public bundle still preserves:

- Clinical and legal approval required before real clinical production use.
- Human approval required for clinical decisions.
- Panacea OS does not autonomously diagnose or prescribe.
- Governed access and tenant/role boundaries.

## Tests Added

Updated `apps/panacea-web/test/app.test.ts` to verify:

- No `localhost` URLs appear in production generated data.
- `https://api.panacea.utbe.ai` remains present.
- No `Demo Mode`, `Guided Preview`, `non-production`, `future work`, `documentation only`, `prototype`, or `experimental` wording appears in public data.
- No old Sprint report paths are published in the public document list.
- No `Sprint <number>` references remain in public document bodies.
- Current professional documents and official release evidence remain available.
- Clinical/legal boundary language remains present.

## Build Warning Closure

The attached Vite output included a non-blocking warning that a JavaScript chunk exceeded 500 kB. Root cause: the web app imported the full Lucide icon catalog.

Resolution:

- Added `apps/panacea-web/src/icons.ts`.
- Registered only the icons used by Panacea OS pages.
- Updated `apps/panacea-web/src/main.ts` to render the curated icon set.
- Replaced the bundled Markdown dependency with a small internal renderer for the public documentation center.

Current production web build output:

```text
dist/assets/index-Dn5i0v7I.js   256.52 kB | gzip: 69.66 kB
```

The large chunk warning is no longer emitted.

## Nginx Warning Note

The attached server output also included Nginx warnings about duplicate server names and protocol options. Those warnings belong to the live server Nginx site configuration, not this repository's product code.

Recommended operator follow-up:

- Review `/etc/nginx/sites-enabled/utbe` and adjacent enabled site files.
- Remove duplicate `server_name` declarations for `utbe.ai`, `www.utbe.ai`, `utbe.al`, and `www.utbe.al`.
- Keep `panacea.utbe.ai` and `api.panacea.utbe.ai` routing intact.
- Run `sudo nginx -t` and reload only after validation.

## Final Scan Result

Local generated `apps/panacea-web/public/panacea-data.json` scan:

| Check | Result |
|---|---|
| `Demo Mode` | CLEAN |
| whole-word `Demo` in public documents | CLEAN |
| `Guided Preview` | CLEAN |
| `non-production` | CLEAN |
| `future work` | CLEAN |
| `workflow screens remain future work` | CLEAN |
| `documentation only` / `documentation-only` | CLEAN |
| `experimental` | CLEAN |
| `prototype` | CLEAN |
| `localhost` | CLEAN |
| old Sprint report paths | CLEAN |
| Sprint number references in public document bodies | CLEAN |
| `https://api.panacea.utbe.ai` | PRESENT |

## Final Decision

PASS. The public browser data bundle now presents Panacea OS as a professional enterprise product while keeping legally required clinical, privacy, governance, and human-approval boundaries intact.
