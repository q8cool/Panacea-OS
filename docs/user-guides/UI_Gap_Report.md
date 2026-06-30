# UI Gap Report

Audit date: 2026-06-30
Sprint context: Sprint 101 web platform

## Final Classification

Panacea OS v4.0 is now both:

- A backend/API platform.
- A professional operator-facing web platform.

It is not yet a full set of role-specific hospital applications.

## UI Search Results

| Area checked | Result |
|---|---|
| `apps` directory | `apps/panacea-web` exists |
| Frontend app | YES, Vite + TypeScript app |
| Admin console | Partial: operator/admin visibility console exists; full admin workflow console is future work |
| Clinician console | NO role-specific clinical care console |
| Patient portal | NO patient self-service portal |
| Nurse console | NO role-specific nursing console |
| Laboratory console | NO role-specific laboratory console |
| Radiology console | NO role-specific radiology console |
| Pharmacy console | NO role-specific pharmacy console |
| Finance console | NO role-specific finance console |
| Dashboard UI | YES, executive overview, system health, release evidence, module views |
| API explorer UI | YES, bundled OpenAPI explorer over generated contract data |
| Swagger/OpenAPI UI | OpenAPI explorer is custom; Swagger UI is not bundled |
| Documentation UI | YES, Documentation Center renders repository Markdown |

## What Works Now

Run:

```sh
npm run web:dev
```

Open:

```text
http://localhost:5174
```

Working UI pages:

- Executive Overview.
- System Health.
- Command Intelligence.
- Foundation Provider.
- Clinical Modules.
- Enterprise Modules.
- Workforce.
- Legal & Governance.
- Compliance & Privacy.
- Customer Success.
- Product Management.
- AI & Governance.
- Autonomous Intelligence.
- New Innovations.
- API Explorer.
- Documentation Center.
- Demo Mode.
- Release Evidence.
- Legacy Coverage.
- User Journeys.

## Remaining UI Gaps

| Gap | Impact | Recommended future work |
|---|---|---|
| Role-specific clinical care UI | Clinicians cannot chart, review patient records, enter orders, or manage direct care workflows through a dedicated UI | Build clinician console only after approved clinical backend workflows exist |
| Patient portal | Patients cannot log in for results, appointments, care plans, or messages through this app | Build patient portal as a separate approved sprint |
| Workflow write screens | Current UI is mostly evidence, discovery, and contract-driven | Add governed write forms after backend authorization and validation rules are approved |
| Authenticated session management | Current UI is operator/demo oriented | Add Foundation-backed login, token handling, and role-specific navigation |
| Live service probes for all local services | UI lists URLs; local services must be started separately | Add runtime health polling after CORS and auth policies are finalized |
| Full Swagger/Redoc rendering | Current explorer is a professional custom explorer, not a complete OpenAPI renderer | Optional future integration with Scalar, Swagger UI, or Redoc |

## Current User Visibility

| Visibility type | Status |
|---|---|
| Working UI exists | YES |
| UI shell only | NO, the app renders data-driven pages and tests pass |
| API-only system | NO, now web plus API |
| Full visual hospital application | NO |

## Conclusion

Sprint 101 closes the critical operator visibility gap. The next UI work should focus on authenticated user sessions and role-specific workflow consoles, not new backend healthcare capabilities.
