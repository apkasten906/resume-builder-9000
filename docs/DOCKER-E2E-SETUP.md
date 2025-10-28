# Docker E2E Setup (resume-builder-9000)

This document describes the small, targeted changes made to support running the full Playwright E2E suite against the Docker Compose environment and how to run the tests.

## What was changed

- `packages/api/init-db.cjs` (added)
  - Idempotent initialization script that runs on container startup to ensure the SQLite schema exists (tables: `users`, `applications`, `resumes`, `schema_migrations`, `application_status_history`, `attachments`). This prevents `no such table` errors from the API when running E2E tests against containers.

- `Dockerfile.production` (modified)
  - Copies `init-db.cjs` into the image and runs it before starting the API server. This guarantees the DB schema is present when the API starts.

- `packages/api/src/routes/test-support.ts` (modified)
  - Added test-only endpoint: `POST /__test/seed-verified-user` to insert an email-verified user directly into the container DB. This endpoint is guarded by the existing test-route secret and local access checks and only enabled when `ENABLE_TEST_ROUTES=true` or `NODE_ENV=test`.

- `apps/web/tests/e2e/global-setup.ts` (modified)
  - When Playwright is configured to test against Docker (detected via `WEB_BASE`/`API_BASE`), global setup uses the container `POST /__test/seed-verified-user` endpoint (with `x-test-secret`) to ensure a verified user exists in the container DB. For local testing (non-Docker), the existing `scripts/seed-users.js` behavior is preserved.

- `scripts/reseed-playwright-user.js` (modified)
  - When `DOCKER_TESTING=true`, this helper script now calls `POST /__test/seed-verified-user` (using `TEST_ROUTE_SECRET`) to create a verified user in the container DB. When not in Docker mode it falls back to the register -> read outbox -> verify flow.

## Why these changes

- The E2E flows expect seeded, email-verified test users so login flows work without requiring manual email confirmation. When the host and container use different DB files, local seeding scripts won't affect the container DB. Seeding via the API test-support endpoints ensures the container DB has the correct users.

- Initializing the DB schema within the container ensures the API never receives requests against an uninitialized DB. This is simple and idempotent (safe for development and CI).

## How to run the E2E tests (Docker)

1. Start containers (rebuild to pick up changes):

```powershell
docker compose down; docker compose up --build -d
```

2. Run Playwright tests from the repo root (example shown uses the ports mapped in docker-compose override used for tests):

```powershell
$env:API_BASE='http://localhost:8081'
$env:WEB_BASE='http://localhost:8080'
$env:DOCKER_TESTING='true'
$env:PLAYWRIGHT_SKIP_BUILD='true' # skip local builds since containers are used
npx playwright test -c apps/web/tests/e2e/playwright.config.ts
```

Notes:

- The test-support endpoints are protected. The `TEST_ROUTE_SECRET` must match the value in your `docker-compose.override.yml` (default used in the repo: `development-test-secret-123`).
- For CI jobs, set `CI=true` and ensure the container environment has `ENABLE_TEST_ROUTES=true` and `TEST_ROUTE_SECRET` configured.

## Troubleshooting

- If tests fail with `403 Please confirm your email...` it means the verified user wasn't seeded into the container DB. Re-check that `TEST_ROUTE_SECRET` matches and that `global-setup` is running against the container API URL.

- If you see `no such table: ...` in API logs, confirm `init-db.cjs` ran (API logs show `[init-db] Database initialization complete ✓`) and that the container was rebuilt with the updated image.

## Notes for maintainers

- `init-db.cjs` is intentionally idempotent and safe to run multiple times. It is small and purpose-built for the test/dev environment.
- Do not expose test-support endpoints to production; they are guarded and only enabled when requested via env vars.

---

If you'd like, I can also add a quick `Makefile` target or an npm script that wraps the two-step `docker compose up` + `playwright` run for convenience.
