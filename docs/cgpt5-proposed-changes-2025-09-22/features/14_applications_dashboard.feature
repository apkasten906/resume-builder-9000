### #14 Application Dashboard / List View

```gherkin
Feature: Applications Dashboard
  As a user
  I want a list of my job applications
  So that I can track statuses over time

  Scenario: Initial list
    When I navigate to /applications
    Then I see a table with Company, Role, Stage, Last Updated

  Scenario: Filter & sort
    When I set a filter or sort
    Then the table updates client-side

```

