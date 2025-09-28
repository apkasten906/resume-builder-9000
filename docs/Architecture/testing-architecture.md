# Testing Architecture

## Overview

This document outlines the testing strategies, boundaries, and tools used in the `resume-builder-9000` project. The goal is to ensure high-quality, reliable, and maintainable code through comprehensive testing.

## Testing Strategies

- **Unit Testing**:
  - Focuses on individual functions and methods.
  - Ensures correctness of isolated units of code.

- **Integration Testing**:
  - Verifies interactions between multiple components.
  - Ensures that modules work together as expected.
  - For database integrations:
    - Use isolated test databases (in-memory or dedicated files)
    - Properly manage database connections between tests
    - Clean up test data after each test

- **End-to-End (E2E) Testing**:
  - Simulates real-world user scenarios.
  - Ensures the entire application works as intended.

## Test Boundaries

- **Frontend**:
  - Unit tests for React components.
  - Integration tests for page-level interactions.

- **Backend**:
  - Unit tests for services and utilities.
  - Integration tests for API endpoints.

- **Shared Logic**:
  - Unit tests for core business logic.
  - Integration tests for interactions with the backend.

## Tools Integration

- **Vitest**:
  - Primary testing framework for unit and integration tests.
  - Provides fast and reliable test execution.

- **React Testing Library**:
  - Used for testing React components.
  - Focuses on user interactions and accessibility.

- **Playwright**:
  - Used for end-to-end testing.
  - Simulates user workflows across the application.

## Best Practices

- Write tests alongside new features to ensure test coverage.
- Use mocking to isolate units of code during testing.
- Ensure tests are deterministic and do not rely on external factors.
- Regularly review and update test cases to reflect changes in the codebase.

## Database Integration Testing

### Key Principles

- **Isolation**: Each test should run against its own isolated database instance
- **Cleanup**: Reset database state between tests to prevent test interference
- **Reproducibility**: Tests should produce the same results regardless of execution order

### Implementation Patterns

1. **Connection Management**:
   - Use the `connectDatabase()` and `closeDatabase()` functions from `db.ts`
   - Close connections after each test to ensure proper isolation
   - Create unique database paths (e.g., with timestamps) to prevent interference

2. **Test Database Options**:
   - In-memory databases (`:memory:`) for speed and simplicity
   - File-based test databases for tests requiring persistence
   - Set via environment variable: `process.env.DB_PATH = testDbPath;`

3. **Test Lifecycle Hooks**:

   ```typescript
   // In your test file
   beforeEach(() => {
     // Set up a fresh test database
     closeDatabase();
     process.env.DB_PATH = uniqueTestPath;
     // Initialize schema...
   });

   afterEach(() => {
     // Clean up
     closeDatabase();
     delete process.env.DB_PATH;
     // Delete test database file if needed...
   });
   ```

## TypeScript Testing Strategy

For detailed TypeScript testing standards and practices, please refer to:

- [ADR 0007: TypeScript Testing Architecture](../adr/0007-typescript-testing.md)

Our TypeScript testing strategy follows these key principles:

- **Test Co-location**: Tests should be located close to implementation files
- **Deterministic Tests**: Avoid flaky tests; ensure reproducibility
- **Data Management**: Use factories/fixtures; avoid hardcoded test data
- **Comprehensive Coverage**: Focus on core business logic and edge cases

## Future Enhancements

- **Frontend**:
  - Add visual regression testing to catch UI changes
  - Implement component testing with Storybook integration

- **Backend**:
  - Implement contract testing for API endpoints
  - Add performance testing for critical API routes

- **E2E Testing**:
  - Expand test coverage to include edge cases and error scenarios
  - Implement visual comparison testing for critical UI flows
