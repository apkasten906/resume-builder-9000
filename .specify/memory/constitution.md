# Resume Builder 9000 Constitution

This document records the guiding principles, constraints, and governance rules that shape how we design, build, test, and operate the Resume Builder 9000 project. It is authoritative for spec-driven development artifacts created by `/speckit.*` commands and for repository-level expectations (CI, security, releases).

## Core Principles

### 1. Library-First Modularity

Every feature should start as a small, well-scoped library or package. Libraries must be self-contained, independently testable, and documented. Prefer composition over global shared state. Public package APIs are the contract we test against.

Why: smaller surface area, clearer contracts, easier testing and release for parts of the system.

### 2. CLI & Tooling First

Expose functionality via CLI tools or scriptable interfaces (stdin/args → stdout, errors → stderr) where practical. Tools should support machine-readable (JSON) and human-readable output. Provide `rb9k` CLI entrypoints for core flows.

Why: ensures reproducibility, supports CI automation, and enables `/speckit.*` integrations.

### 3. Test-First (NON-NEGOTIABLE)

Adopt Test-Driven Development for new libraries and critical features. Tests (unit/integration) must be written before or alongside implementation. Red → Green → Refactor cycle is enforced. New public behavior must include tests and examples.

Why: prevents regressions, makes design decisions explicit, and facilitates safe refactoring.

### 4. Integration & E2E Coverage

Integration tests and E2E tests validate cross-component behavior, external dependencies, and full user flows (including Playwright/Cypress for UI). Run fast unit tests on every push; integration/E2E run in CI for PRs and release pipelines with stable staging environments.

Why: catches system-level issues and prevents integration regressions.

### 5. Observability, Versioning & Simplicity

Build with observability (structured logs, metrics, traces) and clear semantic versioning (MAJOR.MINOR.PATCH). Favor simple deterministic rules (the SPEC default) and avoid premature optimization. Keep public interfaces small and stable.

Why: easier debugging, predictable upgrades, and reduced cognitive load.

### 6. Test Pyramid & Quality Gates

We follow a pragmatic test pyramid: fast unit tests at the base, focused integration/contract tests in the middle, and reliable E2E/BDD tests at the top. CI must enforce quality gates (lint → unit tests → build → integration/E2E as required) and require actionable failure artifacts for debugging.

Why: ensures fast feedback for developers while preserving high-confidence system-level checks in CI.

### 7. Traceable Acceptance Criteria

Acceptance criteria written in Gherkin (Given/When/Then) are the canonical source of truth for feature behavior. Every story or PR should reference the implementing feature file(s) or include the feature path(s) in the PR description to maintain traceability between requirements and tests.

Why: improves reviewability, automates mapping between AC and tests, and aids compliance with the DoD for each story.

## Constraints & Security Requirements

- Default to the deterministic core: `ALLOW_EXTERNAL_LLM=false` in repository defaults. External LLM integrations are opt-in and gated by policy.
- Enforce least privilege: secrets in GitHub Secrets or a vault; do not commit secrets.
- Use parameterized queries / ORM protections to avoid SQL injection. SQLite is accepted for MVP but follow secure access patterns (see `docs/adr/0002_resumes_table.sql` and related ADRs).
- Use HTTPS for external network calls, validate external URLs to prevent SSRF, and sanitize file paths to prevent path traversal on uploads.
- Integrate SAST (CodeQL) and SCA (dependency-review or Snyk) in CI. Fail builds on critical issues.

### Data Privacy & PII Handling

- Protect personal data: treat resume contents as personal data (PII). Minimize storage, encrypt data at rest, redact PII from logs, and document retention and erasure policies for user data.

Why: resumes contain sensitive information and must be handled with care to maintain user trust and legal compliance.

### Feature Flags & Safe Releases

- Use feature flags to decouple deploy from release. Prefer progressive rollouts, require kill-switches for risky features, and avoid shipping untested features enabled by default.

Why: reduces blast radius for new features and enables fast rollback.

### Migrations, Backups & Data Migration Policy

- Migrations must be reversible or accompanied by a documented rollback plan. Run migrations in staging prior to production and maintain backups before applying production migrations.

Why: prevents data loss and ensures safe schema evolution.

### Observability SLOs & Error Handling

- Define SLOs for critical flows (e.g., resume generation latency, API success rate). Design idempotent operations and explicit retry/backoff policies for external calls.

Why: measurable reliability targets guide priorities and incident response.

### Logging Privacy & Redaction

- Logs must avoid storing raw PII. Use structured logging, apply redaction rules for sensitive fields, and enforce retention limits for sensitive logs.

Why: minimizes accidental exposure and improves compliance posture.

### Developer Experience — Reproducible Local Dev

- Local developer experience must be reproducible: `dev.ps1` / `dev.sh` should start required services, setup should be scripted for new contributors, and runbooks should exist for common tasks.

Why: reduces onboarding friction and lowers the cost of local testing.

### Release & Rollback Practices

- Releases must include an explicit rollback plan. CI-driven releases should support automated rollback or feature-flag disabling for rapid recovery.

Why: shortens mean time to recovery and reduces manual toil during incidents.

### Dependency Upgrade Policy

- Adopt a documented dependency upgrade cadence with automated PRs and SCA scans. Emergency patching of high-severity vulnerabilities is allowed with a remediation timeline.

Why: keeps the project secure and maintainable while bounding upgrade risk.

## Development Workflow & Quality Gates

- Branching: create feature branches from `dev`. PRs target `dev` by default; release PRs merge `dev` → `main`.
- Commit messages: use Conventional Commits (see `.github/prompts` templates). Small, focused PRs preferred.
- CI gates: lint → unit tests → build → integration/E2E as required. Branch protection requires passing checks and at least one approving review from CODEOWNERS.
- Releases: tag with semantic versions. Major changes require an ADR and migration plan.

## Governance

- The Constitution supersedes informal conventions. Amendments require:

1.  An ADR describing the rationale and migration steps.
2.  A PR that updates relevant docs/tests and receives reviews from CODEOWNERS.

- All PRs must demonstrate CI green and include tests for new behavior. Complexity must be justified in PR description and linked ADRs.
- Security exceptions (e.g., temporarily allowing a dependency) require an explicit ticket and a timeline for remediation.

## Tooling & Automation

- Use `uv` for Python tooling and `specify` for spec-driven flows as documented. Keep `dev.ps1` / `dev.sh` scripts working for local development.
- CI: follow GitHub Actions best practices (least-privilege `GITHUB_TOKEN`, OIDC for cloud auth where appropriate, caching and matrix strategies). See `docs/CI_CD.md` and `.github/instructions/github-actions-ci-cd-best-practices.instructions.md`.

## How to use this Constitution with Spec Kit

- Use `/speckit.constitution` to generate or update project governing principles derived from this file. `/speckit.plan` and `/speckit.tasks` should respect these constraints.

**Version**: 0.1.2 | **Ratified**: 2025-10-30 | **Last Amended**: 2025-10-30

<!-- End of constitution -->
