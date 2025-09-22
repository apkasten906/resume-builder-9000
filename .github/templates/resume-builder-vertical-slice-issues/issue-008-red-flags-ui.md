---
name: 'Red Flags UI'
about: 'Display potential issues in tailored resume'
title: '[Story] Red Flags UI'
labels: ['story', 'vertical-slice']
assignees: ''
---

## Summary

Display potential issues (missing must-haves, date gaps, formatting risks).

## Frontend

- Component: `<RedFlagsPanel>`
- Badges + list items linking to affected section
- Dismiss/resolve interactions

## API

- Part of tailoring diagnostics
- `GET /api/tailoredresumes/:id/redflags`

## Business Logic

- Detectors: missing must-haves, resume length >2 pages, date gaps >6mo, formatting risks
- Store in diagnostics

## Database

- Stored in `tailored_resumes.diagnostics`

## Contracts (Types/DTOs)

```ts
type RedFlag = { id: string; category: string; message: string; section?: string };
```

## Acceptance Criteria (Gherkin)

```gherkin
Scenario: Red flags present
  When tailoring detects missing must-haves
  Then panel shows "Missing: Kubernetes"
```

## Definition of Done

- [ ] Panel renders diagnostics
- [ ] Dismiss works (local state)
- [ ] Detectors tested
- [ ] E2E test: missing must-haves visible
