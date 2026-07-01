# Live API Connection Status Guide

## Status Meanings

| Status | Operator meaning |
| --- | --- |
| `LIVE CONNECTED` | A browser-safe read endpoint exists and returned live data. |
| `LIVE PARTIAL` | The page can reach runtime or OpenAPI status, but live record data is not available. |
| `LIVE API UNAVAILABLE` | No safe matching read endpoint exists, or the endpoint cannot be reached. |
| `BLOCKED BY AUTH` | Authentication or authorization prevented access. |
| `BLOCKED BY CORS` | Browser CORS policy prevented access. |
| `DEMO MODE` | The page is showing non-production demonstration data. |
| `DOCUMENTATION ONLY` | The page is backed by documentation or release evidence. |

## How To Interpret Sprint 108

Sprint 108 makes the web app more honest and more connected:

- Runtime services can be started and validated.
- Local active services support trusted-origin CORS preflight.
- Browser requests send auth, tenant, user, request, and correlation headers.
- Role pages no longer imply that demo rows are live records.

Sprint 108 does not add patient, laboratory, radiology, pharmacy, or admin record read models. Those require future approved backend work.
