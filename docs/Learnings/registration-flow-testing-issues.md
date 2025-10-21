# Registration Flow Testing - Issue Report

## Date

October 16, 2025

## Issue Summary

Registration flow E2E tests are failing with timeouts when trying to locate form fields. The tests consistently show "Application error: a client-side exception has occurred" in the error contexts.

## Test Status

❌ **FAILING** - All registration flow tests timing out

### Failing Tests:

1. `completes the multi-step registration process` - Times out looking for Email or Password fields
2. `surfaces validation errors for weak passwords and duplicate emails` - Times out looking for Email field

## Error Patterns

### Primary Error

```
Test timeout of 60000ms exceeded.
Error: locator.fill: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByLabel('Email')
```

### Page Error Context

```yaml
- 'heading "Application error: a client-side exception has occurred (see the browser console for more information)." [level=2]'
```

## Environment Status

✅ Dev servers running correctly:

- API Server: http://localhost:4000 (Status: 302)
- Web Server: http://localhost:3000 (Status: 200)

✅ Build succeeds:

- Next.js builds successfully without errors
- TypeScript compiles without errors

✅ Authentication works:

- Login test passes
- Test user authentication verified

## Possible Root Causes

### 1. Client-Side Runtime Error (Most Likely)

The register page is throwing a JavaScript error that prevents the form from rendering. The page shell renders but the React component errors out.

**Evidence:**

- Error context shows "Application error: a client-side exception has occurred"
- Page HTML loads (heading visible) but form fields don't render
- Production build succeeds but runtime fails

**Potential causes:**

- Missing or incorrect import
- Runtime dependency issue with `@rb9k/core` evaluatePassword function
- React hydration mismatch
- Client/server component boundary issue

### 2. Build vs Development Mode Mismatch

Playwright config starts its own dev servers, which may be in a different state than the manually running servers.

**Evidence:**

- Tests run a full build before starting
- `reuseExistingServer` is set but may not be working correctly

### 3. Environment Variable Issues

Missing or incorrect environment variables in the test environment.

## Investigation Steps Needed

### Immediate Actions

1. **Check browser console for actual error:**
   - Run test with `--headed` flag and manually inspect console
   - Or extract console logs from Playwright trace file

2. **Verify register page loads manually:**

   ```bash
   # Open in actual browser
   start http://localhost:3000/register
   ```

   - Check browser console for JavaScript errors
   - Verify form fields render correctly

3. **Check for hydration or import errors:**
   ```bash
   # Review server logs when accessing /register
   # Look for Next.js errors or warnings
   ```

### Code Review Points

1. Check `apps/web/src/app/register/page.tsx`:
   - Verify all imports resolve correctly
   - Check `evaluatePassword` from `@rb9k/core` is exported properly
   - Ensure `Input` component is working

2. Check `packages/core/src/index.ts`:
   - Verify `evaluatePassword` is properly exported
   - Ensure password policy modules are built

3. Check `packages/core/src/auth/passwordPolicy.ts`:
   - Verify function signature matches usage
   - Ensure all dependencies are available in client context

## Story Requirements Status

According to `docs/Stories/story-36-user-registration-flows.md`:

### Acceptance Criteria

- ❓ Registration form supports multi-step input - **BLOCKED** (form not rendering)
- ❓ Password guidelines clearly displayed and enforced - **BLOCKED** (form not rendering)
- ❓ Field-level error indicators - **BLOCKED** (form not rendering)
- ❓ Successful registration creates user - **BLOCKED** (can't reach registration)
- ❌ All registration flows covered by E2E tests - **FAILING**
- ❓ Robust against edge cases - **UNTESTED**
- ❓ Accessibility best practices - **UNTESTED**

## Recommended Next Steps

### Step 1: Diagnose the Client-Side Error

```bash
# Run with headed mode to see actual error
npx playwright test apps/web/tests/e2e/registration-flow.spec.ts --headed --max-failures=1

# Or manually test
1. Open http://localhost:3000/register in browser
2. Open Developer Tools (F12)
3. Check Console tab for errors
4. Check Network tab for failed requests
```

### Step 2: Fix the Root Cause

Based on the error found, likely one of:

- Fix import path or export
- Ensure client component directives are correct
- Fix any hydration mismatches
- Add missing dependencies

### Step 3: Re-run Tests

```bash
npm run test:e2e
```

### Step 4: Verify Story Requirements

Once tests pass, manually verify:

- Multi-step form navigation works
- Password requirements display correctly
- Error handling for duplicate emails
- Email verification flow
- Accessibility with keyboard navigation and screen readers

## Related Files

- Test: `apps/web/tests/e2e/registration-flow.spec.ts`
- Component: `apps/web/src/app/register/page.tsx`
- API Route: `apps/web/src/app/api/auth/register/route.ts`
- Backend Service: `packages/api/src/services/authService.ts`
- Password Policy: `packages/core/src/auth/passwordPolicy.ts`
- Story: `docs/Stories/story-36-user-registration-flows.md`

## Notes

- Login functionality is verified working
- Test user authentication is confirmed
- Database seeding is functioning correctly
- The issue is isolated to the registration page client-side rendering
