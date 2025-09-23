### #24 Build-time Environmental Flags

```gherkin
Feature: Build Flags
  As an engineer
  I want env-based builds
  So that dev/preview/prod behave appropriately

  Scenario: Next.js public/private env usage
    Given NEXT_PUBLIC_* variables are defined
    Then the web app reads them via process.env.NEXT_PUBLIC_*

```

