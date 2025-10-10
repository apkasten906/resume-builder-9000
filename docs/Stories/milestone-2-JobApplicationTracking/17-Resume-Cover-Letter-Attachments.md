# [Story] Resume & Cover Letter Attachments per Application (#17)

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

Upload, parse, store, and display attachments (resume, cover letter) associated with an application.

## Scope

- Drag-n-drop uploader; accept PDF, DOCX, TXT
- Server stores binary on disk `storage/attachments/{appId}/{fileId}` and metadata in DB
- PDF/DOCX parser extracts plain text for quick preview (client shows 3–5 lines)
- Replace/delete attachment operations

## Out of Scope

- Full-text search
- Virus scanning (placeholder only)

## Allowed Paths (Copilot may touch)

- apps/web/components/attachments/\*
- apps/web/app/(app-tracking)/applications/[id]/attachments/page.tsx
- apps/api/src/routes/attachments/\*
- packages/db/\*
- packages/lib/parsers/\*

## Forbidden Paths (do not touch)

- apps/web/app/(resume)/\*\*

## Data Model / Migration

```sql
-- Migration sketch (convert to Prisma migration if using Prisma)

CREATE TABLE IF NOT EXISTS application_attachments (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  kind TEXT NOT NULL, -- 'RESUME' | 'COVER_LETTER' | 'OTHER'
  filename TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  text_excerpt TEXT, -- small preview
  stored_path TEXT NOT NULL,
  uploaded_at INTEGER NOT NULL,
  FOREIGN KEY(application_id) REFERENCES applications(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_attach_app ON application_attachments(application_id, uploaded_at DESC);

```

## API Surface

### POST /api/applications/:id/attachments

- **Purpose:** Upload attachment (multipart/form-data)
- **Auth:** Required
- **Request:** `FormData: file, kind`
- **Response:** `{ok:true, item: Attachment}`
- **Errors:** 400, 413, 415, 401, 404
- **Handler:** `apps/api/src/routes/attachments/upload.ts`

### GET /api/applications/:id/attachments

- **Purpose:** List attachments
- **Auth:** Required
- **Request:** `{}`
- **Response:** `{items: Attachment[]}`
- **Errors:** 401,404
- **Handler:** `apps/api/src/routes/attachments/list.ts`

### DELETE /api/attachments/:attachmentId

- **Purpose:** Delete attachment
- **Auth:** Required
- **Request:** `{}`
- **Response:** `{ok:true}`
- **Errors:** 401,404
- **Handler:** `apps/api/src/routes/attachments/delete.ts`

## UI Work

- **Route:** `/applications/[id]/attachments`
  - **File:** `apps/web/app/(app-tracking)/applications/[id]/attachments/page.tsx`
  - **Components:** AttachmentUploader, AttachmentCard, AttachmentList
  - **States:** idle, uploading, error, ready
  - **A11y:** Dropzone labelled; progress announced via aria-live

## Background / Jobs

- None

## Migrations / Seeds

- Create `storage/attachments/.gitkeep` and ensure write perms in dev

## Test Plan

### E2E (Playwright)

- `applications/attachments.spec.ts`: upload + list + delete flow

### Unit / Integration (Vitest)

- Parser correctly extracts text for PDF and DOCX samples
- Upload rejects >10MB

### Manual QA (binary steps)

- Keyboard drop (paste) works; focus remains on list after upload

## Runbook

- npm run dev
- npm run test:e2e -- apps/web/tests/e2e/applications/attachments.spec.ts

## Acceptance Criteria (Definition of Done — binary)

- Files persist to disk; DB metadata accurate
- Preview excerpt rendered; no PII leaked in logs
- A11y pass for uploader

## Telemetry & Logging

- Histogram: upload_size_bytes, upload_duration_ms
- Counter: attachments_deleted_total

## Security / Privacy

- Whitelist MIME types; generate random fileId; store outside web root; send `Content-Disposition` on download

## Performance / UX

- Upload UI remains responsive for 10MB files; server stream writes
