---
title: 43 — BDD: Core feature — Job tracking happy path
summary: Story 2: Implement the core happy-path BDD feature for job tracking: create job, upload resume, move application through stages.
---

Issue: https://github.com/apkasten906/resume-builder-9000/issues/43

Story 2: Core BDD Feature — Job Application Tracking (Happy Path)

Objective

Cover the most valuable user journey end-to-end in BDD: create job → parse job description → tailor resume → export preview. Provide one `@smoke` scenario and one Scenario Outline for data variation.

Requirements

1. Feature file: `tests/bdd/features/job-tracking.feature` with Background, `@smoke` scenario "Add a new job", and a Scenario Outline for tailoring with at least 2 rows.
2. Page Objects (TypeScript): `DashboardPage`, `JobFormPage`, `ResumePreviewPage` under `tests/bdd/pages`.
3. Steps: `tests/bdd/steps/job-tracking.steps.ts` that call POs only.
4. Test data: `tests/bdd/data/jobs.examples.json` (2–3 entries).
5. No PII — all data is fake.

Acceptance Criteria

- `@smoke` scenario adds a new job and it appears in the UI.
- Scenario Outline generates tailored resume preview for each example row without error.
- Selectors use data-testid or role-based locators; no brittle CSS chains.
- Feature passes locally via `pnpm test:bdd`.

Implementation notes and sample snippets are included in the original spec and exist in this repo under `docs/Stories/milestone-3-BDD-setup`.
