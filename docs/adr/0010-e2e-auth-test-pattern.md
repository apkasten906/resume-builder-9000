# ADR-0010: E2E Authentication Testing Pattern

**Status:** Accepted
**Date:** 2025-10-23
**Context:** Route protection E2E test flakiness and auth state management

## Context

Our E2E tests need to verify both authenticated and unauthenticated user behavior. We discovered flakiness in route protection tests caused by unclear auth state management between test setup and individual test specs.

### The Problem

Initial approach had race conditions:

- Global `test-setup.ts` seeds auth cookies in a `beforeEach` hook
- Individual spec files also had `beforeEach` hooks that cleared cookies
- Execution order between global and file-level hooks was unpredictable
- "Authenticated user" tests sometimes ran without auth, causing timeouts

## Decision

**Adopt explicit auth state management per test:**

1. **Global Default: Authenticated State**
   - `test-setup.ts` provides a global `beforeEach` that seeds auth cookies
   - This is the default state for all E2E tests
   - Rationale: Most E2E tests require authenticated state

2. **Opt-In Anonymous State**
   - Tests requiring unauthenticated state explicitly call `context.clearCookies()` at test start
   - Example:
     ```typescript
     test('should redirect unauthenticated user', async ({ page, context }) => {
       await context.clearCookies(); // Explicit anonymous state
       // ... test logic
     });
     ```

3. **No File-Level Cookie Clearing**
   - Remove file-level `beforeEach` hooks that clear cookies
   - Each test declares its auth requirement explicitly
   - Avoids hook execution order ambiguity

4. **Stable Auth Assertions**
   - Verify auth via cookie presence check: `cookies.find(c => c.name === 'session')`
   - Avoids hydration timing issues with UI assertions
   - Cookie check is stable and deterministic

## Implementation Pattern

### Test Setup (Global)

```typescript
// apps/web/tests/e2e/test-setup.ts
base.beforeEach(async ({ page }) => {
  await seedAuthCookie(page); // Sets session cookie
  await page.goto(`${WEB_BASE}/applications`);
});
```

### Unauthenticated Tests

```typescript
test('should redirect to home', async ({ page, context }) => {
  await context.clearCookies(); // Opt-in to anonymous state
  await page.goto(`${WEB_BASE}/protected-route`);
  await expect(page).toHaveURL(WEB_BASE + '/');
});
```

### Authenticated Tests

```typescript
test('should access protected route', async ({ page }) => {
  // Relies on global seeded auth cookie (no explicit clearing)
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session');
  expect(sessionCookie).toBeTruthy(); // Verify auth present

  await page.goto(`${WEB_BASE}/protected-route`);
  await expect(page).toHaveURL(`${WEB_BASE}/protected-route`);
});
```

## Consequences

### Positive

- ✅ Eliminates race conditions between hook execution
- ✅ Each test explicitly declares auth requirements
- ✅ More maintainable - auth intent is clear in test code
- ✅ Reduces flakiness from hydration timing issues
- ✅ Consistent with patterns in other spec files

### Negative

- ⚠️ Requires discipline: devs must remember to clear cookies for anonymous tests
- ⚠️ Global authenticated state may surprise new contributors

### Mitigations

- Document pattern clearly (this ADR)
- Add comment in test-setup.ts explaining the pattern
- Code review checklist: verify auth state is explicit

## Alternatives Considered

### 1. No Global Auth Seeding

- Each test authenticates explicitly when needed
- **Rejected:** Adds boilerplate to most tests; slower execution

### 2. Separate Test Configs (Authenticated vs. Anonymous)

- Two Playwright configs: one with auth, one without
- **Rejected:** Increases complexity; harder to test mixed scenarios in one spec

### 3. Custom Fixtures for Auth State

- `test.use({ authenticated: false })` decorator pattern
- **Considered for future:** Could layer on top of current approach if needed

## Validation

The pattern has been validated:

- Route protection tests pass consistently (full file run: 17 passed locally)
- The authenticated fallback and cookie-handling changes were exercised and verified
- Full E2E suite was executed and confirmed green in the development environment
- Test artifacts from earlier failures were cleaned up as part of housekeeping
- No security regression: route protection logic unchanged

## References

- Initial issue: Route protection tests timing out due to missing auth
- Related specs using similar pattern:
  - `logout-cookie-clearing.spec.ts`
  - `registration-flow.spec.ts`
  - `login-flow-full.spec.ts`
- Global test setup: `apps/web/tests/e2e/test-setup.ts`
- Route protection spec: `apps/web/tests/e2e/route-protection.spec.ts`
