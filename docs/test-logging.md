# Test Logging Controls

This document explains how to control log output during test execution in the Resume Builder 9000 project.

## Test Types and Logging

This project uses two different test frameworks:

- **Vitest**: For unit and integration tests in the API and core packages
- **Playwright**: For end-to-end (E2E) tests in the web app

**Important**: The logging control described in this document applies only to Vitest tests in the API package, not to Playwright E2E tests which have their own logging configuration.

## Default Behavior

By default, logs are suppressed during test execution to keep the test output clean and focused on test results. Only error logs are shown by default.

## Running Tests with Verbose Logging

### Option 1: Enable verbose logging for all unit tests (Vitest)

```bash
# Run all unit tests with verbose logging (from root directory)
npm run test:unit:verbose

# Run a specific test file with verbose logging (from root directory)
npm run test:unit:verbose -- --run=routes.test.ts

# From the API package directory
npm run test:verbose
npm run test:file:verbose tests/routes.test.ts
```

### Option 2: Enable verbose logging for specific tests programmatically

You can enable verbose logging for specific tests or test suites by using the utility functions in `tests/utils/test-logger.js`:

```typescript
import {
  testWithVerboseLogging,
  describeWithVerboseLogging,
  enableTestLogging,
  disableTestLogging,
} from './utils/test-logger.js';

// Method 1: Use testWithVerboseLogging for a single test
testWithVerboseLogging('should do something with logs', async () => {
  // This test will have verbose logging enabled
});

// Method 2: Use describeWithVerboseLogging for a test suite
describeWithVerboseLogging('Feature with logs', () => {
  test('test 1', () => {
    // All tests in this suite will have verbose logging enabled
  });

  test('test 2', () => {
    // This test will also have verbose logging
  });
});

// Method 3: Enable/disable logging manually
test('manual control test', () => {
  enableTestLogging(); // Enable logs for a portion of the test

  // Do something that generates logs

  disableTestLogging(); // Disable logs for the rest of the test
});
```

### Option 3: Enable verbose logging via environment variable

You can set the `TEST_VERBOSE_LOGGING` environment variable to `true` before running tests:

```bash
# On Windows PowerShell
$env:TEST_VERBOSE_LOGGING = 'true'
npm test

# On Linux/macOS
TEST_VERBOSE_LOGGING=true npm test
```

## Implementation Details

The logging system is configured in `packages/api/src/utils/logger.ts`. In test mode, it checks the `TEST_VERBOSE_LOGGING` environment variable and the manually set flags to determine whether to output logs.

## Monorepo Test Structure

This project maintains a clear separation between different test types:

1. **Unit tests (Vitest)**:
   - Run with `npm run test:unit` or `npm run test:unit:verbose`
   - Control logging using the methods described in this document
   - Located throughout the packages in `tests/` directories

2. **E2E tests (Playwright)**:
   - Run with `npm run test:e2e` or `npm run test:e2e:standalone`
   - Have their own logging configuration in the Playwright config files
   - Located in `apps/web/tests/e2e/`

This separation ensures that test configurations don't interfere with each other, which is crucial in a monorepo with multiple test frameworks.
