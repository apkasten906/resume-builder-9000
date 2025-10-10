# [Story] Salary Tracking (#18)

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

Store and display salary expectations/offers per application; filter and sort on dashboard.

## Scope

- Fields on application: salary_min/salary_max (in cents) + currency
- Dashboard shows formatted salary range (user pref from settings later)
- Filter and sort by salary

## Out of Scope

- Currency conversion
- Compensation packages breakdown

## Allowed Paths (Copilot may touch)

- packages/db/\*
- apps/api/src/routes/applications/\*
- apps/web/app/(app-tracking)/applications/\*
- apps/web/components/applications/\*

## Forbidden Paths (do not touch)

- apps/web/app/(resume)/\*\*

## Data Model / Migration

```sql
-- Migration sketch (convert to Prisma migration if using Prisma)

-- Already included in #14 table; this story ensures formatting & filters exist

```

## API Surface

### GET /api/applications

- **Purpose:** Support `minSalary` & `maxSalary` filters
- **Auth:** Required
- **Request:** `query: {minSalary?:number, maxSalary?:number}`
- **Response:** `{items: Application[], total:number}`
- **Errors:** 401
- **Handler:** `apps/api/src/routes/applications/list.ts`

### PATCH /api/applications/:id

- **Purpose:** Update salary fields
- **Auth:** Required
- **Request:** `{salary_min?:number,salary_max?:number,currency?:string}`
- **Response:** `{ok:true,item:Application}`
- **Errors:** 400,401,404
- **Handler:** `apps/api/src/routes/applications/update.ts`

## UI Work

- **Route:** `/applications`
  - **File:** `apps/web/app/(app-tracking)/applications/page.tsx`
  - **Components:** SalaryCell, FiltersBar
  - **States:** with-data
  - **A11y:** Formatted with currency symbol; screen reader reads full range

## Background / Jobs

- None

## Migrations / Seeds

- None

## Test Plan

### E2E (Playwright)

- `applications/salary-filtering.spec.ts`: formatting + filters

### Unit / Integration (Vitest)

- Formatter respects EUR/USD symbols and two decimals; returns en-AT by default

### Manual QA (binary steps)

- Keyboard tab focuses filter inputs; Enter applies filter

## Runbook

- npm run dev
- npm run test:e2e -- apps/web/tests/e2e/applications/salary-filtering.spec.ts

## Acceptance Criteria (Definition of Done — binary)

- Salary persisted and displayed; filters work in URL and API
- 100% strict types; zod parses cents as integers

## Telemetry & Logging

- Gauge (derive): % apps with salary set

## Security / Privacy

- Server clamps salary 0..1_000_000_00 cents; rejects currency not in ISO 4217 list

## Performance / UX

- Formatter generates ≤1ms per cell
