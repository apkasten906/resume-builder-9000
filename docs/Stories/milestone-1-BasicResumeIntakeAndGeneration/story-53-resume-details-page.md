# Story: Resume Details page + parsed-fields storage (Personal Info, Experience, Skills, Education, etc.)

**Status:** Completed

- Branch: `feat/resume-details-parsed-fields`

---

## Progress (summary)

- Implemented persistent storage for parsed resume data in a new `profile_parsed_fields` table linked to users and uploads.
- Added API endpoints `GET /api/resumes/:id/parsed-fields` and `PUT /api/resumes/:id/parsed-fields` with authentication and validation.
- Created a Next.js proxy route `/api/resume-details` to fetch parsed fields alongside the stored resume record.
- Built a protected Resume Details UI (`/resume-details?id=<uploadId>`) with inline editing, array controls, and text-selection mapping to summary, skills, experience, education, and awards.
- Wired the resume upload flow to auto-populate parsed fields for authenticated users and updated dashboard links to target the new Resume Details experience.
- Added integration and routing tests covering the repository, auth requirements, and new link expectations.
- Implemented optimistic save status indicators in the Resume Details client so edits are reflected immediately while sync completes.
- Persisted a parsed-field change history with API and UI support so editors can review earlier snapshots for each upload.
- Enabled restoring parsed resume fields from any historical snapshot with new API endpoints, proxy routes, and UI controls.

## Files changed (high level)

- `packages/api/src/db.ts` — created `profile_parsed_fields` table, foreign keys, and indexes.
- `packages/api/src/repositories/parsedResumeRepository.ts` — repository for fetching/upserting parsed fields.
- `packages/api/src/controllers/resumeParsedFields.ts` — controllers for retrieving and updating parsed fields with defaults.
- `packages/api/src/controllers/resume.ts` — stores parsed data on upload and exposes new routes protected by auth.
- `packages/api/tests/integration/parsedResumeRepository.integration.test.ts` — integration coverage for the new repository.
- `packages/api/tests/routes.test.ts` — route-level coverage for auth and success scenarios.
- `apps/web/src/app/api/resume-details/route.ts` — proxy route consolidating parsed fields + resume fetch.
- `apps/web/src/components/resume-details/ResumeDetailsClient.tsx` — interactive client component for editing parsed data and mapping selections.
- `apps/web/src/app/resume-details/page.tsx` — server entry point guarding the page.
- `apps/web/src/components/ResumeUploadInteractive.tsx`, `apps/web/src/app/page.tsx`, `apps/web/tests/e2e/upload-ui-acceptance.spec.ts` — dashboard links now target `/resume-details`.
- `docs/Stories/milestone-1-BasicResumeIntakeAndGeneration/story-53-resume-details-page.md` — documentation for story #53.

## Test status

- Unit & integration tests (Vitest): added coverage for parsed resume repository and route auth checks — passing locally.
- E2E acceptance adjustment: dashboard link expectation updated to `/resume-details`.

## Acceptance criteria mapping

- ✅ Parsed resume fields persist in dedicated storage keyed by user/upload.
- ✅ Resume Details page shows summary, personal info, experience, education, skills, awards, and hobbies with inline editing.
- ✅ Users can highlight resume preview text and map it to summary, skills, experience, education, or awards.
- ✅ Saving updates persists data and reloads with the latest values.
- ✅ Access to parsed fields API is authenticated; unauthenticated calls receive 401.
- ✅ Documentation updated for milestone 1.

## Next steps

1. ✅ Provide an export control on Resume Details to download parsed fields as JSON for offline editing.
2. ☐ Allow deleting parsed resume history snapshots from the UI.
3. ☐ Surface field-level diffs when comparing history snapshots.

- Issue: resume-builder-9000 #53

---

## Description

Implement a Resume Details page that lets users review and refine parsed resume content with inline editing and text selection mapping, backed by persistent storage tied to each upload.

## Acceptance Criteria

- Resume Details page displays parsed summary, experience, education, and skills for the selected upload.
- Users can edit parsed fields inline and save changes.
- Highlighting text in the resume preview allows mapping it to structured categories.
- Data persists and reloads with saved values.
- Unauthenticated access to parsed fields is blocked.
