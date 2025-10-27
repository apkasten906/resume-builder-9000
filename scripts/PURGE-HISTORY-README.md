# Purge secret from repository history

This document explains how to safely remove a leaked secret from the git history using `git-filter-repo`.

WARNING: Rewriting history is disruptive. Coordinate with your team before performing these steps. After a forced push, everyone with a clone must re-clone or follow reset instructions.

Requirements

- git
- python 3.8+
- git-filter-repo (install with `python -m pip install --user git-filter-repo`)

Quick flow

1. Rotate the compromised secret in the provider dashboard (Resend).
2. Run `scripts/purge-secret-history.ps1` from a machine with push access.
3. Notify all contributors to re-clone the repository and rotate local keys if needed.

Communication template

```text
We performed an emergency history rewrite to remove a leaked secret from the repository.

What changed:
- The repository history was rewritten to remove `packages/api/.env.local`.

What you must do:
1. Backup any local work (stash changes).
2. Re-clone the repository: `git clone https://github.com/<org>/<repo>.git`.
3. Re-apply any local patches or rebase your work on the new history.

If you have questions, contact the repo maintainers.
```
