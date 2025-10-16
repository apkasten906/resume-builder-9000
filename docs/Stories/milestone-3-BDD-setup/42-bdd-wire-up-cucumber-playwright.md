---
title: 42 — BDD: Wire up Cucumber + Playwright test stack
summary: Story 1: Wire up a reproducible BDD stack using Cucumber + Playwright + TypeScript.
---

---

title: BDD Stack Wiring — Cucumber + Playwright
summary: Full spec and scaffolding for wiring Gherkin (Cucumber) with Playwright + TypeScript

---

Story 1 focuses on establishing a reproducible, well-documented BDD stack that runs locally and in CI. The deliverable is a minimal, working scaffold: feature file, TypeScript step defs, World + hooks, Page Objects, scripts, and CI wiring for artifact collection.

Goals

- Reproducible local run: `pnpm test:bdd`
- Reproducible CI run: `pnpm test:bdd:ci` (JSON + HTML output, one retry)
- Clean TypeScript and small, testable helpers (Page Objects)

Project layout (suggested)

```
tests/bdd/
  features/
    hello.feature
    job-tracking.feature
  steps/
    hello.steps.ts
    job-tracking.steps.ts
  pages/
    DashboardPage.ts
    JobFormPage.ts
    ResumePreviewPage.ts
  support/
    world.ts
    hooks.ts
    cucumber.ts
reports/cucumber/      # artifacts (gitignored)
playwright-traces/     # traces when enabled (gitignored)
```

Gherkin example (smoke):

```gherkin
Feature: Hello (Stack Wiring)
  Verify that Cucumber steps can drive Playwright to open the app.

  Background:
    Given the app base URL is configured

  @smoke
  Scenario: Open the dashboard
    When I navigate to the dashboard
    Then the page title should contain "Resume Builder"
```

Key implementation notes

- Use `@cucumber/cucumber` + `ts-node/register` so step defs can be written in TypeScript.
- Use Playwright (chromium) programmatically from steps; keep Playwright API usage inside Page Objects.
- Implement a `TestWorld` that exposes `browser`, `context`, `page`, and `webBase`.
- Hooks:
  - `Before`: initialize `TestWorld` (launch browser, newContext, newPage).
  - `AfterStep`: on failure take screenshot into `reports/cucumber/`.
  - `After`: close browser, stop trace (if enabled).
- Use `world` parameters to enable tracing (e.g., `--world-parameters '{

## Requirements

1. **Dependencies (devDependencies)**
   - `@cucumber/cucumber`, `@cucumber/html-formatter`, `@cucumber/pretty-formatter`, `@cucumber/messages`
   - `playwright` (not `@playwright/test` as a runner; Playwright is driven from Cucumber steps)
   - `typescript`, `ts-node`, `tslib`
   - Optional for DX: `eslint`, `@types/node`

2. **Project structure**

```
/tests
  /bdd
    /features/hello.feature
    /steps/hello.steps.ts
    /pages/DashboardPage.ts
    /support/world.ts
    /support/hooks.ts
    /support/cucumber.ts
/reports/cucumber/         # gitignored
/playwright-traces/        # gitignored
```

3. **Scripts (package.json)**
   - `test:bdd`: local run with pretty output
   - `test:bdd:ci`: CI run with JSON + HTML + retries + publish quiet
   - `test:bdd:trace`: enable tracing via world parameters

4. **World**
   - Launch Chromium in `Before` hook, create `BrowserContext`+`Page` with fixed viewport (1280×800).
   - Expose `page`, `context`, `browser` on custom World (TypeScript class).
   - Respect `parameters.trace` to start/stop tracing to `playwright-traces/trace.zip`.

5. **Hooks**
   - `Before`: init world; `After`: dispose world.
   - `AfterStep`: on failure, take screenshot to `reports/cucumber/screenshot-<timestamp>.png`.
   - Keep deterministic timeouts: default step timeout 30s (configurable).

6. **Hello sample**
   - Feature `hello.feature` ensures a Playwright navigation succeeds to `WEB_BASE` (default `http://localhost:3000`), title contains “Resume Builder”.

7. **.gitignore entries**

```
/reports/cucumber/
/playwright-traces/
```

8. **Node & PNPM**
   - Assume PNPM; scripts must run with `pnpm`; lockfile honored (`--frozen-lockfile`).

## Acceptance Criteria

- [ ] Running `pnpm test:bdd` executes Cucumber with TypeScript steps and prints **pretty** output.
- [ ] `hello.feature` passes locally against `WEB_BASE=http://localhost:3000` (configurable via env).
- [ ] `reports/cucumber/` and `playwright-traces/` directories are created as needed; artifacts only appear on failures or when tracing is enabled.
- [ ] No TypeScript errors (`tsc --noEmit` is clean for added files).

## Definition of Done

- [ ] All new files committed under `/tests/bdd/**` and scripts added to `package.json`.
- [ ] Local run demo recorded in PR description (console snippet).

## Exact Implementation Steps (for Codex)

1. **Install deps**
   ```bash
   pnpm add -D @cucumber/cucumber @cucumber/html-formatter @cucumber/pretty-formatter @cucumber/messages playwright typescript ts-node tslib @types/node
   ```
2. **Update package.json**
   ```jsonc
   {
     "scripts": {
       "test:bdd": "cucumber-js --require-module ts-node/register --require tests/bdd/**/*.ts --format @cucumber/pretty-formatter",
       "test:bdd:ci": "cucumber-js --require-module ts-node/register --require tests/bdd/**/*.ts --format json:reports/cucumber/cucumber.json --format @cucumber/html-formatter --publish-quiet --retry 1 --retryTagFilter 'not @wip'",
       "test:bdd:trace": "cucumber-js --require-module ts-node/register --require tests/bdd/**/*.ts --format @cucumber/pretty-formatter --world-parameters '{\"trace\":true}'",
     },
   }
   ```
3. **Create files** (copy exactly):
   - `tests/bdd/features/hello.feature`

   ```gherkin
   Feature: Hello (Stack Wiring)
     Verify that Cucumber steps can drive Playwright to open the app.

     Background:
       Given I set WEB_BASE to default if not provided

     @smoke
     Scenario: Open the dashboard
       When I navigate to the dashboard
       Then the page title should contain "Resume Builder"
   ```

   - `tests/bdd/steps/hello.steps.ts`

   ```ts
   import { Given, When, Then } from '@cucumber/cucumber';
   import { expect } from 'expect'; // lightweight assertion
   // use node's expect if not adding 'expect' package; otherwise replace with Playwright expect via '@playwright/test' types

   Given('I set WEB_BASE to default if not provided', async function () {
     this.webBase = process.env.WEB_BASE ?? 'http://localhost:3000';
   });

   When('I navigate to the dashboard', async function () {
     await this.page.goto(this.webBase);
   });

   Then('the page title should contain {string}', async function (text: string) {
     const title = await this.page.title();
     expect(title).toContain(text);
   });
   ```

   - `tests/bdd/pages/DashboardPage.ts`

   ```ts
   import type { Page } from 'playwright';
   export class DashboardPage {
     constructor(private page: Page) {}
     async goto(base: string) {
       await this.page.goto(base);
     }
   }
   ```

   - `tests/bdd/support/world.ts`

   ```ts
   import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
   import { chromium, Browser, BrowserContext, Page } from 'playwright';

   export class TestWorld extends World {
     browser!: Browser;
     context!: BrowserContext;
     page!: Page;
     webBase!: string;
     params: { trace?: boolean };

     constructor(opts: IWorldOptions) {
       super(opts);
       this.params = (opts.parameters as any) ?? {};
     }

     async init() {
       this.browser = await chromium.launch();
       this.context = await this.browser.newContext({ viewport: { width: 1280, height: 800 } });
       this.page = await this.context.newPage();
       if (this.params.trace)
         await this.context.tracing.start({ screenshots: true, snapshots: true });
     }

     async dispose() {
       if (this.params.trace)
         await this.context.tracing.stop({ path: 'playwright-traces/trace.zip' });
       await this.browser.close();
     }
   }

   setWorldConstructor(TestWorld);
   ```

   - `tests/bdd/support/hooks.ts`

   ```ts
   import { Before, After, AfterStep, ITestCaseHookParameter, Status } from '@cucumber/cucumber';
   import { TestWorld } from './world';
   import fs from 'node:fs';
   import path from 'node:path';

   Before(async function (this: TestWorld) {
     await this.init();
   });

   After(async function (this: TestWorld) {
     await this.dispose();
   });

   AfterStep(async function (this: TestWorld, { result }: ITestCaseHookParameter) {
     if (result?.status === Status.FAILED) {
       const file = path.join('reports', 'cucumber', `screenshot-${Date.now()}.png`);
       fs.mkdirSync(path.dirname(file), { recursive: true });
       await this.page.screenshot({ path: file });
     }
   });
   ```

   - `tests/bdd/support/cucumber.ts` (optional central config)

   ```ts
   // Placeholder for shared config (custom timeouts, env parsing, tag helpers)
   export const STEP_TIMEOUT_MS = 30_000;
   ```

4. **Add .gitignore entries** as specified.
5. **Run local test**
   ```bash
   pnpm test:bdd
   ```

---

## Non-Goals

- Cross-browser matrix, visual testing, contract testing, or API mocking. Those land in later stories.
