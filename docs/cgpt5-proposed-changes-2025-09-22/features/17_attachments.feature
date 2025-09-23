### #17 Attachments per Application

```gherkin
Feature: Attachments
  As a user
  I want to attach a resume and cover letter to an application
  So that I can track what I submitted

  Scenario: Upload attachments
    Given an application exists
    When I upload a resume and cover letter
    Then they are stored and linked to the application

```

