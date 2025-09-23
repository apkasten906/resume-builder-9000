# Implementation Plan — Remaining Issues (as of 2025-09-22)

This plan follows the project's **Architectural Layers** and **Vertical Slice** guidance (see `docs/Architecture/*`). Each story includes: goal, scope, architecture impact, acceptance criteria (Gherkin), tests, and rollout plan (feature-flagged where appropriate).

## Index
- #5 Job Description Intake
- #6 Tailoring Engine
- #7 Resume Output and Download UI
- #8 Red Flags UI
- #10 User Login & Identity Management
- #11 UX Guidelines
- #14 Application Dashboard / List View
- #15 Application Status Tracking
- #16 Job Application Model
- #17 Resume & Cover Letter Attachments per Application
- #18 Salary Tracking
- #22 Feature Toggling (Stub)
- #24 Build-time Environmental Flags

---
### #10 User Login & Identity Management

```gherkin
Feature: Authentication with token-based sessions
  As a registered user
  I want to sign in with email + password
  So that I can securely access protected features

  Background:
    Given the system has a user with email "user@example.com" and password "ValidPassword1!"

  Scenario: Successful sign in issues httpOnly session cookie
    When I POST to /auth/login with valid credentials
    Then I receive 200 OK
    And the response sets a httpOnly "session" cookie
    And I can call GET /auth/me and see my profile

  Scenario: Access to protected APIs requires token
    Given I am not authenticated
    When I call GET /applications
    Then I receive 401 Unauthorized

  Scenario: Logout revokes token
    Given I am authenticated
    When I POST to /auth/logout
    Then my cookie is invalidated
    And future requests return 401

```


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


### #5 Job Description Intake

```gherkin
Feature: Job Description Intake
  As a user
  I want to paste or upload a job description
  So that it can be parsed into structured fields

  Scenario: Paste job description
    When I paste a JD into the textarea and click "Parse"
    Then I see Role Title, Company, Location, Requirements, Keywords

  Scenario: Upload JD file
    When I upload a .pdf or .txt JD
    Then the system extracts text and populates the same fields

  Scenario: Validation errors
    When I click Parse with an empty JD
    Then I see an inline error

```


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


### #17 Attachments per Application

```gherkin
Feature: Attachments
  As a user
  I want to attach a resume and cover letter to an application
  So that I can track what I submitted

  Scenario: Upload attachments
    Given an application exists
    When I upload a resume and cover letter
    Then they are stored and linked to the application

```


### #18 Salary Tracking

```gherkin
Feature: Salary Tracking
  As a user
  I want to record salary info
  So that I can compare offers

  Scenario: Capture salary fields
    When I edit an application
    Then I can set currency, base, bonus, equity, notes

```


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

