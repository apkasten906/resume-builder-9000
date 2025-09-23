### #22 Feature Toggling (Stub)

```gherkin
Feature: Feature Flags
  As an engineer
  I want build/runtime flags
  So that we can ship safely

  Scenario: Toggle by env var
    Given FEATURE_AI_TAILORING=false
    Then AI tailoring controls are hidden in the UI

```

