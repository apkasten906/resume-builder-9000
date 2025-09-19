---
name: 'Vertical Slice Story'
about: 'End-to-end feature covering frontend, API, business logic, and database'
title: '[Story] Resume & Cover Letter Attachments per Application'
labels: ['story', 'vertical-slice']
assignees: ''
---

## Summary

As a user, I want to attach specific versions of my resume and cover letter to each application so I know exactly what I submitted.

**Acceptance Criteria:**
```gherkin
Given I select a resume and cover letter for an application
When I save the application
Then those documents are linked to the record and retrievable later
```

**Definition of Done:**
- File storage or references implemented.
- Resume/cover letter associations visible in UI.
- Linked files retrievable by job application.


---

## Frontend

- Component(s):
- States (Idle, Loading, Success, Error, etc.):
- Validation rules:
- Accessibility considerations:

---

## API

- Endpoint(s):
- HTTP method(s):
- Request payload:
- Response schema:
- Error cases:

---

## Business Logic

- Core rules:
- Edge cases:
- Error handling:

---

## Database

- Tables/entities required:
- Schema changes/migrations:
- Relationships:

---

## Contracts (Types/DTOs)

```ts
// Example TypeScript interface
```
