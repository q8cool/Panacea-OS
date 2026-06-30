# Legacy Feature Coverage Matrix

Audit date: 2026-06-30
Sprint context: Sprint 101 web platform

## Scope And Evidence

The repository contains limited legacy source structure under `ai-hospital-core`, but not a complete runnable legacy application. This matrix compares the named legacy capability areas against Panacea OS v4.0 active runtime services, documentation, Foundation Provider validation, and the new `apps/panacea-web` operator UI.

## Coverage Matrix

| Legacy item | Coverage classification | Panacea OS v4.0 evidence | Notes |
|---|---|---|---|
| `frontend_web` | Replaced / upgraded | `apps/panacea-web` | Replaced by professional operator web platform with dashboard, service visibility, API explorer, docs, release evidence, legacy coverage, innovations, and demo mode |
| `patient_service` | Documentation-backed / missing active runtime | Patient portal and patient experience docs | No active patient service in this checkout |
| `identity_service` | Replaced | Live Foundation Provider, provider wiring, JWT/JWKS configuration, RBAC/ABAC tests | Identity is externalized to Foundation provider contracts rather than a local identity service |
| `clinical_core` | Documentation-backed / missing active runtime | Empty legacy folder plus clinical docs | Active v4 services avoid diagnosis and treatment execution |
| `medical_data_service` | Documentation-backed | Medical data appears in reports and historical docs | No active medical data service |
| `pharmacy_safety_service` | Documentation-backed | Safety constraints and pharmacy safety references in docs | No active pharmacy safety service |
| `knowledge_service` | Documentation-backed | Knowledge graph and global knowledge docs | No active knowledge service |
| `workflow_service` | Replaced / documentation-backed | Governance workflow concepts in active services | No standalone workflow service |
| `audit_service` | Upgraded / embedded | Service audit tables and Foundation audit append validation | No standalone audit service source in this checkout |
| `notification_service` | Referenced only | Notification integration references in service docs | No active notification service |
| `api_gateway` | Partially replaced | Web API Explorer and service-local OpenAPI endpoints | No gateway service; APIs remain service-local |
| `orders_service` | Missing active runtime | No orders API in active services | Not active in v4 checkout |
| `security` | Upgraded / embedded | RBAC, ABAC, tenant isolation, Foundation provider, security docs | Security is embedded in services and external provider contracts |
| `integrations` | Upgraded / embedded | Integration references in active services and release evidence | No standalone integration hub runtime |
| `deployment` | Upgraded | Dockerfiles, Docker Compose, Kubernetes manifests, CI, runtime validation, release evidence | Strong deployment evidence |
| `hospital_connection` | Documentation-backed / missing active runtime | Global command service models hospital context | No dedicated hospital connection service |
| `network` | Documentation-backed / partial | Global healthcare network plans and docs | No active global network registry service |

## Preserved Or Upgraded Capabilities

- Deployment packaging and runtime validation.
- Auditability and event evidence.
- Security controls through RBAC, ABAC, tenant context, and Foundation Provider configuration.
- Governance workflows across active v3/v4 services.
- OpenAPI contracts.
- Documentation and release evidence.
- Visual operator access through `apps/panacea-web`.

## Missing Active Runtime Areas

- Direct patient service.
- Direct clinical core care workflows.
- Medical data service.
- Laboratory and radiology workflow services.
- Pharmacy runtime service.
- Orders.
- API gateway.
- Patient portal.
- Standalone notification service.

## Conclusion

Panacea OS v4.0 preserves legacy intent through a stronger release, governance, API, and operator-visibility foundation. It does not preserve every legacy clinical runtime service in executable form in this checkout.
