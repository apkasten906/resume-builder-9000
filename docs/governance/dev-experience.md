# Developer Experience — Reproducible Local Dev

## Purpose

Ensure contributors can run the application and tests locally with minimal friction and consistent results.

## Rules

- Provide scripted setup: `setup.ps1` / `setup.sh` or documented steps to get a working local environment.
- `dev.ps1` / `dev.sh` should bring up the services necessary for local development (API, web, DB) or provide clear mocks.
- Document common tasks (running unit tests, running BDD/e2e locally, resetting local DB) in a README or dev runbook.

## Checklist

- [ ] Can a new contributor run the dev environment with the documented steps?
- [ ] Are common troubleshooting steps and dependencies documented?
