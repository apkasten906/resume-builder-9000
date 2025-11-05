# Playwright Testing Guidelines

## Known Issue

Direct calls to `npx playwright test` can cause conflicts with Vitest in this project, resulting in errors like:

```javascript
TypeError: Cannot redefine property: Symbol($$jest-matchers-object)
```

This happens because both Playwright and Vitest include their own implementations of the `expect` library, and they conflict when loaded in the same Node.js process.

## Using the Correct Testing Commands

Always use the npm scripts provided in the project:

```bash
# Run Playwright tests
npm run test:e2e

# Run Playwright tests in standalone mode (useful for debugging)
npm run test:e2e:standalone
```

## Testing protocol (recommended)

Before running Playwright E2E tests, ensure the development environment is running using the repository's Dev Script task in VS Code. This makes sure both web and API servers are started with the expected environment and hot-reload enabled.

Step-by-step (VS Code)

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2. Select "Tasks: Run Task".
3. Choose "Run Dev Script" (or the workspace task labeled `Run Dev Script (direct)` / `Run Dev and E2E Test Script` when appropriate).
4. Wait until both the API and Web servers report healthy status in the terminal.

Then run tests from the repo root:

```bash
npm run test:e2e
```

You can run an individual spec or pass additional Playwright CLI flags via the script, for example:

```bash
# Run a single spec with dot reporter
npm run test:e2e -- apps/web/tests/e2e/resume-upload.spec.ts --reporter=dot
```

This protocol ensures:

- Dev server serves the current build with matching chunk hashes
- Hot reload is enabled for rapid iteration
- API server is available for backend integration tests
- Tests run against a stable, consistent environment

## Automated pre-flight checks

The `test:e2e` script includes checks to verify that the web and API endpoints are reachable before launching Playwright. If a server is not reachable the script will print a clear message and exit with code 1. Typical checks include:

- Verify `WEB_BASE` (default: `http://localhost:3000`) is reachable
- Verify `API_BASE` (default: `http://localhost:4000`) is reachable

If checks fail the script will instruct you to start the "Run Dev Script" task and will not run tests until the environment is healthy.

## Reporter options and recommended flags

For automated runs and CI, prefer the dot reporter which keeps output compact and ensures the process exits cleanly for automation:

```bash
npm run test:e2e -- --reporter=dot
```

For debugging and visual inspection you can use `--headed` and `--debug` flags (or our helper PowerShell wrapper which supports `-Headed` and `-Verbose`).

## Troubleshooting

If tests fail or behave differently between local and CI runs, try:

- Re-running with verbose output:

```bash
npm run test:e2e -- --debug
```

- Running a single spec in headed mode to reproduce UI issues:

```bash
npm run test:e2e -- --headed --project=chromium apps/web/tests/e2e/resume-upload.spec.ts
```

- Ensure your `.env` at repo root contains `TEST_ROUTE_SECRET` and `ENABLE_TEST_ROUTES=true` when test-only endpoints are required by the suite.

## Playwright environment variables

Playwright configuration in this repo reads several environment variables from the repository root `.env` (and the CI environment). These are documented here so automation (and AI-based tools) can configure test runs correctly.

- `WEB_BASE` — Base URL for the web app under test (e.g. `http://localhost:3000` or `http://host.docker.internal:3000`). The Playwright config uses this to set `baseURL` for tests. If not set, the config falls back to `http://localhost:${PLAYWRIGHT_WEB_PORT}`.
- `API_BASE` — Base URL for the API server under test (e.g. `http://localhost:4000`). Used by the web server process under test.
- `PLAYWRIGHT_WEB_PORT` — Port used when launching the web app locally for Playwright (default: `3000`).
- `PLAYWRIGHT_API_PORT` — Port used when launching the API server locally for Playwright (default: `4000`).
- `TEST_ROUTE_SECRET` — Secret used by test-only routes (for example, to inspect or reset test emails). Ensure this is present in `.env` or injected in CI.
- `ENABLE_TEST_ROUTES` — When truthy, enables test-only endpoints guarded by `TEST_ROUTE_SECRET`.

Notes:

- The Playwright config file (`apps/web/tests/e2e/playwright.config.ts`) loads the repo `.env` and sets `baseURL` using `WEB_BASE`. CI scripts and local helper scripts (for example `./scripts/run-playwright-tests.ps1` and `./scripts/run-playwright-with-secret.ps1`) already export these variables when running tests. If you use an editor test runner (VS Code Test Explorer), prefer the provided helper scripts which ensure the same environment variables are set.

## Test locations and naming conventions

To keep Playwright tests discoverable and consistent with the repo configuration:

- Place Playwright E2E tests under `apps/web/tests/e2e/`.
- Tests must match `*.spec.ts` (Playwright `testMatch` in the project config is `**/*.spec.ts`).
- Use `test.describe`, `test.beforeEach`, and `test.afterEach` for grouping and setup.
- Avoid importing Playwright helpers from other locations; prefer the standard `import { test, expect } from '@playwright/test'` pattern.

Example path and filename: `apps/web/tests/e2e/resume-upload.spec.ts` — this file will be picked up by `apps/web/tests/e2e/playwright.config.ts` and executed with the configured `baseURL`.

These scripts include the proper configuration paths and help maintain consistent test execution across the team.

## Advanced Testing Options

For more control over the test execution, use our dedicated PowerShell scripts:

```powershell
./scripts/run-playwright-tests.ps1 -Verbose
./scripts/run-playwright-tests.ps1 -TestFile "standalone-login.spec.ts" -Reporter
./scripts/run-playwright-tests.ps1 -Headed
```

## Using Playwright CLI

If you need to access the Playwright CLI for specific tasks (like installing browsers, running codegen, etc.),
please use our wrapper script instead of calling Playwright directly:

```bash
# Instead of this:
npx playwright <command>

# Use this:
npm run playwright -- <command>
```

## Why This Approach?

Consistent test configuration ensures:

1. Tests behave the same way for all team members
2. CI/CD pipelines use the exact same setup as local development
3. Configuration changes are tracked in source control
4. Potential conflicts between testing libraries are avoided
5. Debugging is simplified with standardized approaches

## Notes for CI/CD

For CI/CD pipelines, always use the npm scripts to ensure consistent behavior:

```yaml
# Example GitHub Actions step
- name: Run E2E tests
  run: npm run test:e2e
```

## Best Practices

- Always use the npm scripts to run Playwright tests
- When writing new tests, be aware of potential conflicts with Vitest's global objects
- Use the dot reporter (`--reporter=dot`) for automated and autonomous test runs

## Future Enhancement Ideas

In the future, we might implement:

1. A warning system that detects direct calls to Playwright and guides users to the proper npm scripts
2. Environment variable setup to prevent conflicts between testing libraries
3. A robust solution for intercepting direct calls without file extension issues
