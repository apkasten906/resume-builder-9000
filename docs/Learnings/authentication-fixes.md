# Authentication Fixes and Learnings

## Overview

This document captures the issues encountered and resolved with the authentication system in the Resume Builder 9000 application, specifically focusing on E2E test failures related to authentication.

## Issues Identified

### 1. Database User Record Issue

- **Problem**: The user record in the database had a null ID, causing authentication failures.
- **Solution**: Updated the user record to have a valid UUID.
- **Tool Used**: Database script to patch the user ID.

### 2. Authentication Token Mismatch

- **Problem**: The frontend expected the JWT token in the response body, but the backend was only setting it as an HTTP cookie.
- **Solution**: Modified the auth controller to include the token in both the cookie and the JSON response body.
- **File Modified**: `packages/api/src/controllers/auth.ts`

### 3. E2E Test Element Selector Issue

- **Problem**: After fixing the authentication logic, the E2E test was failing because it was looking for an `<h1>` element with "Applications" text, but the actual page used an `<h3>` element.
- **Solution**: Updated the test to look for the correct element selector.
- **File Modified**: `apps/web/tests/e2e/login-flow.spec.ts`

## Code Changes

### Authentication Controller Update

The key change was in the auth controller where we ensured the token was included in both the cookie and the response body:

```typescript
// Before:
res.cookie('session', result.token, { httpOnly: true, sameSite: 'lax', secure: false });
return res.json({ ok: true });

// After:
res.cookie('session', result.token, { httpOnly: true, sameSite: 'lax', secure: false });
return res.json({ ok: true, token: result.token });
```

### Test Update

Modified the element selector in the login flow test:

```typescript
// Before:
await expect(page.locator('h1')).toHaveText(/Applications/i);

// After:
await expect(page.locator('h3')).toHaveText(/Applications/i);
```

## Technical Details

### Authentication Flow

1. User submits login form to `/api/auth/login` route
2. Next.js API route forwards the request to the backend API
3. Backend validates credentials and generates JWT token
4. JWT token is set as an HTTP cookie and included in the response body
5. Frontend uses the token from the response body to set a client-side cookie
6. User is redirected to the applications page

### JWT Token Usage

- The token is stored in an HTTP-only cookie for security
- The token is also returned in the response body for client-side processing
- The token contains the user ID and email, with an expiration of 7 days

## Testing Lessons

1. When debugging authentication issues:
   - Check both server-side and client-side token handling
   - Verify database records are correctly formatted
   - Ensure test selectors match the actual page elements

2. Running servers for testing:
   - The dev.ps1 script should be used to start both web and API servers
   - Ensure no conflicting processes are running on required ports (3000 and 4000)
   - Consider using dedicated test ports to avoid conflicts

## Future Improvements

- Add more robust error handling in the authentication flow
- Implement refresh token functionality
- Add more specific error messages for different authentication failures
- Create dedicated authentication test helpers
- Configure proper test screenshot paths for Playwright tests

## Additional Improvements

### Test Configuration Improvements

During the debugging process, we identified that Playwright test screenshots were being saved directly to the `apps/web` directory, which is not an ideal location for test artifacts. We've made the following improvements:

1. Added a proper `outputDir` configuration to both Playwright config files (`playwright.config.ts` and `playwright.standalone.config.ts`).
2. Updated screenshot paths in the tests to use the configured test results directory.
3. Ensured all test results directories are properly ignored in `.gitignore`.

These changes ensure that:

- Test artifacts are stored in a dedicated location
- The artifacts don't clutter the source code directories
- The artifacts are properly excluded from version control

## Conclusion

The authentication issues were resolved by ensuring proper communication between the frontend and backend regarding JWT tokens. The solution maintains security while providing the necessary flexibility for the frontend to manage the authentication state.
