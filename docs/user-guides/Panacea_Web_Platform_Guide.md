# Panacea Web Platform Guide

## Purpose

`apps/panacea-web` is the professional web platform for Panacea OS v4.0 visibility and operator use.

It provides a browser interface for:

- Release status.
- Runtime service inventory.
- Health, readiness, metrics, and OpenAPI URLs.
- Foundation Provider status.
- Clinical, enterprise, AI, global, and developer capability visibility.
- OpenAPI exploration.
- Release evidence.
- Documentation.
- Legacy coverage.
- New innovations.
- Demo mode.

It does not add backend features, healthcare modules, AI capabilities, diagnosis, treatment recommendations, or autonomous workflows.

## Run

```sh
npm --prefix apps/panacea-web install
npm run web:dev
```

Open:

```text
http://localhost:5174
```

## Build

```sh
npm run web:build
```

Preview:

```sh
npm run web:preview
```

Open:

```text
http://localhost:4174
```

## Architecture

| Area | Implementation |
|---|---|
| Framework | Vite + TypeScript |
| Rendering | Vanilla TypeScript with data-driven route rendering |
| Icons | Lucide |
| Data source | Generated repository evidence at `apps/panacea-web/public/panacea-data.json` |
| Generator | `apps/panacea-web/scripts/generate-data.mjs` |
| Tests | Vitest + jsdom |
| Styling | Responsive CSS in `src/styles.css` |

## Routes

| Route | Purpose |
|---|---|
| `#/command/executive-overview` | Release overview and active platform summary |
| `#/command/system-health` | Service inventory and runtime URLs |
| `#/command/global-command` | Command intelligence service details |
| `#/command/foundation-provider` | Foundation Provider contract and live probe |
| `#/clinical/modules` | Clinical capability visibility matrix |
| `#/enterprise/modules` | Enterprise capability visibility matrix |
| `#/intelligence/ai-governance` | AI assurance service details |
| `#/developer/api-explorer` | Search OpenAPI endpoints and generate safe curl examples |
| `#/developer/documentation` | Browse repository documentation |
| `#/developer/demo-mode` | Demo and validation path |
| `#/evidence/release` | Release evidence center |
| `#/evidence/legacy-coverage` | Legacy feature coverage |

## Data Refresh

The data generator runs automatically before:

```sh
npm run web:check
npm run web:build
npm run web:dev
```

Manual refresh:

```sh
npm --prefix apps/panacea-web run generate:data
```

## Safety Boundary

The web platform is read-only and evidence-oriented. It does not send clinical data, does not contain PHI seed data, and does not execute treatment or diagnostic workflows.
