# Test Logger for Playwright Tests

This utility provides consistent logging for Playwright E2E tests with verbosity control through environment variables.

## Features

- Verbosity control through `PLAYWRIGHT_VERBOSE` environment variable
- Consistent logging format across all tests
- Always shows errors and warnings
- Debug page state helper for troubleshooting

## Usage

```typescript
import { testLogger } from './utils/test-logger';

test('My test', async ({ page }) => {
  // Informational logs - only shown when verbose mode is enabled
  testLogger.log('Starting test');

  // Warnings - always shown
  testLogger.warn('Something unexpected happened');

  // Errors - always shown
  testLogger.error('Failed to complete operation', error);

  // Debug page state - screenshot, URL, title, auth status
  await testLogger.debugPageState(page, 'After login attempt');
});
```

## Environment Variables

- `PLAYWRIGHT_VERBOSE=true` - Enable all logging (default: false)

## Running with Verbose Logging

### Windows PowerShell

```powershell
$env:PLAYWRIGHT_VERBOSE="true"; npx playwright test
```

### Windows Command Prompt

```cmd
set PLAYWRIGHT_VERBOSE=true && npx playwright test
```

### Linux/macOS

```bash
PLAYWRIGHT_VERBOSE=true npx playwright test
```

## CI/CD Integration

Add the environment variable to your CI/CD pipeline configuration:

```yaml
env:
  PLAYWRIGHT_VERBOSE: 'true'
```

## Notes & Links

- If you use VS Code Test Explorer, see `docs/testing/test-explorer-environment-setup.md` and `docs/playwright-test-execution.md` for guidance on the two Playwright run modes (Test Explorer / reuse existing servers vs CLI/CI isolated runs).
- Avoid having multiple files named `playwright.config.ts` in the workspace; if you move or rename configs, reload VS Code (Developer: Reload Window) to clear discovery cache.
