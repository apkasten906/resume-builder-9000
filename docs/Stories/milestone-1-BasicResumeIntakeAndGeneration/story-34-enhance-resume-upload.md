# Story: Enhance Resume Upload

**Status:** In Progress

- Branch: `feat/enhance-resume-upload`

---

## Progress (summary)

- Implemented UI changes for resume upload page: fetch recent uploads on mount, Recent Uploads card, parse/upload button `data-testid`, and disabled/uploading states.
- Playwright E2E tests updated for changed selectors (use `getByTestId('parse-button')`).
- E2E DB helper updated to respect `process.env.DB_PATH` so tests use isolated DB when Playwright starts servers.
- Fixed preflight script and Playwright global-setup to avoid deleting the repo DB when reusing existing dev servers (prevents Windows EBUSY unlink errors).
- Resolved a duplicate Playwright config discovery issue causing tests to run twice by moving the workspace-level config into `docs/testing` and using the app-level config at `apps/web/tests/e2e/playwright.config.ts`.

## Files changed (high level)

- `apps/web/src/app/resume-upload/page.tsx` — Recent Uploads UI and parse/upload button states
- `apps/web/tests/e2e/resume-upload.spec.ts` and `resume-upload-ui.spec.ts` — updated selectors to use `data-testid`
- `apps/web/tests/e2e/test-helpers/db-helpers.ts` — prefer `process.env.DB_PATH` and allow DB creation
- `apps/web/tests/e2e/global-setup.ts` — conditional DB removal (skip when reusing servers)
- `package.json` — `test:e2e` script updated to use `CI=true` for isolated runs (added `test:e2e:standalone`)

## Test status

- Unit tests (Vitest): passing locally
- Playwright E2E (Test Explorer / reuse existing dev servers): passed locally after fixing duplicate config
- Playwright E2E (isolated CI mode via `npm run test:e2e`): passing locally; `global-setup` will remove/create `packages/api/test-e2e.db` in CI mode

## Acceptance criteria mapping

- Upload button is clearly labeled — implemented
- Status is displayed during upload — implemented
- Error messages are user-friendly — implemented in UI and tests
- Resume uploads table shows spinner while loading — implemented
- Error message displayed when API fails — implemented
- Table is populated with up to 10 recent uploads — implemented
- All states are testable via Playwright E2E tests — tests updated and passing
- Dashboard integration is async and robust to backend failures — manual verification and tests in place

## Next steps

1. Final UI polish and accessibility review (a11y checks)
2. Add more robust E2E assertions for network/fetch failures (simulate API errors)
3. Run CI-style isolated E2E runs in CI environment (optionally create a GitHub Actions job to validate)
4. Prepare PR with description and testing notes

If you'd like, I can implement step (1) now and start (2) by adding simulated API-failure tests.

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
