---
name: "Resume Output & Download UI"
about: "Render tailored resume and allow downloads"
title: "[Story] Resume Output & Download UI"
labels: ["story", "vertical-slice"]
assignees: ""
---

## Summary
Render tailored resume and allow MD/TXT downloads.

## Frontend
- Component: `<ResumeOutput>`
- Buttons: Download MD, Download TXT, Copy to clipboard

## API
- `GET /api/tailoredresumes/:id/download?format=md|txt`
- Returns file content

## Business Logic
- Serialize tailored resume JSON → MD or TXT
- Ensure ATS-safe formatting

## Database
- Reuse `tailored_resumes.output_json`

## Contracts (Types/DTOs)
```ts
// Input: TailoredResume, Output: .md or .txt file
```

## Acceptance Criteria (Gherkin)
```gherkin
Scenario: Download tailored resume
  When tailored resume exists
  Then clicking "Download MD" saves {role}-{company}-resume.md
```

## Definition of Done
- [ ] UI download buttons active only when tailored resume ready
- [ ] Endpoint implemented
- [ ] Serializer tested
- [ ] Unit + E2E tests
