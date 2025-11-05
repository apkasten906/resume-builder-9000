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

## Host-mode vs Docker-mode (how we run E2E)

This repository supports two common E2E modes:

- Docker-mode (recommended for CI): containers run the API and web services. Use `docker-compose.run-e2e.yml` together with `.env.docker` to control runtime ports and test flags.
- Host-mode (recommended for local IDE runs): run `dev.ps1` locally and point Playwright at host ports. Host-mode is convenient for iterating from VS Code Test Explorer or running Playwright from your terminal.

Common host-mode example values (these are configurable via `.env` / `.env.docker`):

- WEB_BASE=http://localhost:3001
- API_BASE=http://localhost:4001

Example Docker Compose command (host-mode ports mapped to the host):

```powershell
docker compose --env-file .env.docker -f docker-compose.run-e2e.yml up -d --build --remove-orphans
```

Then run Playwright from the workspace root (host-mode example):

```powershell
#$env:API_BASE='http://localhost:4001'; $env:WEB_BASE='http://localhost:3001'; npm run test:e2e
```

Notes:

- Playwright's configuration and the web server's runtime environment must agree about `API_BASE`/`WEB_BASE`. When Playwright starts a local `webServer` it will forward configured env vars to the server process; our `playwright.config.ts`/`playwright-global-setup` ensures the test secrets are passed through when appropriate.
- Use `DOCKER_TESTING=true` in `.env.docker` to opt-in to Docker gateway allowances (the API will accept requests originating from the Docker gateway IP when this flag is set).

## Test-support endpoints and secrets (quick link)

This project exposes guarded server-side test-support endpoints (for seeding test users, clearing the test email outbox, and deterministic cleanup) that are intentionally opt-in and protected by a session secret. See `docs/testing/test-support-endpoints.md` for the full list, curl examples, and recommended sequences.

## Environment variables (summary)

- `ENABLE_TEST_ROUTES` (true|false) — controls whether the API mounts test-only routes. Use only in CI or local dev when running E2E.
- `TEST_ROUTE_SECRET` — protect test routes. Use secure secret storage in CI and do NOT commit real secrets into the repo. `.env.docker` contains a placeholder value; replace via CI secret injection.
- `DOCKER_TESTING` (true|false) — when true, the API will treat Docker gateway IPs as trusted for test-route access (useful for container-mode runs).
- `TEST_TRUSTED_SUBNET` — optional CIDR to restrict access to test routes when needed.

Refer to `README.md` and `docs/testing/test-support-endpoints.md` for examples and full usage patterns.
