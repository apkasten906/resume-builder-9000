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

