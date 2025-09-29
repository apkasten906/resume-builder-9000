# E2E Testing Status

## Current Status

The end-to-end (E2E) tests in this project have been partially fixed, but some tests still experience issues with authentication and database connectivity.

### Working Tests

- Basic rendering tests that don't require authentication or database access
- Tests in the `apps/web/tests/e2e/basic/` directory
- The `applications-crud.spec.ts` test (when run with `NODE_ENV=test`)
- The `applications-add.spec.ts` test (with proper credentials)

### Non-Working Tests

- Some tests requiring authentication (login-flow, job-intake-tailor, etc.)
- Tests requiring database access via the API without proper environment configuration

## Issues Identified

1. **Authentication Problems**
   - The tests cannot authenticate properly with the API
   - The login flow in tests is failing to set session cookies correctly
   - API returns 401 Unauthorized for protected endpoints during tests

2. **Database Connection Issues**
   - The better-sqlite3 module is failing to load native bindings
   - This prevents the API from starting correctly

3. **Module Resolution Problems**
   - Some Next.js components are failing to load properly
   - SWC binary issues for Windows

## Running Tests

### To Run Working Tests

```powershell
# Run only the basic tests that don't require authentication
npx playwright test apps/web/tests/e2e/basic/ --reporter=dot

# Run the applications test (requires NODE_ENV=test)
$env:NODE_ENV="test"; npx playwright test apps/web/tests/e2e/applications-crud.spec.ts --reporter=dot
```

### To Run All Tests (Some Will Fail)

```powershell
# Run all tests (expect some failures)
$env:NODE_ENV="test"; npx playwright test --reporter=dot
```

## Fix Recommendations

1. **Authentication Fixes**
   - Create a test-specific authentication bypass in the API
   - Add a separate test mode that doesn't require authentication
   - Fix the session cookie handling in tests

2. **Database Fixes**
   - Reinstall better-sqlite3 with the correct bindings for your platform
   - Consider using an in-memory SQLite database for tests
   - Mock database connections for tests

3. **Module Resolution Fixes**
   - Rebuild the Next.js application
   - Clear `.next` cache directories before rebuilding
