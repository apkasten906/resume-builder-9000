### #7 Resume Output and Download UI

```gherkin
Feature: Resume Preview & Download
  As a user
  I want to preview and download the tailored resume
  So that I can submit it quickly

  Scenario: Live preview
    Given I have selected bullets for export
    When I open the Preview tab
    Then I see a formatted resume preview with sections

  Scenario: Download
    When I click "Download PDF"
    Then a PDF is downloaded

```

