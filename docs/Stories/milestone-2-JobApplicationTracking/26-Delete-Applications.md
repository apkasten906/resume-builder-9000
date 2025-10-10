# [Story] Delete Applications (#26)

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

Allow users to delete applications from dashboard and details with confirmation and instant UI removal.

## Scope

- DELETE API + ownership check
- UI confirm modal with focus trap; optimistic removal from list
- Soft error recovery (undo banner that re-creates row within 30s, local only)

## Out of Scope

- Permanent archive bin

## Allowed Paths (Copilot may touch)

- apps/api/src/routes/applications/delete.ts
- apps/web/components/applications/ConfirmDeleteDialog.tsx
- apps/web/app/(app-tracking)/applications/page.tsx
- apps/web/app/(app-tracking)/applications/[id]/page.tsx
- apps/web/tests/e2e/applications/delete.spec.ts

## Forbidden Paths (do not touch)

- apps/web/app/(resume)/\*\*

## Data Model / Migration

```sql
-- Migration sketch (convert to Prisma migration if using Prisma)

-- No schema changes; ensure ON DELETE CASCADE on dependent tables

```

## API Surface

### DELETE /api/applications/:id

- **Purpose:** Delete an application
- **Auth:** Required
- **Request:** `{}`
- **Response:** `{ok:true}`
- **Errors:** 401,404,409
- **Handler:** `apps/api/src/routes/applications/delete.ts`

## UI Work

- **Route:** `/applications`
  - **File:** `apps/web/app/(app-tracking)/applications/page.tsx`
  - **Components:** ConfirmDeleteDialog
  - **States:** confirming, success, error
  - **A11y:** Dialog labelled, focus trapped, ESC closes

- **Route:** `/applications/[id]`
  - **File:** `apps/web/app/(app-tracking)/applications/[id]/page.tsx`
  - **Components:** ConfirmDeleteDialog
  - **States:** confirming, success, error
  - **A11y:** Same as above

## Background / Jobs

- None

## Migrations / Seeds

- None

## Test Plan

### E2E (Playwright)

- `applications/delete.spec.ts`: dashboard + details delete flows with confirm + undo

### Unit / Integration (Vitest)

- API deletes row and returns 404 on second call

### Manual QA (binary steps)

- Keyboard-only can trigger delete and confirm

## Runbook

- npm run dev
- npm run test:e2e -- apps/web/tests/e2e/applications/delete.spec.ts

## Acceptance Criteria (Definition of Done — binary)

- Deletion requires confirmation
- All dependent rows cascade delete or block with 409
- Action is logged with user id

## Telemetry & Logging

- Counter: application_deleted_total

## Security / Privacy

- Ownership enforced; CSRF protected

## Performance / UX

- Delete endpoint <100ms P95
