# User Journey Map

Audit date: 2026-06-30
Sprint context: Sprint 101 web platform

## Current Product Shape

Panacea OS v4.0 is usable through:

- `apps/panacea-web` operator UI.
- Active backend APIs.
- OpenAPI contracts.
- Validation scripts.
- Release documents.

It is not yet a set of full role-specific clinical, patient, finance, or departmental workflow applications.

## System Administrator

| Area | Current journey |
|---|---|
| What they can do now | Open Executive Overview, System Health, Foundation Provider, Release Evidence, Documentation Center, Demo Mode |
| Endpoint or UI | `http://localhost:5174` |
| Not yet visible | Authenticated environment editor, live log streaming, configuration write workflow |
| Needed UI | Admin workspace with Foundation login, environment management, live service polling and deployment controls |

## Clinician

| Area | Current journey |
|---|---|
| What they can do now | Review clinical module visibility, safety boundaries, AI governance evidence, and documentation-backed clinical coverage |
| Endpoint or UI | `#/clinical/modules`, `#/intelligence/ai-governance` |
| Not yet visible | Patient chart, orders, care plan, clinical review queue, encounter documentation |
| Needed UI | Clinician console after approved clinical backend workflow scope |

## Nurse

| Area | Current journey |
|---|---|
| What they can do now | Inspect workforce API visibility, staff credentialing coverage, and nursing documentation status |
| Endpoint or UI | `#/enterprise/workforce`, `http://localhost:18141/api/v3/global-workforce/docs/openapi.json` |
| Not yet visible | Shift board, patient assignment, task list, nursing documentation |
| Needed UI | Nursing/staff workspace backed by approved scheduling and assignment APIs |

## Patient

| Area | Current journey |
|---|---|
| What they can do now | No direct patient self-service journey in the current UI |
| Endpoint or UI | Patient experience visibility page: `#/clinical/patient-experience` |
| Not yet visible | Login, results, appointments, messages, care plans, proxy access |
| Needed UI | Patient portal built as a separate approved sprint |

## Laboratory User

| Area | Current journey |
|---|---|
| What they can do now | Review laboratory capability status and documentation references |
| Endpoint or UI | `#/clinical/modules` |
| Not yet visible | Orders, specimens, results, instrument workflow |
| Needed UI | Laboratory workspace after active lab service exists |

## Radiology User

| Area | Current journey |
|---|---|
| What they can do now | Review radiology capability status and documentation references |
| Endpoint or UI | `#/clinical/modules` |
| Not yet visible | Imaging orders, worklists, reports, DICOM viewers |
| Needed UI | Radiology workspace after active radiology service exists |

## Pharmacy User

| Area | Current journey |
|---|---|
| What they can do now | Review pharmacy capability status and medication safety documentation references |
| Endpoint or UI | `#/clinical/modules` |
| Not yet visible | Medication verification, dispensing, inventory, clinical pharmacy workflows |
| Needed UI | Pharmacy workspace after approved pharmacy runtime service exists |

## Finance User

| Area | Current journey |
|---|---|
| What they can do now | Review finance and revenue-cycle visibility status in enterprise modules |
| Endpoint or UI | `#/enterprise/modules` |
| Not yet visible | Claims, payments, billing queues, statements, settlement workflows |
| Needed UI | Finance workspace after active finance APIs exist |

## Compliance Officer

| Area | Current journey |
|---|---|
| What they can do now | Inspect compliance and privacy services, OpenAPI contracts, evidence, and release reports |
| Endpoint or UI | `#/enterprise/compliance-privacy`, `#/developer/api-explorer` |
| Not yet visible | Authenticated compliance case management screens |
| Needed UI | Compliance workspace with governed create/read/update forms |

## AI Governance Officer

| Area | Current journey |
|---|---|
| What they can do now | Inspect AI assurance, model risk, incidents, prompt/agent governance, autonomous-intelligence guardrails, and API contracts |
| Endpoint or UI | `#/intelligence/ai-governance`, `#/intelligence/autonomous-foundation` |
| Not yet visible | Authenticated approval queues and model review boards |
| Needed UI | AI governance workspace backed by active governance APIs |

## Developer / Operator

| Area | Current journey |
|---|---|
| What they can do now | Explore OpenAPI contracts, generate curl commands, inspect docs, run demo mode, check release evidence |
| Endpoint or UI | `#/developer/api-explorer`, `#/developer/documentation`, `#/developer/demo-mode` |
| Not yet visible | Interactive authenticated API calls from browser |
| Needed UI | Developer console with token handling and request execution |

## Overall Journey Conclusion

The operator and developer journeys are now visually supported. Clinical, patient, departmental, and finance journeys are visible as coverage maps, but their workflow screens remain future work.
