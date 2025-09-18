---
name: "Resume Upload UI"
about: "Upload resumes, parse to JSON, and persist"
title: "[Story] Resume Upload UI"
labels: ["story", "vertical-slice"]
assignees: ""
---

## Summary
Allow users to upload resumes (PDF, DOCX, MD, TXT). Parse and store structured data for tailoring.

## Frontend
- Component: `<ResumeUpload>` with drag-and-drop and file picker.
- States: Idle → Loading → Success (preview JSON sections) → Error.
- Validation: max 5MB, allowed types.
- Accessibility: aria labels, keyboard operable.

## API
- `POST /api/resumes/parse`
- Request: multipart form with file
- Response: `ResumeParsed` JSON
- Errors: 400 (unsupported), 413 (too large), 500 (parse fail)

## Business Logic
- Use parsers (pdfjs, mammoth, plain text).
- Normalize into `ResumeParsed`.
- Return preview + persist in DB.

## Database
```sql
id INTEGER PK,
user_id TEXT,
file_name TEXT,
file_type TEXT,
file_size INTEGER,
parsed_json JSON,
created_at DATETIME
```

## Contracts (Types/DTOs)
```ts
type ResumeParsed = { ... }
```

## Acceptance Criteria (Gherkin)
```gherkin
Scenario: Upload valid resume
  Given the user selects a valid DOCX file
  When POST /api/resumes/parse succeeds
  Then preview displays parsed summary, experience, skills
  And a row exists in "resumes"

Scenario: Upload unsupported type
  When the user uploads a .jpg
  Then error message "Unsupported file type" is shown
```

## Definition of Done
- [ ] UI implemented and wired to API
- [ ] Endpoint implemented with parsing + validation
- [ ] DB schema migrated
- [ ] Parsed JSON persisted
- [ ] Unit + E2E tests green
