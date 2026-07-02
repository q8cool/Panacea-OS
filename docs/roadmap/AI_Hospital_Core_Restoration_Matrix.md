# AI Hospital Core Restoration Matrix

Audit date: 2026-07-02

Source archive: `/Users/faisalalkandari/Desktop/ai-hospital-core.zip`

Current Panacea branch: `develop/v4.0`

Foundation baseline preserved: commit `d378cb5` remains the authentication baseline for Argon2-backed Foundation login. The restoration does not weaken Foundation Auth, tenant isolation, audit, or clinician approval controls.

## Scope

This matrix compares the executable legacy `ai-hospital-core` archive with the restored Panacea OS v4 implementation. Build artifacts and local runtime folders from the archive were not copied: `node_modules`, `.venv-stack`, `.next`, `.logs`, `.runlogs`, `__MACOSX`, and generated build output were excluded.

## Restoration Matrix

| # | Old feature name | Old path / file / service / component | Current Panacea equivalent | Status | Test command or UI route proving it works | Remaining gap |
|---:|---|---|---|---|---|---|
| 1 | Patient registration | `apps/patient_service/app/routers/patients.py`; `apps/frontend_web/src/app/patients/new/page.tsx` | `POST /api/v4/global-command-intelligence/operational-core/patients`; `#/hospital-core` Patient Registration form | Restored | `node --test tests/real-time-global-healthcare-command-intelligence-platform/write-workflows.test.mjs`; `npm run web:check` | Import of legacy database rows remains an operator migration task. |
| 2 | Patient list | `GET /patients`; `apps/frontend_web/src/app/patients/page.tsx` | `GET /read-models/clinical/patients`; `#/hospital-core` Patient List route | Restored | `#/hospital-core`; `npm run web:check` | Full grid filtering can be expanded later. |
| 3 | Patient profile | `GET /patients/{patient_id}`; `apps/frontend_web/src/app/patients/[id]/page.tsx` | `GET /read-models/clinical/patients/{patientId}`; patient profile route card | Restored | `#/hospital-core`; `#/workspace/doctor/patient-profile/patient-px-001` | Legacy visual chart widgets can be refined without changing backend behavior. |
| 4 | Patient file/timeline | `patient_file_backend.py`; `timeline.py`; patient file UI | `GET /read-models/clinical/patients/{patientId}/timeline`; projections from write workflows | Restored | `node --test tests/real-time-global-healthcare-command-intelligence-platform/write-workflows.test.mjs` | Timeline rendering is operational but can gain richer grouping. |
| 5 | Upload medical files | `patient_service/app/routers/files.py`; `file_intelligence.py` ingest route | `POST /operational-core/patients/{patientId}/files`; `#/hospital-core` Upload Medical File | Restored | `#/hospital-core`; backend write workflow test | Binary object storage integration remains deployment-specific. |
| 6 | Analyze uploaded reports | `file_intelligence.py` analyze route; `clinical_file_engine.py` | `POST /operational-core/patients/{patientId}/files/analyze`; `POST /reports/analyze` | Restored | `#/hospital-core`; OpenAPI paths in generated contract | Model provider output remains governed evidence, not autonomous decisioning. |
| 7 | PDF text extraction | `file_intelligence.py` `pdf_text`; `frontend_web/tools/advanced_extract.py` | `POST /operational-core/patients/{patientId}/files/{fileId}/extract` | Restored | OpenAPI route and write workflow test | Runtime PDF/OCR binaries are not bundled into the browser; extraction metadata is captured by the backend workflow. |
| 8 | OCR fallback where available | `pytesseract`; `apple_vision_ocr.swift`; `medical_file_runtime.py` | Extraction method field records `OCR fallback`; governed event `clinical.file.extracted` | Restored | `#/hospital-core` PDF Text Extraction form | Actual OCR engine selection is deployment policy. |
| 9 | Patient-isolated AI chat | `patient_service/app/routers/chat.py` `POST /patients/{patient_id}/chat` | `POST /operational-core/patients/{patientId}/chat`; patient-scoped chat read model | Restored | `#/hospital-core`; `#/workspace/doctor/patient-ai-chat` | Conversation summarization can be expanded after governance review. |
| 10 | Global AI chat | `POST /chat/general`; old general chat page | `POST /operational-core/chat`; global chat read model | Restored | `#/hospital-core`; `#/workspace/doctor/global-ai-chat` | None for governed chat logging. |
| 11 | Clinical reasoning workflow | `clinical_core/app/engines/*`; `clinical_loop.py`; `unified_assessment.py` | `POST /operational-core/patients/{patientId}/clinical-reasoning`; clinical reasoning read model | Restored | Backend write workflow test; `#/hospital-core` | Advanced evidence graph UI remains a roadmap enhancement. |
| 12 | Lab/report interpretation | `medical_data_service` lab routers; file case review UI | `POST /operational-core/patients/{patientId}/reports/analyze`; clinical labs projection | Restored | `#/hospital-core`; `GET /read-models/clinical/patients/{patientId}/labs` | External LIS feed remains deployment integration. |
| 13 | Radiology/report interpretation | `medical_data_service` radiology routers; report UI | `POST /operational-core/patients/{patientId}/reports/analyze`; clinical radiology projection | Restored | `#/hospital-core`; `GET /read-models/clinical/patients/{patientId}/radiology` | External PACS/DICOM viewer remains governed external integration. |
| 14 | Prescription workflow | `patient_service/app/routers/prescriptions.py` | `POST /operational-core/patients/{patientId}/prescriptions`; approve route retained | Restored | `#/hospital-core`; backend write workflow test | Electronic prescribing gateway integration requires production approval. |
| 15 | Treatment/order workflow | `orders_service/app/main.py`; API gateway orders router | `POST /operational-core/patients/{patientId}/orders`; treatment order routes retained | Restored | `#/hospital-core`; `GET /read-models/clinical/patients/{patientId}/orders` | External order fulfillment remains site-specific. |
| 16 | Doctor approval boundary | `doctor_review.py`; `verification_gate.py`; prescription approve routes | Workflow controls: human approval, no autonomous diagnosis, no autonomous treatment | Restored | `npm run test:run`; write workflow validation rejects unsafe controls | None. |
| 17 | Pharmacy safety workflow | `pharmacy_safety_service/app/interfaces/api/safety_router.py` | `POST /operational-core/patients/{patientId}/pharmacy-safety/check`; pharmacy review projections | Restored | `#/hospital-core`; backend write workflow test | Full drug database connection remains external. |
| 18 | Orders service workflow | `apps/orders_service/app/main.py` CRUD/status/timeline | Governed order write events and clinical order read model | Restored | `#/hospital-core`; `GET /read-models/clinical/patients/{patientId}/orders` | Export/import endpoints were not copied; modern data export should be governed separately. |
| 19 | Workflow advance route | `workflow_service` transitions router | `POST /operational-core/patients/{patientId}/workflow/advance` | Restored | `#/hospital-core`; `#/workspace/doctor/workflow-actions` | Visual workflow designer remains separate product work. |
| 20 | Arabic medical translation route | `file_intelligence.py` translate route; `TranslateReportButton.tsx` | `POST /operational-core/patients/{patientId}/reports/translate` | Restored | `#/hospital-core`; OpenAPI route | Translation provider validation remains governed by deployment configuration. |
| 21 | Audit trail | `audit_service`; `AuditViewer.tsx` | Write workflow audit rows, event review, projection review, admin audit read model | Restored | `#/command/transaction-review`; `#/hospital-core` Audit Trail link | External SIEM export remains deployment-specific. |
| 22 | Notification workflow | `notification_service`; settings notification page | `POST /operational-core/patients/{patientId}/notifications`; notification read model | Restored | `#/hospital-core`; backend write workflow test | SMS/email provider credentials are not stored in Git. |
| 23 | API gateway routing | `apps/api_gateway/app/main.py` proxy and combined routers | Nginx + versioned API route family under `https://api.panacea.utbe.ai/api/v4/global-command-intelligence` | Restored | `npm run openapi`; live service health checks | Legacy unversioned paths are modernized to versioned API paths. |
| 24 | Operational frontend pages | `apps/frontend_web/src/app/patients`, `orders`, `reports`, `general-chat`, `medical-chat`, `audit` | Restored `#/hospital-core` plus role workspaces | Restored | `npm run web:check`; `#/hospital-core` | Additional visual refinements may continue without changing workflow semantics. |
| 25 | Backend services from old apps directory | `patient_service`, `clinical_core`, `orders_service`, `pharmacy_safety_service`, `workflow_service`, `medical_data_service`, `knowledge_service`, `audit_service`, `notification_service`, `api_gateway` | Modernized into the PostgreSQL-backed command intelligence runtime with OpenAPI, events, audit, and projections | Restored | `npm run test:run`; `npm run openapi` | Services were not copied as separate legacy Python processes. |
| 26 | Contracts/packages from old packages directory | `auth_sdk`, `tenant_sdk`, `event_sdk`, `patient_contracts`, `clinical_contracts`, `core_types`, `logging_sdk` | Foundation Auth client, tenant headers, event outbox semantics, generated OpenAPI schemas, TypeScript type contracts | Restored | `npm run check`; `npm run web:check`; `npm run openapi` | Legacy package names were not preserved; concepts are implemented in modern packages/contracts. |

## Final Restoration Target

The restored product entry is:

- Web: `https://panacea.utbe.ai/#/hospital-core`
- API: `https://api.panacea.utbe.ai`
- Foundation: `https://foundation.utbe.ai`

Clinical safety remains enforced: no autonomous diagnosis, no autonomous treatment, no autonomous prescribing, and no clinical operation without authenticated roles, tenant isolation, audit evidence, and human approval boundaries.
