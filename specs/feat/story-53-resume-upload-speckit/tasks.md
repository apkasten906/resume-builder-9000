# Tasks: Resume upload & parse

Feature: Resume upload & parse
Spec: `specs/1-resume-upload-parse/spec.md`
Plan: `specs/feat/story-53-resume-upload-speckit/plan.md`

Phase 1 — Setup

- [ ] T001 Initialize feature contracts directory and add OpenAPI stub `specs/feat/story-53-resume-upload-speckit/contracts/openapi-resume.yaml`
- [x] T002 [P] Add parser helper module (stub) for text-layer PDF extraction `apps/api/src/lib/pdf-parser.ts`
- [x] T003 [P] Add upload route scaffold `apps/api/src/routes/resume/parse.route.ts` (POST /api/resume/parse)
- [x] T004 [P] Add save route scaffold `apps/api/src/routes/resume/save.route.ts` (POST /api/resume/save)
- [x] T005 Create model/entity definitions `packages/core/src/models/parsed-region.ts` and `packages/core/src/models/user-profile-draft.ts`
- [x] T006 [P] Add Vitest unit-test placeholder for parser helper `packages/core/test/pdf-parser.spec.ts`

Phase 2 — Foundational (blocking prerequisites)

- [ ] T007 Implement file validation middleware `apps/api/src/middleware/file-validation.ts` (limit 10MB, MIME application/pdf)
- [ ] T008 [P] Implement transient DTOs and serializers `packages/core/src/dtos/parsed-region.dto.ts` and `packages/core/src/dtos/resume-upload.dto.ts`
- [x] T009 [P] Implement server-side parsing integration that calls `apps/api/src/lib/pdf-parser.ts` and returns parsed regions `apps/api/src/routes/resume/parse.route.ts`
- [ ] T010 Create API contract test `apps/api/test/parse.route.spec.ts` that POSTs example PDF and asserts JSON shape

Phase 3 — User Story Phases (priority order)

US1: Upload and quick-parse (Priority: P1)

- [x] T011 [US1] Implement `POST /api/resume/parse` route logic in `apps/api/src/routes/resume/parse.route.ts` to accept multipart/form-data and return parsed regions JSON (apply file validation middleware)
- [x] T012 [US1] Implement parser worker `apps/api/src/lib/pdf-parser.ts` using `pdfjs-dist` (text-layer extraction). Output shape: [{id,page,bbox,text,category,confidence}]
- [ ] T013 [US1] [P] Create client upload UI `apps/web/src/components/ResumeUploadInteractive.tsx` to POST file and display parsed JSON (stubbed UI)
- [ ] T014 [US1] [P] Add a basic integration test `apps/web/test/resume-upload.e2e.ts` (Playwright) to upload a known text-layer PDF and validate the preview receives parsed regions
- [x] T015 [US1] Map parsed regions to profile draft DTO and add unit test `packages/core/test/parsed-region-to-profile.spec.ts`

US2: Review and correct (Priority: P2)

- [ ] T016 [US2] Implement overlay preview component `apps/web/src/components/ResumePreviewOverlay.tsx` that renders PDF page and highlights parsed region bboxes
- [ ] T017 [US2] Implement region editing UI `apps/web/src/components/RegionEditor.tsx` (edit text, change category, delete) and wire to client state
- [ ] T018 [US2] Implement Add-region UI `apps/web/src/components/AddRegionForm.tsx` (draw/select area or paste text) and normalization logic
- [ ] T019 [US2] Implement client Save flow to POST reviewed regions to `POST /api/resume/save` and show success/failure feedback `apps/web/src/services/resume-service.ts`
- [ ] T020 [US2] Add integration test `apps/web/test/review-and-save.e2e.ts` that simulates edits and asserts `POST /api/resume/save` payload shape

US3: Privacy and consent (Priority: P3)

- [ ] T021 [US3] Add consent banner component `apps/web/src/components/ConsentNotice.tsx` shown during review flow with explicit Save/Cancel actions
- [ ] T022 [US3] Ensure server `POST /api/resume/save` requires explicit consent flag and returns 400 when missing `apps/api/src/routes/resume/save.route.ts`
- [ ] T023 [US3] Implement server-side persistence service `apps/api/src/services/resume-save.service.ts` to write structured fields into user profile draft tables
- [ ] T024 [US3] Add E2E acceptance test `apps/web/test/privacy-consent.e2e.ts` verifying no DB writes without consent and data saved when consent provided

Final Phase — Polish & Cross-cutting

- [ ] T025 Add logging redaction utilities `packages/core/src/lib/log-redact.ts` and update server routes to redact PII
- [ ] T026 Add documentation `specs/feat/story-53-resume-upload-speckit/quickstart.md` with local dev steps to exercise the feature
- [ ] T027 Add CI integration for feature tests or update existing CI to include the new tests `ci/workflows/resume-upload.yml` (or update `vitest.config.ts`)
- [ ] T028 [P] Accessibility review task: audit overlay and editor with axe-core and fix issues in `apps/web/src/components/*`

Dependencies & execution order

- Foundational tasks (T007..T010) must complete before US1 tasks that call the API (T011..T015).
- US1 (T011..T015) should be completed before US2 (T016..T020) and US3 (T021..T024), except tasks explicitly marked [P].

Parallel opportunities

- Tasks marked with [P] are parallelizable (different files, low coupling). Examples: T002, T003, T004, T006, T008, T009, T012, T013, T014, T028.

Validation & testability

- Each user story phase is independently testable: complete the tasks for a single story to deliver a working increment (e.g., US1 delivers parse preview and mapping to DTOs).

Summary

- Total task count: 28
- Task count per user story: US1=5, US2=5, US3=4, Setup/Foundational/Final=14
- Suggested MVP scope: Setup (T001..T006) + Foundational (T007..T009) + US1 (T011..T015)
