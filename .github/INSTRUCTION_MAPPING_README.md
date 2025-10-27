# Instruction Mapping — How to use

This repository includes machine-readable instruction mappings to help automate policy enforcement, CI wiring, and developer onboarding.

Files

- `.github/instruction-mapping.yml` — initial mapping produced during ingestion (keeps existing, stable entries).

- `.github/instruction-mapping-extended.yml` — comprehensive, extended mapping with severity, tags, ADR entries, scripts, and cleanup suggestions. This is the preferred source for programmatic consumption.

How to consume

1. Read the YAML mapping and select entries relevant to the pipeline you are creating (e.g., security -> secret_scanning).

2. Map `enforcement_suggestions` to CI jobs or repo hooks. Example mapping:
   - `secret_scanning` -> GitHub Action/TruffleHog or GitHub Secret Scanner.

   - `hadolint` -> GitHub Action running hadolint on each Dockerfile.

   - `playwright_ci_job` -> Run `npm run test:e2e -- --reporter=dot` from repo root.

Suggested minimal CI enforcement (starter):

- commit-msg validation for Conventional Commits (pre-commit hook or CI check).

- ESLint + unit tests job (blocking for all PRs).

- Secret scan job (initially warn-only, opt-in to fail-after-review).

Security note

- The repository currently contains a `.env` with a `RESEND_API_KEY`. Do not commit API keys into the repo. Move sensitive values to GitHub Actions secrets and add a `.env.example` file that contains placeholders. The mapping file flags this under `_cleanup_suggestions`.

Extending the mapping

- Add new files or update rules in `.github/instruction-mapping-extended.yml`.

- Use `severity` values: `critical`, `important`, `info`.

- Use tags to filter entries by CI concerns (e.g., `security`, `e2e`, `docker`).

Automation idea

- Build a small action or script that reads this YAML and generates a GitHub Actions workflow template (or a PR) with recommended jobs. This enables policy-as-code for the repository.

If you'd like, I can:

- Add a starter GitHub Actions workflow that enforces a subset of high-priority items (commit-msg, ESLint+tests, secret-scan), or

- Generate a PR that moves the `RESEND_API_KEY` out of `.env` and documents the secret setup.

---

Generated: 2025-10-24
