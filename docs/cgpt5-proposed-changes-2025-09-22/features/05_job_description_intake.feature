### #5 Job Description Intake

```gherkin
Feature: Job Description Intake
  As a user
  I want to paste or upload a job description
  So that it can be parsed into structured fields

  Scenario: Paste job description
    When I paste a JD into the textarea and click "Parse"
    Then I see Role Title, Company, Location, Requirements, Keywords

  Scenario: Upload JD file
    When I upload a .pdf or .txt JD
    Then the system extracts text and populates the same fields

  Scenario: Validation errors
    When I click Parse with an empty JD
    Then I see an inline error

```

