### #8 Red Flags UI

```gherkin
Feature: Red Flags
  As a user
  I want to see warnings about JDs
  So that I can avoid problematic postings

  Scenario: Flag detection
    Given a JD contains phrases (e.g., "unpaid trial", "24/7 availability")
    When I parse the JD
    Then I see Red Flag badges with explanations

```

