# [Story] Application Status Tracking (#15)

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

Provide canonical status workflow with transitions, history log, and UI affordances to change/undo.

## Scope

- Status enum: APPLIED → SCREENING → INTERVIEW → OFFER → ACCEPTED | REJECTED
- History table capturing (app_id, old_status, new_status, at, by)
- Undo last status within 10 minutes (soft revert)
- Notifications hook (future)

## Out of Scope

- Email/slack notifications delivery
- Multi-user collaboration rules

## Allowed Paths (Copilot may touch)

- packages/db/\*
- apps/api/src/routes/applications/\*
- apps/web/components/applications/\*
- apps/web/app/(app-tracking)/applications/\*
- apps/web/tests/e2e/applications/\*

## Forbidden Paths (do not touch)

- apps/web/app/(resume)/\*\*

## Data Model / Migration

```sql
-- Migration sketch (convert to Prisma migration if using Prisma)

CREATE TABLE IF NOT EXISTS application_status_history (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_at INTEGER NOT NULL,
  changed_by TEXT NOT NULL,
  FOREIGN KEY(application_id) REFERENCES applications(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_status_history_app ON application_status_history(application_id, changed_at DESC);

```

## API Surface

### GET /api/applications/:id/history

- **Purpose:** Fetch status change history
- **Auth:** Required
- **Request:** `{}`
- **Response:** `{items: StatusEvent[]}`
- **Errors:** 401,404
- **Handler:** `apps/api/src/routes/applications/history.ts`

### POST /api/applications/:id/status

- **Purpose:** Transition to a new status with validation
- **Auth:** Required
- **Request:** `{to:'APPLIED'|'SCREENING'|'INTERVIEW'|'OFFER'|'ACCEPTED'|'REJECTED'}`
- **Response:** `{ok:true, item: Application}`
- **Errors:** 400 invalid transition, 401, 404
- **Handler:** `apps/api/src/routes/applications/transition.ts`

### POST /api/applications/:id/undo-last-status

- **Purpose:** Undo the most recent status change if within 10 minutes
- **Auth:** Required
- **Request:** `{}`
- **Response:** `{ok:true, item: Application}`
- **Errors:** 409 window elapsed, 404
- **Handler:** `apps/api/src/routes/applications/undo.ts`

## UI Work

- **Route:** `/applications/:id`
  - **File:** `apps/web/app/(app-tracking)/applications/[id]/page.tsx`
  - **Components:** StatusTimeline, StatusSelect, UndoButton
  - **States:** loading, error, ready
  - **A11y:** Announce status changes via aria-live polite

## Background / Jobs

- None

## Migrations / Seeds

- Backfill initial history from current status values (seed script)

## Test Plan

### E2E (Playwright)

- `applications/status-workflow.spec.ts`: happy path transitions + invalid branch
- Undo flow with timer mocked

### Unit / Integration (Vitest)

- Transition validator enforces DAG rules
- History insert occurs atomically with status update (transaction)
- Undo rejects after TTL

### Manual QA (binary steps)

- Keyboard-only can open select, change status, and activate Undo
- Screen reader announces new status

## Runbook

- npm run db:migrate
- npm run dev
- npm run test:e2e -- apps/web/tests/e2e/applications/status-workflow.spec.ts

## Acceptance Criteria (Definition of Done — binary)

- All valid transitions succeed; invalid ones fail deterministically
- History API returns latest first
- Axe: no critical a11y issues
- Unit + E2E passing

## Telemetry & Logging

- Histogram: status_transition_latency_ms
- Counter: status_transition_invalid_total by from→to

## Security / Privacy

- Check ownership on read/write history
- Validate `to` is allowed; prevent injection with zod

## Performance / UX

- History GET <150ms P95 on 100 events
