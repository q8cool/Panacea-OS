# Visual Demo Guide

## Demo Goal

Show Panacea OS v4.0 as a visible, professional platform without adding new backend behavior.

## Start Demo

```sh
npm run web:dev
```

Open:

```text
http://localhost:5174
```

## Recommended Walkthrough

1. **Executive Overview**
   - Show official release status.
   - Show active service count.
   - Show OpenAPI and test evidence.
   - Show Foundation Provider status.

2. **System Health**
   - Show the active runtime services.
   - Point out health, readiness, metrics, and OpenAPI URLs.
   - Start Docker Compose if live local service checks are required.

3. **API Explorer**
   - Search for `live`.
   - Filter by `GET`.
   - Open an endpoint detail panel.
   - Copy the generated safe curl command.

4. **Foundation Provider**
   - Show `https://foundation.utbe.ai`.
   - Run the browser probe if CORS permits it.
   - Explain audit append and policy evaluation require credentials for write tests.

5. **Clinical Modules**
   - Explain that clinical areas are visible as coverage status.
   - Confirm no autonomous diagnosis or treatment workflows are added.

6. **Release Evidence**
   - Show official closure, CI, validation, and tag evidence.

7. **Legacy Coverage**
   - Show what was preserved, upgraded, replaced, or missing from legacy scope.

8. **New Innovations**
   - Show the web platform, Foundation Provider, runtime validation, AI assurance, command intelligence, compliance, privacy, and evidence stack.

## Demo Boundaries

- Use only test tenant examples.
- Do not enter patient information.
- Do not claim missing role-specific screens exist.
- Do not claim documentation-backed modules are active runtime services.
- Keep all clinical and AI workflows advisory and governed.

## Backend Demo Add-On

```sh
docker compose -f infra/docker-compose/runtime/docker-compose.yml up --build -d
```

Then refresh **System Health** and use listed runtime URLs.
