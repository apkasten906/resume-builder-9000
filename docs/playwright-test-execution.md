# Playwright Test Execution Guide

## Proper Test Execution Methods

### ✅ Recommended: Use npm scripts from project root

Always run Playwright tests using the npm scripts defined in the project root:

```bash
# Run all E2E tests
npm run test:e2e

# Run standalone tests (bypassing some project dependencies)
npm run test:e2e:standalone
```

These scripts use the correct configuration files and ensure that all dependencies and environment settings are properly configured.

### ❌ Avoid: Running Playwright directly

**Do not** run Playwright tests directly from the command line within a package directory:

```bash
# DON'T do this - will likely cause dependency conflicts
cd apps/web
npx playwright test
```

## Common Issues

### TypeScript Symbol Conflict Errors

**Error:**

```plaintext
TypeError: Cannot redefine property: Symbol($$jest-matchers-object)
    at [path to node_modules]/@vitest/expect/dist/index.js:667:9
```

**Cause:**  
This error occurs when running Playwright tests directly within the app directory instead of using the npm scripts from the project root. The issue is caused by conflicting test library dependencies between Vitest (for unit tests) and Playwright (for E2E tests).

**Solution:**
Run tests using the npm scripts from the project root directory:

```bash
# From the project root
npm run test:e2e
```

### Command Line Options

When you need to pass additional options to Playwright, append them after `--`:

```bash
# Run a specific test file
npm run test:e2e -- --grep "Applications add and list"

# Run with UI mode
npm run test:e2e -- --ui

# Run in headed mode
npm run test:e2e -- --headed
```

## Debugging Failing Tests

For tests that are failing, especially those related to the applications functionality:

1. Use the `--headed` flag to see the browser during test execution:

   ```bash
   npm run test:e2e -- --grep "Applications" --headed
   ```

2. Review screenshots in the `test-results` directory, which are automatically captured on test failures.

3. Check the API backend logs for any server-side errors.

## Application Tests Specific Guidance

For tests involving the applications functionality:

1. Ensure the API server is running and accessible
2. Verify the database has the correct schema with applications table
3. Check authentication is working correctly (many application issues stem from auth problems)
4. Ensure the test user has proper permissions to access application data

When developing application-related features, always run the full suite of application tests to ensure no regressions:

```bash
npm run test:e2e -- --grep "Applications"
```