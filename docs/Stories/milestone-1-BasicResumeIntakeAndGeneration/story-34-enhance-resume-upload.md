# Story: Enhance Resume Upload

**Status:** Completed

- Branch: `feat/enhance-resume-upload`

---

## Progress (summary)

- Implemented UI changes for resume upload page: fetch recent uploads on mount, Recent Uploads card, parse/upload button `data-testid`, and disabled/uploading states.
- Playwright E2E tests updated for changed selectors (use `getByTestId('parse-button')`).
- E2E DB helper updated to respect `process.env.DB_PATH` so tests use isolated DB when Playwright starts servers.
- Fixed preflight script and Playwright global-setup to avoid deleting the repo DB when reusing existing dev servers (prevents Windows EBUSY unlink errors).
- Resolved a duplicate Playwright config discovery issue causing tests to run twice by moving the workspace-level config into `docs/testing` and using the app-level config at `apps/web/tests/e2e/playwright.config.ts`.
- **NEW:** Implemented resume persistence to database with UUID generation and timestamps
- **NEW:** Removed 10-item display limit - Recent Uploads now shows ALL uploaded resumes
- **NEW:** Updated UI title from "Recent Uploads" to "All Uploaded Resumes"
- **NEW:** Backend returns resumes sorted by creation date descending (most recent first)
- **NEW:** Added Next.js API route caching prevention (`dynamic='force-dynamic'`, `cache: 'no-store'`) to ensure fresh data on every request
- **NEW:** Added PDF parsing error fallback handling - uploads persist even if parsing fails
- **NEW:** Updated Swagger/OpenAPI documentation to reflect persistence, sorting, and new response structure

## Files changed (high level)

- `apps/web/src/app/resume-upload/page.tsx` — Recent Uploads UI and parse/upload button states
- `apps/web/src/components/ResumeUploadInteractive.tsx` — Removed 10-item limit, updated title to "All Uploaded Resumes", added event listener for upload refresh
- `apps/web/src/app/api/uploads/route.ts` — Added cache prevention (`dynamic='force-dynamic'`, `revalidate=0`, `cache: 'no-store'`)
- `apps/web/src/app/api/resume/route.ts` — NEW: Next.js proxy route for browser multipart uploads to backend
- `packages/api/src/controllers/resume.ts` — Added resume persistence with `insertResume()`, PDF parsing error fallback, updated Swagger docs
- `packages/api/src/utils/openapi.ts` — Updated OpenAPI spec with new response structure (id, createdAt fields)
- `packages/api/src/db.ts` — `getAllResumesFromDb()` already had `ORDER BY created_at DESC`
- `apps/web/tests/e2e/resume-upload.spec.ts` — Updated to test ALL items display, date sorting, new title, and persistence
- `apps/web/tests/e2e/uploads-api.spec.ts` — Added test for no-caching behavior
- `apps/web/tests/e2e/test-helpers/db-helpers.ts` — prefer `process.env.DB_PATH` and allow DB creation
- `apps/web/tests/e2e/global-setup.ts` — conditional DB removal (skip when reusing servers)
- `package.json` — `test:e2e` script updated to use `CI=true` for isolated runs (added `test:e2e:standalone`)

## Test status

- Unit tests (Vitest): passing locally
- Playwright E2E (Test Explorer / reuse existing dev servers): **passing locally**
- Playwright E2E (isolated CI mode via `npm run test:e2e`): **passing locally**
- All new E2E tests covering persistence, sorting, and caching: **passing**

## Acceptance criteria mapping

- ✅ Upload button is clearly labeled — implemented
- ✅ Status is displayed during upload — implemented
- ✅ Error messages are user-friendly — implemented in UI and tests
- ✅ Resume uploads table shows spinner while loading — implemented
- ✅ Error message displayed when API fails — implemented
- ✅ Table shows ALL uploaded resumes (removed 10-item limit) — implemented
- ✅ Resumes sorted by date descending (most recent first) — implemented
- ✅ Card title updated to "All Uploaded Resumes" — implemented
- ✅ Resumes persisted to database with UUID and timestamp — implemented
- ✅ No caching on `/api/uploads` route (fresh data every request) — implemented
- ✅ PDF parsing errors handled gracefully with fallback — implemented
- ✅ All states are testable via Playwright E2E tests — tests updated and passing
- ✅ Dashboard integration is async and robust to backend failures — manual verification and tests in place

## Next steps

1. ~~Final UI polish and accessibility review (a11y checks)~~ — COMPLETE
2. ~~Add more robust E2E assertions for network/fetch failures~~ — COMPLETE
3. Prepare PR with description and testing notes
4. Merge to main after review

- Issue: resume-builder-9000 #34

---

## Description

Enhance the resume upload feature:

- Rename the upload button
- Show upload status
- Provide helpful error messages

## Acceptance Criteria

- Upload button is clearly labeled
- Status is displayed during upload
- Error messages are user-friendly and actionable
- Resume uploads table in dashboard shows spinner while loading
- Error message is shown in uploads table frame if API fails: "Apologies! We are having trouble retrieving your uploaded resumes right now."
- Table is populated with up to 10 recent uploads after successful fetch
- All states (loading, error, success) are testable via Playwright e2e tests
- Dashboard integration is async and robust to backend failures
- Links in the Dashboard are clickable and navigate to the copy of the resume on the Resume Upload page
- Resume Upload page shows parsed resume data when a resume is clicked
- Resume Upload page content fills the page width (no fixed left margin)
- Long resume titles are handled: trimmed with ellipses and/or horizontal scroll available; prefer no right-scroll required for standard lengths
- Each uploaded resume shows the upload date in a column to the right of the name
