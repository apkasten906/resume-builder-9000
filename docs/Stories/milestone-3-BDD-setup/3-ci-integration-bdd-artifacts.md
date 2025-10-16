---
title: CI Integration — BDD Artifacts
summary: How CI collects and exposes BDD artifacts
---

CI should collect Playwright artifacts for failed BDD scenarios and expose them as job artifacts:

- Traces
- Screenshots
- Video recordings
- Playwright HTML report

Store artifacts under `playwright-report/` and upload them in CI when a run fails.

# Story 3 — CI Integration for BDD + Artifact Upload

**Objective**  
Run the BDD suite in GitHub Actions with fast feedback on PRs and full coverage on `main`. Upload JSON/HTML reports and Playwright traces/screenshots as artifacts.

---

## Preconditions

- Stories 1 and 2 completed; scripts exist and pass locally.

## Requirements

1. **Workflow file** `/.github/workflows/bdd.yml`
   - Triggers:
     - `pull_request` to `main` and `dev`: run `@smoke and not @wip`.
     - `push` to `main`: run full suite (no tag filter).
   - Node 20, PNPM 9.
   - Install Playwright browsers with `--with-deps`.
   - Cache PNPM store and `~/.cache/ms-playwright`.
   - Upload artifacts:
     - `reports/cucumber/**`
     - `playwright-traces/**`
2. **Job summary** includes pass/fail counts and a link path to `report.html` artifact.

---

## Acceptance Criteria

- [ ] On PR, CI executes `@smoke and not @wip` and uploads artifacts.
- [ ] On push to `main`, full suite executes and uploads artifacts.
- [ ] CI is green for the baseline suite.
- [ ] Artifacts are visible on the Actions run and downloadable.

---

## Definition of Done

- [ ] `bdd.yml` committed and verified via a draft PR screenshot/log in PR description.

---

## Exact Implementation Steps (for Codex)

Create `/.github/workflows/bdd.yml` with the following content:

```yaml
name: BDD
on:
  pull_request:
    branches: [main, dev]
  push:
    branches: [main]

jobs:
  bdd:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install deps
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run BDD (PR smoke / main full)
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            pnpm cucumber-js --require-module ts-node/register --require tests/bdd/**/*.ts --tags "@smoke and not @wip" --format @cucumber/pretty-formatter
          else
            pnpm run test:bdd:ci
          fi

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: cucumber-reports
          path: |
            reports/cucumber/**
            playwright-traces/**
```

---

## Non-Goals

- Cross-browser matrix or parallel sharding (future stories).
