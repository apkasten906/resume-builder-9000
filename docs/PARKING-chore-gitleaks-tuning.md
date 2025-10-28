# PARKED: chore/gitleaks-tuning (2025-10-28)

## Status

- Branch: `chore/gitleaks-tuning`
- Backup branch created: `backup/chore-gitleaks-tuning-2025-10-28`
- Tag created: `park/chore-gitleaks-tuning-2025-10-28`
- Changes committed: gitleaks tuning, commitlint config, purge helper lifecycle, docs updates
- Temporary helper removed; large local logs removed from HEAD and ignored in `.gitignore`.

## What remains / important notes

- The sensitive file (Resend key) was removed from HEAD and the purge tooling was prepared. A complete, destructive history purge (removing the file from all past commits) is not automatically executed on protected branches and requires explicit coordination with repository administrators before forcing rewritten history into `main` or other protected branches.
- Local mirror(s) and the `repo-mirror.git` produced during testing are left in place (ignored). If you want to permanently rewrite remote history, follow the runbook in `scripts/PURGE-HISTORY-README.md` and coordinate branch-protection changes before a force-push.

## How to resume safely

1. Create a small focused plan: decide whether to (A) stop at removing the secret from HEAD and rotating keys (low impact), or (B) perform a full history purge (disruptive).
2. If you choose (B), prepare a maintenance window and have repository admin temporarily disable branch protections for the target branches, then follow the mirror + `git-filter-repo` workflow in `scripts/purge-secret-history.ps1`.
3. After the rewrite, run CI and verify all protected branches are healthy. Communicate the change to collaborators (they will need to re-clone or run `git fetch && git reset --hard` as instructed).

## Quick references

- Purge helper: `scripts/purge-secret-history.ps1`
- Documentation: `docs/user-guides/secrets-management.md`
- Parking tag: `park/chore-gitleaks-tuning-2025-10-28`

If you want, I can (a) draft the PR text and admin checklist for performing the destructive history rewrite, or (b) finalize the purge now (requires explicit confirmation).
