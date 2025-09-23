### #16 Job Application Model

```gherkin
Feature: Application Model
  As a developer
  I want a normalised data model
  So that features can rely on consistent fields

  Scenario: Schema migration
    Given I run the migration
    Then the DB has tables applications, attachments, statuses

```

