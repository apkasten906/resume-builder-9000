---
name: 'Vertical Slice Story'
about: 'End-to-end feature covering frontend, API, business logic, and database'
title: '[Story] Application Status Tracking'
labels: ['story', 'vertical-slice']
assignees: ''
---

## Summary

As a user, I want to track the current status of my application (Applied, Interviewing, Offer, Rejected, Accepted) so I can manage my job search pipeline.

**Acceptance Criteria:**
```gherkin
Given I view an application
When I update its status
Then the new status is stored and displayed in the application detail view
```

**Definition of Done:**
- Predefined status list implemented.
- Status can be updated through API and UI.
- History of changes is tracked (optional stretch).


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
