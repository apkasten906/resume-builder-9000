# 📋 Vertical Slice Issue Templates

We use **vertical slice stories** to ensure every feature is implemented end-to-end (Frontend → API → Business Logic → Database).  

New issues should be created using the provided templates in `.github/ISSUE_TEMPLATE/`. These enforce consistent structure and AI-friendly development.

---

## 🔹 How to Create a Story
When creating a new GitHub Issue:
1. Select **“Vertical Slice Story”**.
2. Fill out all sections:
   - Summary  
   - Frontend  
   - API  
   - Business Logic  
   - Database  
   - Contracts (Types/DTOs)  
   - Acceptance Criteria (Gherkin)  
   - Definition of Done  

---

## 🔹 Gherkin Syntax Snippets

Use **Gherkin** for writing Acceptance Criteria. This ensures scenarios are clear and testable.

### Example Template
```gherkin
Feature: <Feature name>
  Scenario: <Scenario description>
    Given <initial context>
    When <action occurs>
    Then <expected result>
```

### Example for Resume Upload
```gherkin
Feature: Resume Upload
  Scenario: Upload valid resume
    Given the user selects a valid DOCX file
    When POST /api/resumes/parse succeeds
    Then preview displays parsed summary, experience, and skills
    And a row exists in "resumes"

  Scenario: Upload unsupported file
    Given the user selects a .jpg
    When POST /api/resumes/parse
    Then error message "Unsupported file type" is shown
```

---

## 🔹 Definition of Done (DoD)

Every story must include a checklist of conditions that must be met before closing.  
Check off each when the task is complete.

### Example DoD
```markdown
- [ ] UI implemented and wired to API
- [ ] API endpoint implemented with validation
- [ ] Business logic complete with unit tests
- [ ] Database schema migrated and persisted
- [ ] End-to-end tests cover happy path and error path
```

---

## 🔹 Why This Matters
- Ensures **vertical slices**: one story = one complete feature.  
- Keeps **Copilot/GPT** aligned across frontend, backend, and DB.  
- Produces **testable acceptance criteria**.  
- Enforces **consistency and accessibility** across the app.  
