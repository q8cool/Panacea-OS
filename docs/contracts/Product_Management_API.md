# Product Management API

The Product Management API exposes Sprint 76 product governance endpoints under `/api/v3/global-product-management`.

Endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v3/global-product-management/products/registries` | Product Registry |
| `POST /api/v3/global-product-management/products/modules` | Product Module Registry |
| `POST /api/v3/global-product-management/products/capabilities` | Product Capability Registry |
| `POST /api/v3/global-product-management/products/features` | Feature Registry |
| `POST /api/v3/global-product-management/products/feature-lifecycle` | Feature Lifecycle |
| `POST /api/v3/global-product-management/products/feature-ownership` | Feature Ownership |
| `POST /api/v3/global-product-management/products/feature-dependencies` | Feature Dependency Mapping |
| `POST /api/v3/global-product-management/products/feature-status` | Feature Status Tracking |

Every request requires identity, RBAC, ABAC, tenant isolation, product governance permissions, audit controls, policy approval, workflow controls, and evidence.
