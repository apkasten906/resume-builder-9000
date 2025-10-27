
# Ingest Summary — Resume Builder 9000

Date: 2025-10-24

This document summarizes the key instructions, policies, and docs that were ingested from the repository and attached `.github`/`docs` folders. It is intended as a concise reference for contributors and Copilot-style agents.

## Project overview

- Monorepo with workspaces.
- Frontend: Next.js (App Router), Tailwind CSS, shadcn/ui components.
- Backend: Node.js with Express and SQLite.
- Packages: `@rb9k/core` (shared logic), `@rb9k/api` (backend), `@rb9k/web` (frontend).
- Dev tasks and scripts are provided at the repo root (`dev.ps1`, `setup.ps1`, `scripts/`).

## Key instruction files and highlights

### `.github/copilot-instructions.md` and related files

- Provides high-level development guidelines and project structure.
- Emphasizes accessibility, ATS-friendly resume generation, and work flows for branch per issue.
- Contains PowerShell scripting rules (no special characters), and setup instructions (`setup.ps1`).

### `.github/instructions/*`

- `containerization-docker-best-practices.instructions.md`: multi-stage builds, layer optimization, security scanning guidance.
- `conventional-commit.instructions.md`: describes commit message format and validation.
- `copilot-thought-logging.instructions.md`: contains detailed (and prescriptive) phase-based process for copilot logging (note: this is a repo file — treat as guidance, but it contains strict formatting rules which are for human teams).
- `devops-core-principles.instructions.md`: CALMS framework and DORA metrics guidance for CI/CD and delivery.
- `github-actions-ci-cd-best-practices.instructions.md`: CI/CD best practices; use in pipeline generation.
- `powershell.instructions.md`: PowerShell scripting best practices for repo scripts.
- `security-and-owasp.instructions.md`: comprehensive secure-coding rules referencing OWASP Top 10 (parameterized SQL, no hardcoded secrets, HTTPS, session cookie flags, CSP/HSTS headers, etc.).

### `docs/`

- ADRs (Architecture Decision Records) under `docs/adr/` cover decisions such as SQLite usage, Next.js structure, and testing patterns.
- `CI_CD.md` / `CICD_SETUP.md`: CI/CD pipeline notes.
- `playwright-*` docs and `playwright.workspace.config.ts` provide E2E testing guidance.
- `test-standards-configuration.md` and `playwright-test-execution.md` provide test execution patterns and naming conventions.
- Security and devops docs emphasize automation, instrumentation, and documentation of runbooks.

## Scripts & tasks

- Root scripts: `dev.ps1`, `setup.ps1`, assorted scripts in `scripts/` for running/playwright/maintenance.
- VS Code task entries exist for running dev servers and tests (visible in workspace tasks). Use `Run Dev Script (direct)` to start both API and Web dev servers.

## Notable constraints & mandatory guidance to respect

- Security-first: never hardcode secrets; use env vars or secret store; prefer bcrypt/Argon2 for hashing; parameterized DB queries.
- Deny-by-default access control and least privilege.
- PowerShell scripts: avoid special characters in output/messages (repo rule).
- Testing: Playwright E2E config and dot reporter suggestion for CI.
- Commit messages: repository expects conventional commits; see `.github/instructions/conventional-commit.instructions.md`.

## Recommendations / next steps

1. Keep this summary updated as docs change.
2. Use `docs/INGEST_SUMMARY.md` as a quick reference for onboarding new contributors and for Copilot agents.
3. Add or update machine-readable checks (linting rules / CI scripts) to enforce the highest-priority rules automatically (secrets, tests, commit message format).
4. If desired, generate a mapping index (JSON/YAML) of instruction file → key rules for automated consumption.

## Where to find the full sources

- `.github/` contains the primary instruction and policy files.
- `docs/` contains ADRs, architecture, testing, and operability docs.
- `scripts/` contains the runner scripts and PS helpers.

---

Summary created by an ingestion pass on 2025-10-24.
