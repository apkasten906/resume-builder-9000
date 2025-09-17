# Docker + Swagger/OpenAPI Debugging Learnings

## Key Issues & Solutions

### 1. Missing Dependencies in Docker Image

- **Problem:** API container failed with `ERR_MODULE_NOT_FOUND` for `zod` (used by @rb9k/core).
- **Root Cause:** Dockerfile only installed dependencies for `packages/api`, not for `packages/core`.
- **Solution:** Patch Dockerfile to run `npm install --omit=dev` in both `core` and `api` during the runtime stage.

### 2. Swagger UI Not Showing Endpoints

- **Problem:** Swagger UI loaded but showed no endpoints or "No operations defined".
- **Root Cause:** OpenAPI spec was not being served as a direct endpoint, or spec was missing endpoints.
- **Solution:** Serve OpenAPI spec at `/api/docs/openapi.json` and configure Swagger UI to use it via `swaggerUrl`.

### 3. API Discoverability

- **Problem:** Developers visiting the root URL (`/`) saw a 404 or blank page.
- **Solution:** Add Express route to redirect `/` to `/api/docs` for instant access to API documentation.

## Best Practices Applied

- Multi-stage Docker builds for efficient, secure images.
- Install all workspace dependencies needed by runtime code.
- Serve OpenAPI spec as a dedicated endpoint for Swagger UI.
- Use code-first OpenAPI generation with zod-openapi for type safety.
- Redirect root traffic to docs for developer experience.

## Troubleshooting Tips

- Always check container logs for missing dependencies and runtime errors.
- Validate OpenAPI spec endpoint directly in browser or with curl.
- Use Dockerfile multi-stage builds to separate build and runtime dependencies.
- If Swagger UI is blank, check spec endpoint, browser console, and Docker networking.

## Next Steps

- Add automated API endpoint tests (Supertest + Vitest recommended).
- Document further learnings as new issues arise.

---

_Last updated: 2025-09-15_
