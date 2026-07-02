# Final UTBE UI URL Correction Report

Date: 2026-07-02
Branch: `develop/v4.0`
Scope: production web UI URL correction only

## Final Decision

Panacea OS production UI now uses UTBE external HTTPS API routes and does not expose localhost links in the external pilot interface.

Not approved for real clinical production use.

## Live Deployment Status

Repository code and local production build are corrected.

The live UTBE server still requires deployment of the regenerated `apps/panacea-web/dist` assets. Direct deployment from this workstation was attempted, but SSH access to `162.0.228.10` was rejected:

```text
root@162.0.228.10: Permission denied (publickey,password).
```

External verification before server redeploy showed the currently served `https://panacea.utbe.ai/panacea-data.json` still contains old local service URLs. The operator must copy the regenerated `apps/panacea-web/dist` contents to `/var/www/panacea` on the server, then re-check the public JSON.

## Issue Found

The deployed web UI still displayed internal service links from the local Docker runtime profile. Those links pointed to direct service ports such as 18094, 18095, and 18141-18147 on a local machine, which is wrong for the external UTBE controlled pilot.

The correct external API base for the production UI is:

```text
https://api.panacea.utbe.ai
```

## Root Cause

The web data generator derived service status URLs from Docker Compose host port bindings. That was useful for local runtime validation, but it leaked internal development addresses into the public web data bundle and Operator Center.

The API Explorer also had hard-coded service-specific local endpoint bases for curl examples.

## Localhost Links Removed

The web data generator no longer emits browser-visible service URLs from local Docker ports. It now emits public service URLs using the production API base.

The API Explorer no longer generates service-specific local examples. Curl examples now use the UTBE external API domain.

Generated documentation content included in the web data bundle is sanitized so local HTTP links are replaced with UTBE public web/API routes before being exposed to the browser.

## External UTBE URLs Added

Production generated service URLs now use:

```text
https://api.panacea.utbe.ai
```

Examples now resolve to:

| Service area | Production route |
|---|---|
| Autonomous healthcare intelligence | `https://api.panacea.utbe.ai/api/v4/autonomous-healthcare-intelligence/live` |
| Global command intelligence | `https://api.panacea.utbe.ai/api/v4/global-command-intelligence/live` |
| Global workforce | `https://api.panacea.utbe.ai/api/v3/global-workforce/live` |
| Global compliance | `https://api.panacea.utbe.ai/api/v3/global-compliance/live` |
| Global AI assurance | `https://api.panacea.utbe.ai/api/v3/global-ai-assurance/live` |
| Global privacy | `https://api.panacea.utbe.ai/api/v3/global-privacy/live` |

## Pages Checked

| Page area | Result |
|---|---|
| Executive Overview | No raw technical service links shown |
| Role workspaces | No public local service links shown |
| Secure Access | No local service links shown |
| Clinical and enterprise module pages | No local service links shown |
| Operator System Operations | Shows UTBE external HTTPS API routes |
| API Contract Explorer | Generates UTBE external HTTPS curl examples |
| Documentation Center | Generated browser data sanitizes local HTTP links |

## Tests Added Or Updated

- Verifies generated production web data uses `https://api.panacea.utbe.ai`.
- Verifies generated production web data does not contain local HTTP URLs.
- Verifies every generated service runtime check uses the UTBE public API base.
- Verifies Operator Center shows UTBE external routes and does not show local HTTP routes.
- Verifies API Explorer curl examples use the UTBE external API base.
- Preserves existing tests for live/demo/pilot labels, Arabic labels, role cards, and professional error states.

## Files Changed

| File | Purpose |
|---|---|
| `apps/panacea-web/scripts/generate-data.mjs` | Emit public UTBE service URLs and sanitize browser-exposed document content |
| `apps/panacea-web/src/apiExplorer.ts` | Generate curl examples from the UTBE public API base |
| `apps/panacea-web/src/webConfig.ts` | Support `PANACEA_API_PUBLIC_BASE_URL` and default production API base |
| `apps/panacea-web/src/liveApi.ts` | Use public API base fallback for live requests |
| `apps/panacea-web/src/apiAllowlist.ts` | Use public API base for browser allowlist URLs |
| `apps/panacea-web/src/types.ts` | Add public URL fields to generated app data and config types |
| `apps/panacea-web/test/app.test.ts` | Add and update URL-correction tests |
| `apps/panacea-web/public/panacea-data.json` | Regenerated production web data |

## Validation Summary

The validation suite was run after the URL correction. Results are recorded in the final sprint output.

## Deployment Note

The production build output is generated at:

```text
apps/panacea-web/dist
```

The live server must serve those built files from:

```text
/var/www/panacea
```

If SSH access is not available from the workstation, the operator must copy the contents of `apps/panacea-web/dist` to the server using approved deployment credentials.

## Required Post-Deploy Verification

After the server receives the regenerated `dist` assets, run:

```bash
curl -fsS https://panacea.utbe.ai/panacea-data.json | rg "https?://(localhost|127\\.0\\.0\\.1)"
curl -fsS https://panacea.utbe.ai/panacea-data.json | rg "https://api.panacea.utbe.ai" | head
```

Expected:

- The first command returns no matches.
- The second command shows UTBE API routes.
