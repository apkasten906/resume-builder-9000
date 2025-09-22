# CI/CD Architecture Overview

## Workflow Structure

- **Lint Job**: Runs ESLint in parallel, independent of build/test jobs.
- **Build Job**: Installs dependencies, builds all packages, uploads build output as an artifact.
- **Unit Test Job**: Waits for build, downloads artifact, runs unit tests.
- **E2E Test Job**: Waits for build, downloads artifact, installs Playwright browsers, starts both servers, waits for readiness, runs Playwright E2E tests.

## Monorepo Considerations

- Uses npm workspaces for dependency management.
- Shared business logic is built once and reused in all jobs.
- Dev scripts are orchestrated for both local and CI environments.

## Optimization Techniques

- Single build job with artifact upload/download to avoid redundant builds.
- Parallel linting for faster feedback.
- Cross-platform dev scripts for local and CI compatibility.
- Playwright browser install step for E2E reliability.

## Job Dependency Graph

```
      build
     /     \
unit-test  e2e-test

  lint (runs in parallel)
```

## Key Commands

- `npm run dev:ci` — Starts both API and web servers in CI using `concurrently`.
- `npm run build` — Builds all packages for production or test.
- `npx playwright install --with-deps` — Installs browsers for E2E tests in CI.
