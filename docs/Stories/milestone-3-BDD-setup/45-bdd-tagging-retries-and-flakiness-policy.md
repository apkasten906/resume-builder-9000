---
title: 45 — BDD: Tagging, Retries & Flakiness Policy
summary: How to tag BDD scenarios and configure retries for flaky tests
---

- Tag scenarios with `@smoke`, `@regression`, `@flaky`, and `@wip`.
- Configure Playwright/Test retries in CI for `@flaky` tests only.
- Record flaky tests in a central registry to prioritize fixes.

Story 4 — Tagging, Retries, and Flakiness Policy

Objective
Enforce a tagging scheme and retry behavior to keep CI signal predictable. Prepare a stub automation for opening a “Flaky” issue if a scenario fails twice.

Requirements

1. Tagging policy
   - `@wip` — work in progress, excluded from CI
   - `@smoke` — tiny essential slice, run on PRs
   - `@regression` — larger suite, run on `main` or nightly later

2. Retries
   - Local: 0
   - CI: 1 (already wired in `test:bdd:ci` arguments)

3. Documentation
   - Extend `docs/testing/bdd.md` with a short section explaining tags and retries.

4. Flaky stub (optional)
   - Create `.github/workflows/flaky-stub.yml` disabled by default (commented `on:`), or a script `scripts/open-flaky-issue.ts` that could be called by a future job.

Acceptance Criteria

- [ ] Tag usage appears in features; CI excludes `@wip`.
- [ ] A deliberately failing scenario demonstrates: 1 retry in CI, screenshots/traces saved.
- [ ] Docs updated with a “Flaky Tests” section and quarantine steps.

Definition of Done

- [ ] PR shows evidence (CI log excerpt) of retry and artifact behavior for a forced failure (then removed before merge).

Exact Implementation Steps (for Codex)

1. Ensure `package.json` has the CI script for retries:

```jsonc
{
  "scripts": {
    "test:bdd:ci": "cucumber-js --require-module ts-node/register --require tests/bdd/**/*.ts --format json:reports/cucumber/cucumber.json --format @cucumber/html-formatter --publish-quiet --retry 1 --retryTagFilter 'not @wip'",
  },
}
```

1. Add a short comment in each feature showing how to apply tags.
1. Update `docs/testing/bdd.md` with a Tagging & Flakiness section.
1. (Optional) Add a stub `scripts/open-flaky-issue.ts` with TODO markers.
