### #15 Application Status Tracking

```gherkin
Feature: Status Tracking
  As a user
  I want to update application stages
  So that I can manage my pipeline

  Scenario: Update status
    Given an application exists
    When I change Stage to "Interview"
    Then history shows a timestamped event

```

