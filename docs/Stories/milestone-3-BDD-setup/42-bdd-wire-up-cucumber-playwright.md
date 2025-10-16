---
title: 42 — BDD: Wire up Cucumber + Playwright test stack
summary: Story 1: Wire up a reproducible BDD stack using Cucumber + Playwright + TypeScript.
---

Issue: https://github.com/apkasten906/resume-builder-9000/issues/42

Story 1: Wire up a reproducible BDD stack using Cucumber + Playwright + TypeScript.

Acceptance criteria:

- `pnpm test:bdd` runs locally with TypeScript step definitions.
- `pnpm test:bdd:ci` produces JSON + HTML reports and retries once on CI.
- A sample `hello.feature` verifies the app title and runs under the stack.

Tasks:

- Add `tests/bdd/support/world.ts`, `hooks.ts`, `cucumber.ts`.
- Add `tests/bdd/features/hello.feature` and `tests/bdd/steps/hello.steps.ts`.
- Add minimal Page Objects under `tests/bdd/pages`.

Notes & Implementation guidance

- Use `@cucumber/cucumber` with `ts-node/register` so step defs can be written in TypeScript.
- Drive Playwright programmatically from steps and keep Playwright usage inside Page Objects.
- Implement a `TestWorld` exposing `browser`, `context`, `page`, and `webBase`.
- Hooks:
  - `Before`: initialize `TestWorld` (launch browser, newContext, newPage).
  - `AfterStep`: take a screenshot on failure into `reports/cucumber/`.
  - `After`: close browser and stop trace if enabled.

Suggested files (copy from spec):

```
tests/bdd/
  features/
    hello.feature
  steps/
    hello.steps.ts
  pages/
    DashboardPage.ts
  support/
    world.ts
    hooks.ts
    cucumber.ts
reports/cucumber/
playwright-traces/
```

Scripts (package.json)

```jsonc
{
  "scripts": {
    "test:bdd": "cucumber-js --require-module ts-node/register --require tests/bdd/**/*.ts --format @cucumber/pretty-formatter",
    "test:bdd:ci": "cucumber-js --require-module ts-node/register --require tests/bdd/**/*.ts --format json:reports/cucumber/cucumber.json --format @cucumber/html-formatter --publish-quiet --retry 1 --retryTagFilter 'not @wip'",
    "test:bdd:trace": "cucumber-js --require-module ts-node/register --require tests/bdd/**/*.ts --format @cucumber/pretty-formatter --world-parameters '{\"trace\":true}'",
  },
}
```

Why this story

Create a reproducible, minimal BDD scaffold so feature authors and CI can run acceptance tests consistently.
