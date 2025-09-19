---
name: 'Vertical Slice Story'
about: 'End-to-end feature covering frontend, API, business logic, and database'
title: '[Story] Job Application Model'
labels: ['story', 'vertical-slice']
assignees: ''
---

## Summary

As a user, I want to create and store job application records so that I can track my job search activities in one place.

**Acceptance Criteria (Gherkin):**
```gherkin
Given I apply for a new position
When I save the job application
Then the system should store the job title, company, date applied, status, proposed salary, my desired salary, their offer, and links to submitted resume and cover letter
```

**Definition of Done:**
- Data model exists with all required fields.
- Can create/read/update/delete applications via API.
- Database schema migrations included.


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
