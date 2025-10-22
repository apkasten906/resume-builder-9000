# Web frontend environment variables

Where to put variables

- Local development: `apps/web/.env.local` (loaded by Next.js). This file should not be committed.
- Example file for teammates: `apps/web/.env.example` (safe to commit, no secrets).

Recommended vars for local dev

- `NODE_ENV=development`
- `ENABLE_TEST_ROUTES=true`
- `TEST_ROUTE_SECRET=<generated-by-dev-script-or-manual>`
- `API_BASE=http://localhost:4000`
- `WEB_BASE=http://localhost:3000`

CI / Production

- In CI, set `NODE_ENV=test` and provide `TEST_ROUTE_SECRET` and `ENABLE_TEST_ROUTES` via pipeline env vars or secrets.
- For production, ensure `ENABLE_TEST_ROUTES` is false or unset (test routes are opt-in and should not be exposed in prod).

Notes

- `dev.ps1` can generate a session `TEST_ROUTE_SECRET` and persist it to the repo root `.env` when run with `-PersistTestSecret`.
- The API process reads repo-root `.env` first; the web process reads `apps/web/.env.local`.
