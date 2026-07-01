# RTL Layout Guide

## Overview

Arabic mode uses RTL layout while preserving technical content in LTR format. The UI is designed so hospital operators can navigate naturally in Arabic without breaking API Explorer, URLs, or code blocks.

## RTL Rules

When Arabic is active:

- The document direction is `rtl`.
- Sidebar borders and active indicators are mirrored.
- Search results open from the RTL side.
- Tables use logical text alignment.
- Role workspace navigation active indicators are mirrored.
- Arabic font fallback uses `Noto Sans Arabic`, `Segoe UI`, `Tahoma`, and `Arial`.

## LTR Exceptions

The following are isolated as LTR:

- `<code>` and `<pre>` content.
- API paths.
- Endpoint paths.
- cURL commands.
- URLs.
- HTTP methods.
- Service base paths.

This keeps examples readable and copyable.

## Verification Checklist

Use Arabic mode and verify:

- Sidebar reads right-to-left.
- Top navigation remains usable.
- Role workspaces render Arabic titles.
- Worklists and safety notices are right-aligned.
- API Explorer paths remain left-to-right.
- Tables scroll horizontally when needed.
- English mode still renders left-to-right.
