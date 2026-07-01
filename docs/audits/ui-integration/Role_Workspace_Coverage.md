# Role Workspace Coverage

Generated: 2026-07-01T06:07:01.266Z

| Workspace | Total pages | Live-connected pages | Partial pages | Documentation-only pages | Demo-only pages | Unavailable pages | Missing backend APIs | Missing CORS | Missing auth claims | Recommended fixes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Doctor / Clinician Workspace | 18 | 0 | 18 | 0 | 0 | 0 | No missing active source services for declared workspace sources | Live record APIs and domain-specific read models are not connected to most workspace pages | Foundation auth token required; no live test token present | CORS required for browser access to runtime services | Add approved read-model APIs and CORS-tested authenticated endpoints before marking fully live |
| Patient Portal Workspace | 14 | 0 | 14 | 0 | 0 | 0 | No missing active source services for declared workspace sources | Live record APIs and domain-specific read models are not connected to most workspace pages | Foundation auth token required; no live test token present | CORS required for browser access to runtime services | Add approved read-model APIs and CORS-tested authenticated endpoints before marking fully live |
| Laboratory Workspace | 12 | 0 | 12 | 0 | 0 | 0 | No missing active source services for declared workspace sources | Live record APIs and domain-specific read models are not connected to most workspace pages | Foundation auth token required; no live test token present | CORS required for browser access to runtime services | Add approved read-model APIs and CORS-tested authenticated endpoints before marking fully live |
| Radiology Workspace | 11 | 0 | 11 | 0 | 0 | 0 | No missing active source services for declared workspace sources | Live record APIs and domain-specific read models are not connected to most workspace pages | Foundation auth token required; no live test token present | CORS required for browser access to runtime services | Add approved read-model APIs and CORS-tested authenticated endpoints before marking fully live |
| Pharmacy Workspace | 12 | 0 | 12 | 0 | 0 | 0 | No missing active source services for declared workspace sources | Live record APIs and domain-specific read models are not connected to most workspace pages | Foundation auth token required; no live test token present | CORS required for browser access to runtime services | Add approved read-model APIs and CORS-tested authenticated endpoints before marking fully live |
| Administration Workspace | 17 | 0 | 17 | 0 | 0 | 0 | No missing active source services for declared workspace sources | Live record APIs and domain-specific read models are not connected to most workspace pages | Foundation auth token required; no live test token present | CORS required for browser access to runtime services | Add approved read-model APIs and CORS-tested authenticated endpoints before marking fully live |

## Coverage Summary

Role workspaces are visually complete and Live Mode aware, but they are not fully live clinical/department applications. They use authenticated read-only endpoint selection and hide demo rows in Live Mode when real records are unavailable.
