````markdown
# Test-support endpoints (guarded debug / seed routes)

This document describes the API endpoints that exist to make end-to-end (E2E) testing deterministic. They are intentionally opt-in and protected — only enable them when running tests (local dev or CI).

## Overview

- Purpose: Provide deterministic seeding, cleanup and visibility for Playwright tests (for example: seeding a verified test user, clearing and reading a test email outbox, and removing test users).
- Safety: Routes are only mounted when either `NODE_ENV==='test'` or `ENABLE_TEST_ROUTES==='true'`.
- Authorization: Calls must include the header `x-test-secret: <value>` matching `process.env.TEST_ROUTE_SECRET`. When `DOCKER_TESTING=true` the API also allows requests from Docker gateway IPs per `TEST_TRUSTED_SUBNET`.

## Why use these endpoints

1. Deterministic seeding: avoids intermittent failures caused by leftover test data.
2. Safe teardown: remove test users and application data before and after test runs.
3. Visibility: read the in-memory email outbox so tests can assert verification tokens without hitting an SMTP server.

## Key endpoints

All endpoints are rooted under `POST|GET /__test/...` on the API server (example base: `http://localhost:4001`). Replace `REPLACE_WITH_TEST_ROUTE_SECRET` with your secret.

# Test-support endpoints (guarded debug / seed routes)

This document describes the API endpoints that exist to make end-to-end (E2E) testing deterministic. They are intentionally opt-in and protected — only enable them when running tests (local dev or CI).

## Overview

- Purpose: Provide deterministic seeding, cleanup and visibility for Playwright tests (for example: seeding a verified test user, clearing and reading a test email outbox, and removing test users).
- Safety: Routes are only mounted when either `NODE_ENV==='test'` or `ENABLE_TEST_ROUTES==='true'`.
- Authorization: Calls must include the header `x-test-secret: <value>` matching `process.env.TEST_ROUTE_SECRET`. When `DOCKER_TESTING=true` the API also allows requests from Docker gateway IPs per `TEST_TRUSTED_SUBNET`.

## Why use these endpoints

1. Deterministic seeding: avoids intermittent failures caused by leftover test data.
2. Safe teardown: remove test users and application data before and after test runs.
3. Visibility: read the in-memory email outbox so tests can assert verification tokens without hitting an SMTP server.

## Key endpoints

All endpoints are rooted under `POST|GET /__test/...` on the API server (example base: `http://localhost:4001`). Replace `REPLACE_WITH_TEST_ROUTE_SECRET` with your secret.

- POST /\_\_test/seed-verified-user
  - Body: { "email": string, "password": string }
  - Creates a user with email confirmed. Returns 201 on success.

- POST /\_\_test/seed-unverified-user
  - Body: { "email": string, "password": string }
  - Creates a user without confirming email (used to test resend flows).

- POST /\_\_test/delete-user
  - Body: { "email": string }
  - Deletes a user by email.

- POST /\_\_test/cleanup-playwright-users
  - Body: none
  - Deletes accounts created by Playwright patterns (e.g., emails starting with `playwright-`). Useful for sweeping leftover accounts.

- GET /\_\_test/user-exists?email=EMAIL
  - Query param `email` — returns 200 and JSON `{ exists: true }` or `{ exists: false }`.

# Test-support endpoints (guarded debug / seed routes)

This document describes the API endpoints that exist to make end-to-end (E2E) testing deterministic. They are intentionally opt-in and protected — only enable them when running tests (local dev or CI).

## Overview

- Purpose: Provide deterministic seeding, cleanup and visibility for Playwright tests (for example: seeding a verified test user, clearing and reading a test email outbox, and removing test users).
- Safety: Routes are only mounted when either `NODE_ENV==='test'` or `ENABLE_TEST_ROUTES==='true'`.
- Authorization: Calls must include the header `x-test-secret: <value>` matching `process.env.TEST_ROUTE_SECRET`. When `DOCKER_TESTING=true` the API also allows requests from Docker gateway IPs per `TEST_TRUSTED_SUBNET`.

## Why use these endpoints

1. Deterministic seeding: avoids intermittent failures caused by leftover test data.
2. Safe teardown: remove test users and application data before and after test runs.
3. Visibility: read the in-memory email outbox so tests can assert verification tokens without hitting an SMTP server.

## Key endpoints

All endpoints are rooted under `POST|GET /__test/...` on the API server (example base: `http://localhost:4001`). Replace `REPLACE_WITH_TEST_ROUTE_SECRET` with your secret.

- POST /\_\_test/seed-verified-user
  - Body: { "email": string, "password": string }
  - Creates a user with email confirmed. Returns 201 on success.

- POST /\_\_test/seed-unverified-user
  - Body: { "email": string, "password": string }
  - Creates a user without confirming email (used to test resend flows).

- POST /\_\_test/delete-user
  - Body: { "email": string }
  - Deletes a user by email.

- POST /\_\_test/cleanup-playwright-users
  - Body: none
  - Deletes accounts created by Playwright patterns (e.g., emails starting with `playwright-`). Useful for sweeping leftover accounts.

- GET /\_\_test/user-exists?email=EMAIL
  - Query param `email` — returns 200 and JSON `{ exists: true }` or `{ exists: false }`.

- GET /\_\_test/count-users
  - Returns a small JSON object with current users count: `{ count: <number> }` — helpful to poll for cleanup completion.

- GET /\_\_test/emails
  - Returns the in-memory test email outbox (array of messages). Use in Playwright to read verification tokens.

- POST /\_\_test/clear-emails
  - Clears the in-memory outbox.

- POST /clear-applications
  - Clears application/resume-related tables used by tests.

## Example usage (curl)

```bash
curl -s -X POST \
  -H "x-test-secret: REPLACE_WITH_TEST_ROUTE_SECRET" \
  http://localhost:4001/__test/cleanup-playwright-users

curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-test-secret: REPLACE_WITH_TEST_ROUTE_SECRET" \
  -d '{"email":"playwright-1@example.com","password":"ValidPassword1!"}' \
  http://localhost:4001/__test/seed-verified-user

curl -s -H "x-test-secret: REPLACE_WITH_TEST_ROUTE_SECRET" http://localhost:4001/__test/emails
```

## Recommended Playwright sequence

1. (Optional) Call `POST /__test/cleanup-playwright-users` then poll `GET /__test/count-users` until the count is low/zero — this avoids race conditions when a database file is shared across processes or when previous runs left data behind.
2. POST `/clear-applications` to remove residual application/resume rows.
3. POST `/__test/clear-emails` to reset the outbox.
4. POST `/__test/delete-user` for the default user email if present (for example `user@example.com`).
5. POST `/__test/seed-verified-user` to create the verified account your Playwright tests expect.
6. Run tests that read `/__test/emails` to inspect verification tokens.

## Security and best practices

- Never commit `TEST_ROUTE_SECRET` to source control. Use CI secret stores for automated runs.
- Prefer ephemeral session secrets for local development. Use `dev.ps1 -PersistTestSecret` only when you intend to keep a secret in a local `.env` file that is NOT committed.
- Only enable `ENABLE_TEST_ROUTES` in CI or controlled developer machines while running tests.
- Limit `TEST_TRUSTED_SUBNET` where possible to reduce risk when running containers on shared hosts.

## Related docs

- `docs/testing/playwright-guidelines.md` — test execution guidelines and mode descriptions.
- `docs/db-path-resolution.md` — database path resolution rules and Windows notes.

If you update or add new test-support routes, please update this document and add a small unit test that verifies `ensureTestAccess()` authorization behavior.
````
