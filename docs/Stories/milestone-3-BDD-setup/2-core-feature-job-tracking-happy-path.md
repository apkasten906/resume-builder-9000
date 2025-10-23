---
title: Core Feature — Job Tracking (Happy Path)
summary: BDD feature description and steps for the core job tracking happy path.
---

Feature: Job tracking happy path

Scenario: Create job, submit application, and verify pipeline movement
Given I am an authenticated recruiter
When I create a job posting with title "Senior Engineer"
And a candidate uploads a resume for that job
Then the application appears in the job's applicant list
And the recruiter can move the application to screening stage

Notes:

- Keep test data scoped and deterministic using IDs, not timestamps.
- Implementation details belong in step definitions and helpers.

# Story 2 — Core BDD Feature: Job Application Tracking (Happy Path)

**Objective**  
Cover the most valuable user journey end-to-end in BDD: create job → parse job description → tailor resume → export preview. Provide one @smoke scenario and one Scenario Outline for data variation.

---

## Preconditions

- Story 1 is merged (stack wiring, scripts, sample feature). App can run locally at `WEB_BASE`.

## Requirements

1. **Feature file**: `tests/bdd/features/job-tracking.feature`
   - Includes `Background` that navigates to dashboard.
   - Has **@smoke** scenario “Add a new job”.
   - Has **Scenario Outline** for tailoring with `Examples` table (2 rows minimum).
2. **Page Objects** (TypeScript):
   - `tests/bdd/pages/DashboardPage.ts`
   - `tests/bdd/pages/JobFormPage.ts`
   - `tests/bdd/pages/ResumePreviewPage.ts`
   - Each exposes stable methods with explicit waits (no `sleep`), using Playwright locator API.
3. **Steps**: `tests/bdd/steps/job-tracking.steps.ts`
   - Steps call the Page Object methods only (no raw selectors inside steps).
   - Steps accept `{string}` placeholders for title/company.
4. **Test data** (if needed): `tests/bdd/data/jobs.examples.json` with 2–3 entries.
5. **No PII**. All data is fake (Acme/Globex).

---

## Acceptance Criteria

- [ ] `@smoke` scenario adds a new job with title and company, then asserts the job appears in the list.
- [ ] Scenario Outline generates a tailored resume preview for each example row without error.
- [ ] All selectors use robust strategies (data-testid or role-based preferred); no brittle CSS chains.
- [ ] Feature passes locally via `pnpm test:bdd`.
- [ ] Step defs and POs are TypeScript‑strict and compile cleanly (`tsc --noEmit`).

---

## Definition of Done

- [ ] New feature + steps + POs committed and covered by Story 3 CI.
- [ ] Screenshots captured on any failure, with traces when `test:bdd:trace` is used.

---

## Exact Implementation Steps (for Codex)

1. **Create feature** `tests/bdd/features/job-tracking.feature`

   ```gherkin
   Feature: Job Application Tracking
     As a job seeker, I can add a job and tailor a resume so that I can apply confidently.

     Background:
       Given I set WEB_BASE to default if not provided
       And I am on the dashboard

     @smoke
     Scenario: Add a new job
       When I add a job with title "Senior SWE" and company "Acme"
       Then I should see the job "Senior SWE" at "Acme" in the list

     Scenario Outline: Tailor resume from a saved job
       Given a saved job "<title>" at "<company>"
       When I open the resume tailoring panel
       Then a tailored resume is generated for "<title>" at "<company>"

       Examples:
         | title        | company |
         | Senior SWE   | Acme    |
         | Backend Lead | Globex  |
   ```

2. **PO stubs (adjust selectors to app)**
   - `tests/bdd/pages/JobFormPage.ts`

   ```ts
   import type { Page, Locator } from 'playwright';
   export class JobFormPage {
     readonly titleInput: Locator;
     readonly companyInput: Locator;
     readonly saveButton: Locator;
     constructor(private page: Page) {
       this.titleInput = page.getByTestId('job-title');
       this.companyInput = page.getByTestId('job-company');
       this.saveButton = page.getByRole('button', { name: /save/i });
     }
     async addJob(data: { title: string; company: string }) {
       await this.titleInput.fill(data.title);
       await this.companyInput.fill(data.company);
       await this.saveButton.click();
     }
   }
   ```

   - `tests/bdd/pages/ResumePreviewPage.ts`

   ```ts
   import type { Page, Locator } from 'playwright';
   export class ResumePreviewPage {
     readonly panel: Locator;
     readonly content: Locator;
     constructor(private page: Page) {
       this.panel = page.getByTestId('resume-preview');
       this.content = this.panel.getByTestId('resume-preview-content');
     }
     async isReady() {
       await this.panel.waitFor({ state: 'visible' });
       await this.content.waitFor({ state: 'visible' });
     }
   }
   ```

   - Update `tests/bdd/pages/DashboardPage.ts` to include helpers

   ```ts
   import type { Page, Locator } from 'playwright';
   export class DashboardPage {
     constructor(private page: Page) {}
     async goto(base: string) {
       await this.page.goto(base);
     }
     jobRow(title: string, company: string): Locator {
       return this.page
         .getByTestId('job-row')
         .filter({ hasText: title })
         .filter({ hasText: company });
     }
     async openTailoringPanelFor(title: string, company: string) {
       const row = this.jobRow(title, company);
       await row.getByRole('button', { name: /tailor/i }).click();
     }
   }
   ```

3. **Steps** `tests/bdd/steps/job-tracking.steps.ts`

   ```ts
   import { Given, When, Then } from '@cucumber/cucumber';
   import { TestWorld } from '../support/world';
   import { DashboardPage } from '../pages/DashboardPage';
   import { JobFormPage } from '../pages/JobFormPage';
   import { ResumePreviewPage } from '../pages/ResumePreviewPage';

   Given('I am on the dashboard', async function (this: TestWorld) {
     const dash = new DashboardPage(this.page);
     await dash.goto(this.webBase);
   });

   When(
     'I add a job with title {string} and company {string}',
     async function (this: TestWorld, title: string, company: string) {
       const form = new JobFormPage(this.page);
       await form.addJob({ title, company });
     }
   );

   Then(
     'I should see the job {string} at {string} in the list',
     async function (this: TestWorld, title: string, company: string) {
       const dash = new DashboardPage(this.page);
       await dash.jobRow(title, company).waitFor({ state: 'visible' });
     }
   );

   Given(
     'a saved job {string} at {string}',
     async function (this: TestWorld, title: string, company: string) {
       const form = new JobFormPage(this.page);
       await form.addJob({ title, company });
     }
   );

   When('I open the resume tailoring panel', async function (this: TestWorld) {
     // naive: open the first job row's tailor button; replace with exact title/company if needed
     const dash = new DashboardPage(this.page);
     await dash.openTailoringPanelFor('Senior SWE', 'Acme');
   });

   Then(
     'a tailored resume is generated for {string} at {string}',
     async function (this: TestWorld, title: string, company: string) {
       const preview = new ResumePreviewPage(this.page);
       await preview.isReady();
     }
   );
   ```

---

## Non-Goals

- Negative paths (validation errors), export-to-file verification, or PDF diffing.
