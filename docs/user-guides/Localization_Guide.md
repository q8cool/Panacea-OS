# Localization Guide

## Architecture

The Panacea web app uses frontend-only localization in:

```text
apps/panacea-web/src/locales/
```

Locale files:

- `en.ts`
- `ar.ts`
- `index.ts`

Supported locales:

| Locale | Language | Direction |
|---|---|---|
| `en` | English | LTR |
| `ar` | Arabic | RTL |

## Runtime Behavior

The selected language is stored in:

```text
localStorage.panacea-language
```

When Arabic is selected:

- `document.documentElement.lang` is set to `ar`.
- `document.documentElement.dir` is set to `rtl`.
- The app shell renders with `lang="ar"` and `dir="rtl"`.

When English is selected:

- `lang` is set to `en`.
- `dir` is set to `ltr`.

## Translation Rules

Visible UI labels are translated through the locale dictionary. Components should not contain inline Arabic text unless the text is intentionally part of a test assertion or documentation.

OpenAPI paths, URLs, service IDs, code blocks, cURL commands, and markdown document bodies are not translated.

## Adding A Translation

1. Add the English source string to the component.
2. Add the Arabic translation in `apps/panacea-web/src/locales/ar.ts`.
3. Render with the shared `translate` helper.
4. Add or update a web test if the string is user-visible navigation, safety, role workspace, or API Explorer text.

## Validation

Run:

```sh
npm run web:check
npm run web:build
```

For full repository validation run:

```sh
npm run check
npm run build
npm run test:run
npm run openapi
npm run quality:gate
```
