### #11 UX Guidelines

```gherkin
Feature: Project-wide UX Guidelines
  As a contributor
  I want a shared UX style guide
  So that new UIs are consistent and accessible

  Scenario: UI components adhere to style tokens
    Given the design tokens are defined in tailwind.config.js
    When a new screen is created
    Then it uses spacing, color, and typography tokens from the guide

  Scenario: Accessibility checklist
    Given a page has interactive elements
    Then it has keyboard focus states, ARIA labels where needed, and meets color contrast AA

```

