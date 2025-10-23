# E2E Authentication State Management

**Quick Reference Guide for E2E Test Authentication**

## Overview

This guide explains how to handle authenticated vs. unauthenticated states in Playwright E2E tests.

## Default Behavior

**All E2E tests run as authenticated by default.**

The global test setup (`apps/web/tests/e2e/test-setup.ts`) automatically:

1. Logs in via API (`/auth/login`)
2. Sets a session cookie in the browser context
3. Navigates to `/applications`

This happens in a global `beforeEach` hook that runs before every test.

## When Testing Unauthenticated Behavior

**Explicitly clear cookies at the start of your test:**

```typescript
test('should redirect unauthenticated user', async ({ page, context }) => {
  // Clear the global seeded auth cookie
  await context.clearCookies();

  // Now test unauthenticated behavior
  await page.goto(`${WEB_BASE}/protected-route`);
  await expect(page).toHaveURL(WEB_BASE + '/');
});
```

## When Testing Authenticated Behavior

**Just use the test - auth is already set up:**

```typescript
test('should access protected route', async ({ page }) => {
  // Auth cookie is already seeded - no setup needed
  await page.goto(`${WEB_BASE}/protected-route`);
  await expect(page).toHaveURL(`${WEB_BASE}/protected-route`);
});
```

### Verifying Auth State

If you need to explicitly verify authentication:

```typescript
test('authenticated user can access route', async ({ page }) => {
  // Verify session cookie exists
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session');
  expect(sessionCookie).toBeTruthy();

  // Continue with authenticated test
  await page.goto(`${WEB_BASE}/protected-route`);
});
```

## Common Patterns

### Testing Login Flow

```typescript
test('user can log in', async ({ page, context }) => {
  // Clear global auth to test login from scratch
  await context.clearCookies();

  await page.goto(`${WEB_BASE}/login`);
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('ValidPassword1!');
  await page.getByRole('button', { name: /Sign in/i }).click();

  // Verify login succeeded
  await page.waitForURL(WEB_BASE + '/');
});
```

### Testing Logout

```typescript
test('user can log out', async ({ page }) => {
  // Start authenticated (default)
  await page.goto(WEB_BASE);

  // Log out
  await page.getByRole('button', { name: /Log out/i }).click();

  // Verify logged out
  await page.waitForURL(WEB_BASE + '/');
  await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
});
```

### Testing Route Protection

```typescript
test.describe('Route Protection', () => {
  // DO NOT add a file-level beforeEach that clears cookies!
  // That would conflict with global auth seeding.

  test('redirects anonymous users', async ({ page, context }) => {
    await context.clearCookies(); // Explicit anonymous state
    await page.goto(`${WEB_BASE}/protected-route`);
    await expect(page).toHaveURL(WEB_BASE + '/');
  });

  test('allows authenticated users', async ({ page }) => {
    // Uses global auth (no clearCookies)
    await page.goto(`${WEB_BASE}/protected-route`);
    await expect(page).toHaveURL(`${WEB_BASE}/protected-route`);
  });
});
```

## Anti-Patterns to Avoid

### ❌ File-Level Cookie Clearing

```typescript
test.describe('My Tests', () => {
  // DON'T DO THIS - conflicts with global auth seeding
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('my test', async ({ page }) => {
    // This will always be unauthenticated, even if you intended auth
  });
});
```

### ❌ Brittle UI Assertions for Auth State

```typescript
// DON'T: Flaky due to hydration timing
test('user is logged in', async ({ page }) => {
  await page.goto(WEB_BASE);
  await expect(page.getByText(/Welcome back/i)).toBeVisible();
});

// DO: Check stable cookie state instead
test('user is logged in', async ({ page }) => {
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => c.name === 'session');
  expect(sessionCookie).toBeTruthy();
});
```

## Why This Pattern?

**Benefits:**

- Most tests need auth - defaulting to authenticated saves boilerplate
- Explicit cookie clearing makes intent clear
- No race conditions between global and file-level hooks
- Consistent with real browser behavior (cookies persist across navigations)

**Trade-offs:**

- Developers must remember to clear cookies for anonymous tests
- Global auth state may surprise new contributors

See [ADR-0010](../adr/0010-e2e-auth-test-pattern.md) for detailed rationale.

## Environment Variables

- `AUTH_SESSION_COOKIE_NAME`: Name of session cookie (default: `'session'`)
- `WEB_BASE`: Web app base URL (default: `http://localhost:3000`)
- `API_BASE`: API base URL (default: `http://localhost:4000`)

## Related Files

- Global setup: `apps/web/tests/e2e/test-setup.ts`
- Playwright config: `apps/web/tests/e2e/playwright.config.ts`
- Route protection tests: `apps/web/tests/e2e/route-protection.spec.ts`
- ADR: `docs/adr/0010-e2e-auth-test-pattern.md`
