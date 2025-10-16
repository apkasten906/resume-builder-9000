---
title: 46 — BDD: Deterministic Test Data & Seeding
summary: Deterministic fixtures and seed helpers for BDD tests
---

Objective
Provide deterministic fixtures and seeding helpers so BDD scenarios can run from a clean, reproducible environment in CI and locally.

Deliverables

- `tests/bdd/data/jobs.examples.json` with sample rows
- `tests/bdd/support/seed.ts` (optional) to seed the app via API
- Background step that can call seeding or create minimal state via API

Guidelines

- Use fixed IDs in fixtures to avoid varying primary keys.
- Use deterministic timestamps if the system requires them (e.g., a frozen clock helper). Avoid Date.now() in fixtures.
- Ensure seed scripts are idempotent (upsert semantics) so repeated runs don't duplicate.

Example fixture

```json
[
  { "title": "Senior SWE", "company": "Acme" },
  { "title": "Backend Lead", "company": "Globex" }
]
```

Seed helper sketch (Node)

```ts
// tests/bdd/support/seed.ts
import fetch from 'node-fetch';
async function seed() {
  await fetch(process.env.API_BASE + '/seed/jobs', {
    method: 'POST',
    body: JSON.stringify({
      jobs: [
        /*...*/
      ],
    }),
  });
}
seed()
  .then(() => console.log('seeded'))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
```

Acceptance Criteria

- Fixtures checked in and used by Background steps.
- Seed scripts or steps are idempotent.
