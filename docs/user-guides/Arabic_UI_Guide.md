# Arabic UI Guide

## Purpose

Panacea OS web UI now supports bilingual operation for English and Arabic. Arabic mode is designed for hospital operators in Kuwait and the Gulf, with right-to-left layout, professional medical terminology, and safety wording that preserves clinical governance.

## How To Use Arabic Mode

1. Start the web UI:

```sh
npm run web:dev
```

2. Open:

```text
http://localhost:5174
```

3. Use the language selector in the top navigation.
4. Choose `العربية`.
5. The application switches to Arabic and applies RTL direction.
6. Reload the page. The selected language remains active through `localStorage`.

## Arabic Coverage

Arabic localization covers:

- Sidebar and navigation sections.
- Top navigation controls.
- Search labels and empty states.
- Demo and live mode labels.
- Status badges.
- Command Center pages.
- System Health and Foundation Provider pages.
- API Explorer labels.
- Documentation Center controls.
- Role workspaces for doctor, patient, laboratory, radiology, pharmacy, and administration.
- Clinical safety labels.
- Demo data warnings.

## Safety Wording

The advisory clinical safety label is translated as:

```text
للاسترشاد فقط. يبقى القرار النهائي للطبيب المختص.
```

The demo safety label is translated as:

```text
بيانات تجريبية — ليست بيانات مرضى حقيقية
```

## Technical Boundaries

The following remain English or LTR by design:

- API paths.
- URLs.
- Service IDs.
- OpenAPI method names.
- cURL commands.
- Code blocks.
- Markdown document bodies that are authored in English.

These items are intentionally preserved so developers and operators can copy commands and inspect API contracts safely.
