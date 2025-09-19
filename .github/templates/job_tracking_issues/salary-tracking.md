---
name: 'Vertical Slice Story'
about: 'End-to-end feature covering frontend, API, business logic, and database'
title: '[Story] Salary Tracking'
labels: ['story', 'vertical-slice']
assignees: ''
---

## Summary

As a user, I want to track proposed salary, my desired salary, and any offer received so I can compare jobs against my goals.

**Acceptance Criteria:**
```gherkin
Given I record a new job application
When I enter proposed salary, my desired salary, and later their offer
Then the system stores and displays the values in the application record
```

**Definition of Done:**
- Salary fields (proposed, desired, offered) in the model.
- All values visible in job application details.
- Proper validation (numeric + currency format).


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
