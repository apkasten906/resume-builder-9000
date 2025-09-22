---
name: 'Vertical Slice Story'
about: 'End-to-end feature covering frontend, API, business logic, and database'
title: '[Story] Application Dashboard / List View'
labels: ['story', 'vertical-slice']
assignees: ''
---

## Summary

As a user, I want to see all of my applications in a dashboard view so I can quickly review progress and statuses.

**Acceptance Criteria:**

```gherkin
Given I have multiple applications
When I open the dashboard
Then I see a list of job applications with company, job title, status, and salary info
```

**Definition of Done:**

- List view implemented (API + UI).
- Filtering by status and company available.
- Resume and cover letter links visible.

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
