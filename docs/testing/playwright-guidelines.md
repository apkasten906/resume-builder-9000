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
