Feature: Hello (Stack Wiring)
  Verify that Cucumber steps can drive Playwright to open the app.

  Background:
    Given I set WEB_BASE to default if not provided

  @smoke
  Scenario: Open the dashboard
    When I navigate to the dashboard
    Then the page title should contain "Resume Builder"
