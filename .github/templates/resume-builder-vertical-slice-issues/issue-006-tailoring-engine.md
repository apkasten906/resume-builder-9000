---
name: 'Tailoring Engine UI'
about: 'Generate ATS-safe tailored resume from parsed resume + JD'
title: '[Story] Tailoring Engine UI'
labels: ['story', 'vertical-slice']
assignees: ''
---

## Summary

Generate ATS-safe tailored resume from parsed resume + JD.

## Frontend

- Component: `<TailoringEngine>` with “Run Tailor” button.
- Display tailored resume preview.

## API

- `POST /api/tailoring/run`
- Request: `{ resumeId, jobDescriptionId }`
- Response: `TailoredResume`

## Business Logic

- Rules engine: filter by must-haves, score and reorder bullets, flag missing must-haves.
- Return tailored output + diagnostics.

## Database

```sql
id INTEGER PK,
resume_id INTEGER,
job_description_id INTEGER,
output_json JSON,
diagnostics JSON,
created_at DATETIME
```

## Contracts (Types/DTOs)

```ts
type TailoredResume = { ... }
```

## Acceptance Criteria (Gherkin)

```gherkin
Scenario: Tailoring succeeds
  Given a resume and JD exist
  When POST /api/tailoring/run
  Then tailored resume preview is displayed
  And diagnostics returned
```

## Definition of Done

- [ ] UI built + wired to API
- [ ] Endpoint implemented with rules engine
- [ ] DB schema migrated
- [ ] Diagnostics persisted
- [ ] Unit + E2E tests
