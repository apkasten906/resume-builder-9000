### #6 Tailoring Engine

```gherkin
Feature: Tailoring Engine
  As a user
  I want my resume content ranked against the job description
  So that I can select the best matched bullets

  Scenario: Relevance scoring
    Given I have uploaded a resume and parsed a JD
    When I click "Tailor"
    Then I see each resume bullet with a score 0..100
    And I can filter by score threshold

  Scenario: Toggle experimental AI enhancements (feature-flagged)
    Given FEATURE_AI_TAILORING=false
    Then the pipeline uses rule-based scoring only
    And when FEATURE_AI_TAILORING=true
    Then semantic scoring is added

```

