# UX + API Wiring Patch

## Web prerequisites

- Ensure Tailwind is set up.
- Add path alias `@/* -> apps/web/src/*` in `apps/web/tsconfig.json` if not present.
- No external UI deps are required for this patch (components are inline shadcn-style).

## API wiring

See `packages/api/src/ROUTES_WIRING.md` and mount the routes in your Express app.

## Next route proxies

- `/api/jd/parse` → API `/jd/parse`
- `/api/tailor` → API `/tailor`
- `/api/applications` → API `/applications` (GET/POST)
- `/api/applications/[id]/stage` → API `/applications/:id/stage`
- `/api/applications/[id]/attachments` → API `/applications/:id/attachments`
- `/api/resume/download` → API `/resume/download`

## Environment Variable

Set the API base URL for all web/API communication:

```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

This should match the port your API server is running on (default: 4000). All code and proxies should reference this variable, not a hardcoded address.

## E2E

Use your existing `test:e2e` script; ensure API + Web are running.
