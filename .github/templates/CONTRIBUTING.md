# Contributing to Resume Builder 9000

Thank you for contributing! 🎉

We follow a **vertical slice story** workflow to ensure every feature is built end-to-end (Frontend → API → Business Logic → Database).

---

## 🚀 Workflow

1. **Create Issues Using Templates**
   - All new issues must be created from the provided templates in `.github/ISSUE_TEMPLATE/`.
   - Blank issues are disabled to keep work consistent and AI-friendly.
   - See [ISSUE_TEMPLATE_README.md](.github/ISSUE_TEMPLATE/README.md) for guidance.

2. **Use Gherkin for Acceptance Criteria**
   - Every issue must include scenarios written in Gherkin syntax.
   - This makes it easy to implement automated tests and guide AI developers.

3. **Include Definition of Done**
   - Each issue must end with a DoD checklist.
   - Stories are not closed until all items are checked off.

---

## 📋 Example Structure

```markdown
## Summary

Short description

## Frontend

Details of UI components

## API

Endpoints, payloads, responses

## Business Logic

Rules and workflows

## Database

Tables, migrations

## Contracts

DTOs / TypeScript interfaces

## Acceptance Criteria (Gherkin)

Feature: ...
Scenario: ...
Given ...
When ...
Then ...

## Definition of Done

- [ ] UI wired to API
- [ ] API implemented
- [ ] DB schema updated
- [ ] Unit + E2E tests
```

---

## 💡 Tips

- Keep scope small → 1 story = 1 feature slice.
- Use clear naming → helps AI fill in code correctly.
- Favor **rules-based** tailoring for MVP → AI tailoring comes later.

---

Happy building! 🚀
