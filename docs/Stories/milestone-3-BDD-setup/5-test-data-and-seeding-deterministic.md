---
title: Test Data & Seeding (Deterministic)
summary: Recommendations for deterministic test data and seeding for BDD tests.
---

- Use fixed fixture IDs and deterministic RNG seeds for tests.
- Provide `scripts/seed-users.js` and similar scripts to seed the DB before CI runs.
- Avoid using system time; if needed, inject clock/time helpers into tests.

# Story 5 — Deterministic Test Data & Seeding

**Objective**  
Provide small, deterministic fixtures and/or a seed utility to set up minimal state so BDD scenarios run from a clean environment without manual prep.

---

## Requirements

1. **Fixtures directory**
   - `tests/bdd/data/jobs.examples.json` (2–3 entries: title, company).
2. **Seed helper**
   - Either: a small Node script `tests/bdd/support/seed.ts` that calls the app API
   - Or: a Background step that deterministically creates state via UI (acceptable for MVP)
3. **Idempotence**
   - Re-running seeds should not duplicate records or should tolerate duplicates gracefully.

---

## Acceptance Criteria

- [ ] `jobs.examples.json` checked in with fake data only.
- [ ] Scenarios use fixtures/seed rather than hard-coded values scattered across steps.
- [ ] Suite passes from a clean environment (no manual intervention).

---

## Definition of Done

- [ ] Documentation updated with “Seeding” instructions (Story 6).

---

## Exact Implementation Steps (for Codex)

1. Create `tests/bdd/data/jobs.examples.json`:
   ```json
   [
     { "title": "Senior SWE", "company": "Acme" },
     { "title": "Backend Lead", "company": "Globex" }
   ]
   ```
2. (Optional) Create `tests/bdd/support/seed.ts` with TODO calls to your API endpoints; print a short summary on success.
3. Update feature `Background` to either call the seed (via a custom step) or to create data via UI quickly.
