# Secrets & Environment Variables (recommended practices)

This short guide describes recommended local and CI handling for secrets and environment variables used by this repository.

Purpose

- Keep secrets out of version control.
- Document the developer workflow for local development and CI.

Key recommendations

- Keep a minimal `.env.example` in the repo that lists keys (no secret values). Example:

```text
# .env.example
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev
DB_PATH=.tmp/dev-db.sqlite
```

- Add your working `.env` to `.gitignore` (the repo already follows this pattern). Do NOT commit a filled `.env` file.
- Store production and CI secrets in GitHub Actions Secrets (or your organization's secret store). Do not copy secrets into PRs or open issues.

Local developer options (pick one):

- Classic `.env` file (recommended for dev):
  - Keep a local `.env` in your project root (listed in `.gitignore`).
  - Use `.env.example` as a template and fill values locally.

- direnv (cross-platform):
  - Use direnv to load environment variables per-directory securely.
  - Advantage: no accidental commits; per-shell activation.

- OS credential stores / keyrings (Windows Credential Manager, macOS Keychain, GNOME Keyring):
  - Store and retrieve secrets using platform tools or apps (e.g., pass, secret-tool, Windows Credential Manager).

- Vault / Secret Manager (recommended for teams):
  - Use HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, etc., for production and CI secrets.

PowerShell notes (Windows devs)

- Use a local PowerShell profile to load environment variables (or `Set-Item -Path Env:NAME -Value 'value'`) for temporary sessions.
- Avoid hardcoding secrets in scripts; read from environment variables instead.

CI (GitHub Actions)

- Add secrets to the repository / organization Secrets in Settings → Secrets → Actions.
- Reference secrets in workflows via `secrets.NAME` (do not print secrets to logs).

If a secret was accidentally committed

1. Remove the secret from the repo (e.g., edit files to remove the value and commit). Do NOT re-add the value.
2. Rotate the secret (treat as compromised) — create a new API key/token and revoke the old one.
3. If the secret was pushed to a public mirror, consider using a secrets scanning & history rewrite process and follow your org's incident response.

## Quick action checklist for an accidental secret (example: Resend API key)

- Rotate the compromised key immediately in the provider dashboard (Resend).
- Remove the secret from the repository tip and ignore it going forward (example steps below).

Example commands (run locally, coordinate with your team before rewriting history):

```powershell
# 1) Remove the file from HEAD but keep it locally
git rm --cached packages/api/.env.local
Add-Content -Path .gitignore -Value "packages/api/.env.local"
git add .gitignore
git commit -m "chore(secrets): remove local env containing Resend key and ignore it"
git push origin HEAD
```

If you need to remove the secret from the repository history (optional, disruptive):

```powershell
# Use git-filter-repo (recommended) or BFG to purge the file from history
# Example outline (run from a separate clone):
# git clone --mirror https://github.com/<org>/<repo>.git repo-mirror.git
# cd repo-mirror.git
# git filter-repo --invert-paths --paths packages/api/.env.local
# git push --force
```

Why this matters

- Committed secrets can be discovered, reused, or abused. Rotation and centralized secret storage reduce blast radius and make auditing possible.

References

- See `docs/user-guides/email-setup-resend.md` for how this project expects `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to be provided in development.

## Repo cleanup actions performed (2025-10-28)

This repository recently had a small, targeted cleanup applied to a feature branch addressing commit message formatting and noise reduction.

- A non-conforming commit subject that began with the prefix `gitleaks:` was standardized to `chore(gitleaks):` so it matches the repository's Conventional Commit rules and CI `commitlint` validation.
- A temporary helper script used during the rewrite (`scripts/rewrite-commit-msg.py`) was removed after use.
- Local backup refs created by the `git filter-branch` operation were inspected and removed from this clone (refs under `refs/original/`) to avoid confusion. If you need the original refs for forensic reasons, do not remove them in your environment.

If you want to reproduce or inspect the rewrite workflow used, see `scripts/purge-secret-history.ps1` for the recommended (mirror + git-filter-repo) approach and contact the repository admin before performing any destructive pushes.
