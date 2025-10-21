# Test Explorer Environment Variable Setup

## Problem

VS Code Test Explorer was failing to run Playwright E2E tests that required `TEST_ROUTE_SECRET` and other environment variables, even though terminal runs worked fine. Tests failed with `403 Forbidden` errors when calling test-support endpoints.

## Root Cause

**Multiple environment loading points**: Playwright tests can be imported in different ways, and each import path needs to load environment variables independently:

1. **`playwright.config.ts`** - Loads `.env` when Playwright starts (works for all runs)
2. **`global-setup.ts`** - Loads `.env` for global test setup (works for all runs)
3. **`test-setup.ts`** - Custom test fixture that needs to load `.env` for tests that use it
4. **Individual test files** - Tests that import directly from `@playwright/test` bypass `test-setup.ts` and miss env loading

## Solution

### 1. Ensure All Entry Points Load `.env`

Add dotenv loading to **all** test entry points:

**`playwright.config.ts`** (already had this):

```typescript
import dotenv from 'dotenv';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '../../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });
```

**`global-setup.ts`** (already had this):

```typescript
import dotenv from 'dotenv';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });
```

**`test-setup.ts`** (added in this fix):

```typescript
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');
dotenv.config({ path: path.join(repoRoot, '.env') });
```

### 2. Use Consistent Test Imports

**Critical**: All test files must import from `./test-setup` instead of `@playwright/test`:

❌ **Wrong** (bypasses env loading):

```typescript
import { test, expect } from '@playwright/test';
```

✅ **Correct** (includes env loading):

```typescript
import { test, expect } from './test-setup';
```

### 3. Restart Dev Servers After Env Changes

When you add or modify environment variables in `.env`, **restart your dev servers** so they pick up the new values. The API server needs `TEST_ROUTE_SECRET` and `ENABLE_TEST_ROUTES` to be set when it starts.

## Verification

Debug output in `playwright.config.ts` will show if `TEST_ROUTE_SECRET` loaded correctly:

```
✓ TEST_ROUTE_SECRET loaded (length: 44 )
```

If not loaded:

```
❌ TEST_ROUTE_SECRET not loaded from .env!
   Config file: ...
   .env path: ...
   .env exists? true
```

API server debug logs will show access attempts:

```
[test-support] Blocked test-support access { ip: '::1', hasSecret: true, provided: 'no' }
```

- `hasSecret: true` - Server has `TEST_ROUTE_SECRET` configured
- `provided: 'no'` - Test didn't send matching secret (fix: ensure test imports from `./test-setup`)

## Files Modified in This Fix

1. `apps/web/tests/e2e/test-setup.ts` - Added dotenv loading
2. `apps/web/tests/e2e/resend-verification.spec.ts` - Changed import to use `./test-setup`
3. `apps/web/tests/e2e/logout-flow.spec.ts` - Increased timeout for button visibility
4. `apps/web/src/app/confirm-email/page.tsx` - Changed link text to "Go To Login"
5. `apps/web/tests/e2e/registration-flow.spec.ts` - Updated test to use data-testid

## Testing Checklist

When adding new E2E tests:

- [ ] Import from `./test-setup`, not `@playwright/test`
- [ ] Use `process.env.TEST_ROUTE_SECRET` when calling test-support endpoints
- [ ] Add `x-test-secret` header to test-support API requests
- [ ] Verify tests pass from both terminal and Test Explorer
- [ ] Ensure dev servers are running before executing tests

## Related Issues

- Test Explorer runs in a slightly different environment than terminal runs
- VS Code Test Explorer may cache test results - restart VS Code if tests behave inconsistently
- Always verify `.env` file exists in repo root with `TEST_ROUTE_SECRET` and `ENABLE_TEST_ROUTES` set
