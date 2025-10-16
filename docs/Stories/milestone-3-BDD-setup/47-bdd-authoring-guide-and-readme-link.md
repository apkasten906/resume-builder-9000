---
title: 47 — BDD: Authoring Guide & README Link
summary: Guidelines and README link for authoring BDD feature files and step definitions
---

This story produces `docs/testing/bdd.md` and a short README section so that a new contributor can add a passing scenario without developer help.

Required contents for `docs/testing/bdd.md`:

- Stack overview: why Cucumber + Playwright
- Folder conventions: `/tests/bdd/{features,steps,pages,support,data}`
- Scripts: `pnpm test:bdd`, `pnpm test:bdd:ci`, `pnpm test:bdd:trace`
- Step-writing guidance: use Page Objects, await locators, avoid sleeps
- Tagging policy summary and examples
- Seeding guidance and fixtures location
- Artifacts: where to find traces/screenshots and how to open them
- Troubleshooting tips: timeouts, flaky steps, trace playback

README change:

- Add a short "Testing (BDD)" subsection linking to `docs/testing/bdd.md`.

Acceptance Criteria:

- New contributor can add a passing scenario by following the doc.
- README contains a link to the BDD doc.
