---
title: 44 — BDD: CI Integration and artifact upload for BDD runs
summary: Story 3: CI workflow and artifact handling for BDD runs
---

Issue: [#44](https://github.com/apkasten906/resume-builder-9000/issues/44)

This story implements CI automation to run the BDD suite on PRs and `main`, collecting artifacts (screenshots, traces, HTML reports) for debugging failures.

Gist

- PR runs: `@smoke and not @wip` (fast feedback)
- Push to `main`: full suite (no tags)
- Upload artifacts to Actions for failed runs

Example GitHub Actions workflow (high level)

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
        with: { node-version: '20' }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - name: Install deps
        run: pnpm install --frozen-lockfile
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run BDD
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            pnpm run test:bdd -- --tags "@smoke and not @wip"
          else
            pnpm run test:bdd:ci
          fi
      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: bdd-artifacts
          path: |
            reports/cucumber/**
            playwright-traces/**
```

Acceptance Criteria

- PR runs the smoke tag and uploads artifacts on failure.
- Push to `main` runs full suite and uploads artifacts.

Notes

- Cache pnpm store and Playwright browser caches in CI for speed.
- Ensure `reports/cucumber/` and `playwright-traces/` are created by the test runner before upload (use `mkdir -p`).
