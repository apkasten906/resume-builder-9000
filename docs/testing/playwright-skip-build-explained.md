# PLAYWRIGHT_SKIP_BUILD Flag Explained

## What is it?

`PLAYWRIGHT_SKIP_BUILD=1` is an environment variable that tells Playwright to skip building the Next.js and API applications before running E2E tests.

## Why do we need it?

Currently, our Next.js application has an AuthContext issue that prevents static generation from working:

1. **The Problem:**
   - Next.js tries to statically generate pages during build
   - Our AuthContext uses React hooks that only work client-side
   - Build fails with "Cannot read properties of null (reading 'useContext')"

2. **The Temporary Solution:**
   - Skip the build step entirely with `PLAYWRIGHT_SKIP_BUILD=1`
   - Run tests against development servers instead
   - Dev servers don't need a build - they use hot reload

## How does it work?

### In `global-setup.ts` (lines 25-42):

```typescript
const skipBuild = sharedEnv.PLAYWRIGHT_SKIP_BUILD === '1';

if (!skipBuild) {
  // Build API
  execSync('npm run build --workspace=packages/api', ...);

  // Build Next.js app
  execSync('npm run build --workspace=apps/web', ...);
}
```

### In `playwright.config.ts` (lines 18-23):

```typescript
// Auto-enable skip build by default (can be overridden)
if (!process.env.PLAYWRIGHT_SKIP_BUILD) {
  process.env.PLAYWRIGHT_SKIP_BUILD = '1';
  console.log('ℹ️  PLAYWRIGHT_SKIP_BUILD=1 - Running tests against dev servers');
}
```

## When is it set?

- **✅ Test Explorer**: Automatically set by `playwright.config.ts`
- **✅ Command line**: Automatically set by `playwright.config.ts`
- **✅ CI**: Can be overridden if needed (set to `0` for production builds)
- **✅ npm scripts**: Inherits from config

## Requirements

When using `PLAYWRIGHT_SKIP_BUILD=1`, you MUST have dev servers running:

```bash
# Start dev servers (do this BEFORE running tests)
npm run dev
# OR
./dev.ps1
```

The test script `check-dev-servers.js` verifies servers are running before tests start.

## Future Work

**TODO:** Fix AuthContext to work with SSR/SSG so we can remove this workaround:

1. Make AuthContext SSR-compatible
2. OR use `export const dynamic = 'force-dynamic'` only on pages that need it
3. OR move auth state to a client-only component
4. Remove `PLAYWRIGHT_SKIP_BUILD=1` from config once fixed

## Related Issues

- Issue #36: User Registration Flows
- Commit 1f04515: Added `force-dynamic` (later reverted)
- Commit 8407e06: PR review suggestions (innocent!)

## Troubleshooting

### "Failed to seed unverified test user: 403"

- **Cause**: `TEST_ROUTE_SECRET` or `ENABLE_TEST_ROUTES` not set
- **Fix**: Ensure environment variables are set in `.env` or shell

### "Build failed during global setup"

- **Cause**: `PLAYWRIGHT_SKIP_BUILD` not set
- **Fix**: Should be automatic now, but can set manually: `$env:PLAYWRIGHT_SKIP_BUILD="1"`

### Test Explorer doesn't work

- **Cause**: Dev servers not running
- **Fix**: Start `./dev.ps1` first, then run tests

### Form submits with query params instead of fetch

- **Cause**: React not hydrated (related to `force-dynamic` issue)
- **Fix**: Ensure `force-dynamic` is commented out in `layout.tsx`
