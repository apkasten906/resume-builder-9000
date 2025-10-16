---
title: Authoring Docs for BDD
summary: Guidelines for writing feature files and step definitions
---

- Keep feature files short and focused on acceptance criteria.
- Prefer human-readable steps and delegate implementation to step defs.
- Store reusable step defs and page objects under `tests/bdd/steps` and `tests/bdd/page-objects`.

# Story 6 — Authoring Guide (docs/testing/bdd.md) + README Link

**Objective**  
Document how to create/extend BDD features, steps, and page objects; how to run locally/CI; and how to handle common failures. Add a short Testing section to README with a link.

---

## Requirements

1. **docs/testing/bdd.md** must include:
   - **Stack overview**: Why Cucumber + Playwright (JSON reports, readable Gherkin, strong browser API).
   - **Folder conventions**: `/tests/bdd/{features,steps,pages,support,data}`.
   - **Scripts**: `pnpm test:bdd`, `pnpm test:bdd:ci`, `pnpm test:bdd:trace`.
   - **Writing steps**: Use Page Objects; avoid raw selectors; await locators; no sleeps.
   - **Tagging policy**: `@wip` (excluded in CI), `@smoke` (PRs), `@regression` (main/nightly).
   - **Seeding**: How to add fixtures or seed scripts; idempotence expectations.
   - **Artifacts**: Where reports/traces/screenshots are stored and how to open them.
   - **Troubleshooting**: timeouts, detached elements, trace playback, flaky retries.
2. **README.md**
   - Add a “Testing (BDD)” section with one paragraph and a link to the doc.

---

## Acceptance Criteria

- [ ] A new contributor can add a passing scenario by following the doc alone.
- [ ] README contains a **Testing (BDD)** link to `docs/testing/bdd.md`.

---

## Definition of Done

- [ ] PR includes the new doc and README update; lints/compiles clean.
