# Panacea UI Service Integration Matrix

Generated: 2026-07-01T06:07:01.266Z

| Platform | Backend exists | OpenAPI exists | UI page exists | Live API connected | Auth tested | CORS tested | Demo fallback | Production readiness | Action required |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Foundation | external foundation provider + repository auth provider | external contract | /auth/login, /command/foundation-provider | PARTIAL | PARTIAL | PARTIAL | YES | 70% | Deploy Sprint 106 auth routes |
| Clinical Core | NO active runtime | NO | /clinical/modules, doctor workspace | NO | NO | NO | YES | 25% | Needs approved backend integration |
| Medical Data | NO active runtime | NO | doctor/patient workspaces | NO | NO | NO | YES | 25% | Needs approved read APIs |
| Laboratory | NO active runtime | NO | laboratory workspace | NO | NO | NO | YES | 25% | Needs lab service/read APIs |
| Radiology | NO active runtime | NO | radiology workspace | NO | NO | NO | YES | 25% | Needs radiology/PACS integration |
| Pharmacy | NO active runtime | NO | pharmacy workspace | NO | NO | NO | YES | 25% | Needs pharmacy APIs |
| Scheduling | NO active runtime | NO | patient/admin docs | NO | NO | NO | YES | 20% | Needs scheduling service |
| Emergency | Docs + command status | NO dedicated | clinical docs/command | NO dedicated | NO | NO | YES | 35% | Needs approved emergency APIs |
| Inpatient | Docs only | NO | clinical docs | NO | NO | NO | YES | 20% | Needs inpatient APIs |
| ICU | Docs + command status | NO dedicated | clinical docs/command | NO dedicated | NO | NO | YES | 35% | Needs ICU APIs |
| Surgery | Docs + command status | NO dedicated | clinical docs/command | NO dedicated | NO | NO | YES | 30% | Needs surgery APIs |
| Nursing | Docs + workforce service | PARTIAL | clinical docs/workforce | PARTIAL | NO live browser | NO live browser | YES | 45% | Connect nursing read models |
| Outpatient | Docs only | NO | clinical docs | NO | NO | NO | YES | 20% | Needs outpatient APIs |
| Blood Bank | Docs only | NO | clinical modules | NO | NO | NO | YES | 20% | Needs blood bank APIs |
| Infection Control | Docs only | NO | clinical modules | NO | NO | NO | YES | 20% | Needs infection control APIs |
| Billing | Docs only | NO | patient invoices/admin docs | NO | NO | NO | YES | 20% | Needs finance service |
| Inventory | Docs only | NO | pharmacy/admin docs | NO | NO | NO | YES | 20% | Needs inventory service |
| Analytics | Docs only | NO | dashboards/docs | NO | NO | NO | YES | 30% | Needs analytics service |
| Quality | Docs only | NO | clinical/enterprise docs | NO | NO | NO | YES | 25% | Needs quality APIs |
| Research | Docs only | NO | innovation/docs | NO | NO | NO | YES | 25% | Needs research APIs |
| Telemedicine | Docs only | NO | patient workspace | NO | NO | NO | YES | 20% | Needs telemedicine service |
| Patient Portal | UI shell + privacy service | PARTIAL | patient workspace | PARTIAL | NO live protected | NO live protected | YES | 45% | Connect patient APIs |
| Population Health | Docs only | NO | clinical docs | NO | NO | NO | YES | 20% | Needs population APIs |
| Enterprise Integration | Docs/contracts | NO dedicated | API explorer/docs | NO dedicated | NO | NO | PARTIAL | 35% | Needs integration hub service |
| AI Foundation | AI assurance + autonomous governance services | YES partial | AI governance/intelligence pages | OPENAPI_ONLY | TESTED repo | NO live browser | PARTIAL | 65% | Live CORS/auth endpoint tests |
| Knowledge Graph | Docs only | NO | innovation/docs | NO | NO | NO | YES | 25% | Needs knowledge APIs |
| Clinical Reasoning | Governance docs only, no autonomous diagnosis | NO dedicated | doctor AI viewer/docs | NO live records | NO | NO | YES | 30% | Approved advisory read APIs only |
| Multi-Agent | Docs only | NO | AI docs | NO | NO | NO | YES | 20% | Needs governance-only APIs if approved |
| Prediction | Docs only | NO | innovation/docs | NO | NO | NO | YES | 20% | Needs prediction governance APIs |
| Digital Twin | Docs only | NO | innovation/docs | NO | NO | NO | YES | 25% | Needs simulation read APIs |
| Learning | Docs only | NO | innovation/docs | NO | NO | NO | YES | 25% | Needs governed learning APIs |
| Security | Service security layers + docs | YES in service contracts | admin/security/docs | OPENAPI_ONLY | TESTED repo | NO live browser | PARTIAL | 70% | Live auth/CORS proof |
| Privacy | YES | YES | /enterprise/compliance-privacy, patient workspace | OPENAPI_ONLY/PARTIAL | TESTED repo | NO live browser | YES | 70% | Connect browser read models |
| Compliance | YES | YES | /enterprise/compliance-privacy | OPENAPI_ONLY | TESTED repo | NO live browser | PARTIAL | 70% | Connect browser read models |
| Admin | YES via active enterprise services | YES | administrator workspace/system health | PARTIAL | TESTED repo | NO live browser | YES | 60% | Add live admin read models after auth |
| Developer/API Explorer | YES docs/OpenAPI | YES | /developer/api-explorer | OPENAPI_ONLY | N/A | N/A | N/A | 85% | Optional authenticated executor later |
