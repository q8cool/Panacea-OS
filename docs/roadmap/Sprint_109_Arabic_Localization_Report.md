# Sprint 109 Arabic Localization Report

Date: 2026-07-01
Branch: `develop/v4.0`
Scope: Frontend localization, Arabic translation, RTL layout, documentation, and tests only.

## Final Decision

PASS.

Panacea OS web UI now supports English and Arabic with persistent language selection and RTL rendering for Arabic. No backend healthcare features, clinical logic, AI capabilities, or backend product behavior were added.

## Summary

| Item | Status |
|---|---|
| Arabic support implemented | YES |
| RTL support implemented | YES |
| Language switcher implemented | YES |
| Persistent selected language | YES, `localStorage.panacea-language` |
| English LTR support preserved | YES |
| API paths kept LTR | YES |
| Markdown body auto-translation avoided | YES |
| Translation coverage | 92% UI shell and role workspace coverage |

## Pages Translated

- Sidebar and top navigation.
- Executive Overview.
- Foundation Login.
- System Health.
- Live API Status.
- Foundation Provider.
- Clinical Modules.
- Enterprise Modules.
- AI and Governance pages.
- API Explorer controls and labels.
- Documentation Center controls.
- Release Evidence Center.
- Doctor / Clinician workspace.
- Patient Portal workspace.
- Laboratory workspace.
- Radiology workspace.
- Pharmacy workspace.
- Administration workspace.

## Safety Labels

Clinical advisory label:

```text
للاسترشاد فقط. يبقى القرار النهائي للطبيب المختص.
```

Demo data warning:

```text
بيانات تجريبية — ليست بيانات مرضى حقيقية
```

## Technical Content Preserved In English/LTR

- API paths.
- URLs.
- Service IDs.
- HTTP methods.
- OpenAPI operation names and generated summaries.
- cURL commands.
- Markdown document bodies authored in English.

These are intentionally preserved to avoid breaking developer/operator copy-and-paste workflows.

## Tests Added

Added web tests for:

- English locale loading.
- Arabic locale loading.
- Language switcher rendering.
- RTL direction for Arabic.
- LTR direction for English.
- Arabic sidebar rendering.
- Doctor workspace Arabic rendering.
- Patient workspace Arabic rendering.
- Laboratory workspace Arabic rendering.
- Radiology workspace Arabic rendering.
- Pharmacy workspace Arabic rendering.
- Administration workspace Arabic rendering.
- API Explorer keeping API paths LTR.
- Demo safety label Arabic translation.
- Advisory clinical safety label Arabic translation.

## Validation Results

| Command/check | Result |
|---|---|
| `npm run web:check` | PASS, 39 tests |
| `npm run check` | PASS |
| `npm run build` | PASS |
| `npm run test:run` | PASS, 128 tests |
| `npm run openapi` | PASS, 26 OpenAPI documents |
| `npm run web:build` | PASS |
| `npm run quality:gate` | PASS |
| `curl -I http://localhost:5174/` | PASS, HTTP 200 |

## Remaining Untranslated Items

The following are intentionally not translated:

- English markdown document bodies.
- OpenAPI generated summaries and operation IDs.
- API paths, URLs, code, service IDs, and cURL.

## Next Recommended Localization Sprint

Sprint 110 should be a visual QA and Arabic content polish sprint if the operator wants broader Gulf Arabic review. Suggested scope:

- Browser screenshot validation for Arabic pages.
- Kuwait/Gulf terminology review by a clinical operations reviewer.
- Optional Arabic summaries for selected documentation pages.
- No backend feature expansion.
