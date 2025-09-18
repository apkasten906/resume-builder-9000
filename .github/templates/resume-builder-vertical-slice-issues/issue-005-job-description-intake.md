---
name: "Job Description Intake UI"
about: "Upload or paste JD, parse to JSON, and persist"
title: "[Story] Job Description Intake UI"
labels: ["story", "vertical-slice"]
assignees: ""
---

## Summary
Enable JD upload or paste, extract structured requirements, and persist.

## Frontend
- Component: `<JobDescriptionIntake>`
- Tabs: Upload | Paste
- Show preview chips: must-haves, nice-to-haves, keywords

## API
- `POST /api/jobdescriptions/parse`
- Request: file upload or text blob
- Response: `JobDescriptionParsed`

## Business Logic
- Extract role, company, location, must-haves, keywords.
- Store raw text + structured fields.

## Database
```sql
id INTEGER PK,
user_id TEXT,
file_name TEXT,
parsed_json JSON,
raw_text TEXT,
created_at DATETIME
```

## Contracts (Types/DTOs)
```ts
type JobDescriptionParsed = { ... }
```

## Acceptance Criteria (Gherkin)
```gherkin
Scenario: Paste JD text
  When the user pastes >200 chars
  Then POST /api/jobdescriptions/parse returns structured data
  And preview shows must-haves and keywords
```

## Definition of Done
- [ ] UI built + wired to API
- [ ] Endpoint implemented (file + paste)
- [ ] Parsed JSON persisted
- [ ] Unit + E2E tests
