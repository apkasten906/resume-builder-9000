# [Story] Job Application Details (#16)

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

Create detail page with full application fields, editable sections, and validation.

## Scope

- Details page with sections: Overview, Contacts, Notes, Attachments (links), Activity
- Form validation with zod + react-hook-form
- Autosave notes field

## Out of Scope

- Attachments upload (covered in #17)
- Calendar integration

## Allowed Paths (Copilot may touch)

- apps/web/app/(app-tracking)/applications/[id]/page.tsx
- apps/web/components/applications/\*
- apps/api/src/routes/applications/\*
- packages/db/\*

## Forbidden Paths (do not touch)

- apps/web/app/(resume)/\*\*

## Data Model / Migration

```sql
-- Migration sketch (convert to Prisma migration if using Prisma)

-- extends `applications` table (if not already present)
-- add recruiter contact fields (nullable)
ALTER TABLE applications ADD COLUMN recruiter_name TEXT;
ALTER TABLE applications ADD COLUMN recruiter_email TEXT;
ALTER TABLE applications ADD COLUMN recruiter_phone TEXT;
ALTER TABLE applications ADD COLUMN interview_dates TEXT; -- JSON stringified array of ISO datetimes

```

## API Surface

### GET /api/applications/:id

- **Purpose:** Fetch full details
- **Auth:** Required
- **Request:** `{}`
- **Response:** `Application`
- **Errors:** 404
- **Handler:** `apps/api/src/routes/applications/get.ts`

### PATCH /api/applications/:id

- **Purpose:** Update partial fields from form
- **Auth:** Required
- **Request:** `Partial<Application>`
- **Response:** `{ok:true, item: Application}`
- **Errors:** 400,404
- **Handler:** `apps/api/src/routes/applications/update.ts`

## UI Work

- **Route:** `/applications/:id`
  - **File:** `apps/web/app/(app-tracking)/applications/[id]/page.tsx`
  - **Components:** ApplicationOverview, ContactCard, NotesEditor, ActivityFeed, AttachmentsListLink
  - **States:** loading, error, ready, saving
  - **A11y:** Form controls have labels; live region for autosave status

## Background / Jobs

- None

## Migrations / Seeds

- Backfill `interview_dates` to [] for existing rows

## Test Plan

### E2E (Playwright)

- `applications/details.spec.ts`: view + edit fields, autosave notes, validation errors

### Unit / Integration (Vitest)

- PATCH only updates whitelisted fields; trims strings; updates updated_at

### Manual QA (binary steps)

- Tab through inputs without trap; ESC key leaves notes editor focus

## Runbook

- npm run db:migrate
- npm run dev
- npm run test:e2e -- apps/web/tests/e2e/applications/details.spec.ts

## Acceptance Criteria (Definition of Done — binary)

- Details render with seed data
- Invalid email blocked
- Autosave emits no console errors and writes once per debounce window

## Telemetry & Logging

- Timer: details_load_latency_ms
- Counter: notes_autosave_success_total / \*\_error_total

## Security / Privacy

- Server validates ownership and email format; strips HTML from notes

## Performance / UX

- Debounce notes saves to ≥800ms; P95 payload <5KB
