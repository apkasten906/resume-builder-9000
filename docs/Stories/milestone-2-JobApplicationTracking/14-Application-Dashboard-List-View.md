# [Story] Application Dashboard / List View (#14)

**Status:** Open  
**Created:** 2025-10-10

> **Project:** Resume Builder 9000 — Job Application Tracking
> **Aligned with:** `/docs/adr/*` (monorepo, SQLite), `/docs/app-workflow.md`, `/docs/testing/e2e-testing-guidelines.md`
> **Tech Constraints:** Next.js (apps/web), Node API (apps/api), SQLite via better-sqlite / Prisma (packages/db), TypeScript strict, Playwright E2E, Vitest unit, ESLint monorepo plugin.
> **Pattern:** Vertical slice — DB → API → UI → Tests → Telemetry.
> **Auth:** JWT (HTTP-only cookie).
> **A11y:** WCAG 2.2 AA, keyboard-first.
> **Observability:** Pino logger, request-id correlation, basic metrics hook (timers + counters).
> **i18n:** Strings via `packages/i18n`.

## Summary

Implement a paginated, filterable, sortable list of job applications with quick actions (view, edit, status change, delete).

## Scope

- Paginated table with columns: Company, Role, Location, Status, Last Updated, Salary (optional), Actions
- Client-side filters: status, company (typeahead), date range
- Sort by: Last Updated (default desc), Company, Status
- Inline status changer (select) and delete (confirmation modal)
- Empty state + error state
- Preserve filters/sort in URL query params

## Out of Scope

- Bulk import/export
- Analytics charts

## Allowed Paths (Copilot may touch)

- apps/web/app/(app-tracking)/applications/page.tsx
- apps/web/components/applications/\*
- apps/api/src/routes/applications/\*
- packages/db/\*
- apps/web/tests/e2e/applications/\*

## Forbidden Paths (do not touch)

- apps/web/app/(resume)/\*\*
- apps/api/src/routes/auth/\*\*

## Data Model / Migration

```sql
-- Migration sketch (convert to Prisma migration if using Prisma)

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'APPLIED', -- enum-ish
  salary_min INTEGER, -- cents
  salary_max INTEGER, -- cents
  currency TEXT DEFAULT 'EUR',
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_applications_updated_at ON applications(updated_at DESC);

```

## API Surface

### GET /api/applications

- **Purpose:** List applications with pagination/filter/sort
- **Auth:** Required (JWT)
- **Request:** `query: {page?:number, pageSize?:number, status?:string, q?:string, sort?:'updated_at:desc'|'company:asc'|'status:asc'}`
- **Response:** `{items: Application[], page: number, pageSize: number, total: number}`
- **Errors:** 401, 500
- **Handler:** `apps/api/src/routes/applications/list.ts`

### PATCH /api/applications/:id/status

- **Purpose:** Update status inline from the dashboard
- **Auth:** Required (JWT)
- **Request:** `{status:'APPLIED'|'INTERVIEW'|'OFFER'|'REJECTED'}`
- **Response:** `{ok:true, item: Application}`
- **Errors:** 400, 401, 404
- **Handler:** `apps/api/src/routes/applications/update-status.ts`

### DELETE /api/applications/:id

- **Purpose:** Delete application from actions menu
- **Auth:** Required (JWT)
- **Request:** `{}`
- **Response:** `{ok:true}`
- **Errors:** 401, 404, 409 if has dependent rows
- **Handler:** `apps/api/src/routes/applications/delete.ts`

## UI Work

- **Route:** `/applications`
  - **File:** `apps/web/app/(app-tracking)/applications/page.tsx`
  - **Components:** ApplicationsTable, StatusPill, StatusSelect, ConfirmDeleteDialog, FiltersBar, Pagination
  - **States:** loading, empty, error, with-data
  - **A11y:** Table roles, focus trap in dialog, ESC closes, Enter confirms

## Background / Jobs

- None

## Migrations / Seeds

- Seed sample applications for local dev (packages/db/seeds/applications.ts)

## Test Plan

### E2E (Playwright)

- `apps/web/tests/e2e/applications/dashboard.spec.ts` covering: list, filter, sort, status change, delete
- Use `test:e2e` script as per docs; do not call Playwright directly

### Unit / Integration (Vitest)

- DB list query paginates correctly
- Status PATCH validates enum and updates updated_at
- Delete removes row and returns 404 thereafter

### Manual QA (binary steps)

- Keyboard navigate to Actions → Delete; confirm with Enter
- Screen reader announces column headers and sort direction

## Runbook

- npm install

- Run migrations and seed data

  - POSIX / Bash:

    ```bash
    npm run db:migrate && npm run db:seed
    ```

  - Windows PowerShell:

    ```powershell
    npm run db:migrate; npm run db:seed
    ```

- npm run dev # web+api
- npm run test:unit
- npm run test:e2e -- apps/web/tests/e2e/applications/dashboard.spec.ts

## Acceptance Criteria (Definition of Done — binary)

- All API handlers return typed DTOs; zod validation on inputs
- URL preserves filters/sort and restores on reload
- A11y axe check passes with no critical issues
- Playwright spec green, Vitest coverage ≥80% for new modules
- ESLint passes monorepo rules

## Telemetry & Logging

- Log list latency and rows count
- Counter: application_status_changed_total by status
- Counter: application_deleted_total

## Security / Privacy

- Require JWT; check user ownership on all operations
- Delete is idempotent and safe against CSRF (use same-site cookies)

## Performance / UX

- List endpoint responds <200ms P95 on 1000 rows (local)
- Client renders <1.5s on cold load
