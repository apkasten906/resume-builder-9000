# CI/CD Learnings and Troubleshooting

## Keeping Lock Files in Sync

- Always run `npm install` after adding or updating dependencies in `package.json`.
- Commit both `package.json` and `package-lock.json` to avoid CI failures with `npm ci`.
- CI will fail if the lock file is out of sync (EUSAGE error).

## Playwright E2E in CI

- Playwright requires browser binaries in CI. Always add a step:
  ```yaml
  - name: Install Playwright browsers
    run: npx playwright install --with-deps
  ```
- If you see errors about missing browser executables, this step is missing.

## Cross-Platform Dev Scripts

- Use a dedicated `dev:ci` script with `concurrently` to start both API and web servers in CI.
- Use `dev.ps1` for Windows and `dev.sh` for Linux/Mac for local development.
- In CI, always use the Linux-compatible script or npm command.

## Build Artifacts and Job Dependencies

- Build once in a dedicated job, upload the output as an artifact.
- Download the artifact in test jobs to avoid redundant builds.
- Use `needs: build` in jobs that require the build output.

## Common CI Pitfalls

- Forgetting to install Playwright browsers.
- Out-of-sync lock files.
- Using Windows-only scripts in Linux CI environments.
- Not leveraging job dependencies and artifacts for efficiency.
