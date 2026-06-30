# UI Runbook

## Local Development

```sh
npm --prefix apps/panacea-web install
npm run web:dev
```

Open:

```text
http://localhost:5174
```

## Production Build

```sh
npm run web:build
```

Preview:

```sh
npm run web:preview
```

## Validation

```sh
npm run web:check
npm run web:build
```

Repository gates:

```sh
npm run check
npm run test:run
npm run openapi
```

## Data Generator

```sh
npm --prefix apps/panacea-web run generate:data
```

The generator scans:

- `services/`
- `docs/`
- OpenAPI JSON documents.
- release evidence.
- Git branch and commit metadata.
- Docker Compose service ports.

Generated data is not committed. It is recreated by the web scripts.

## Troubleshooting

| Symptom | Action |
|---|---|
| App cannot load data | Run `npm --prefix apps/panacea-web run generate:data` |
| Port 5174 unavailable | Use the alternate URL printed by Vite |
| Foundation browser probe blocked | Check release evidence or test with curl; CORS can block browser probes |
| Local service URLs do not respond | Start Docker Compose runtime |
| OpenAPI list appears stale | Run `npm run openapi` and then `npm run web:dev` |

## Operational Boundary

This UI is a visibility and demo layer. It should not be used as a clinical care application until future authenticated role workflows are explicitly approved and implemented.
