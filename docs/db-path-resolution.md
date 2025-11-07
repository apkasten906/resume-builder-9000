# Database path resolution (DB_PATH)

This project supports flexible ways to specify the SQLite database location using the `DB_PATH` environment variable.

## Rules

- Special SQLite values are preserved exactly and used as-is:
  - `:memory:` — use an in-memory database (useful for tests).
  - values starting with `file:` — treated as SQLite URIs and used as-is.

- Absolute paths (POSIX `/...` or Windows `C:\...`) are used as provided.

- Relative paths (anything else) are normalized and resolved against the repository root.
  - If the value does not start with a leading `/`, a leading `/` is added internally before resolving against the repo root. This means both `packages/api/data/resume.db` and `/packages/api/data/resume.db` will resolve to the same file inside your repository.

## Why this exists

Older behavior resolved all relative `DB_PATH` values against the API package directory. That made certain common `.env` values ambiguous (for example `packages/api/data/resume.db` was being treated as relative to `packages/api` instead of the repository root). The new behavior is more forgiving and supports the two common notations used in this repo.

## Recommended usage

- For local development using the repo-attached DB file set:

  DB_PATH=/packages/api/data/resume.db

  or

  DB_PATH=packages/api/data/resume.db

- For in-memory tests use:

  DB_PATH=:memory:

## Notes

- The code that implements this behavior is in `packages/api/src/db.ts`. If you need a different resolution policy (for example prefer package-relative paths), update that file and add a small unit test to lock-in the behavior.

### Implementation details & Windows quirks

- The implementation lives in `packages/api/src/db.ts` and intentionally preserves special SQLite values such as `:memory:` and `file:` URIs — they are used verbatim and not resolved against the filesystem.
- The code will create the parent directory for a resolved file DB path when needed. This prevents runtime errors when `DB_PATH` points to a path inside a directory that does not yet exist (for example `packages/api/data/resume.db`).
- On Windows there is a subtle `path.isAbsolute()` quirk when paths start with a leading `/` (for example `/packages/api/...`) — the code treats both `packages/...` and `/packages/...` as repo-relative and resolves them against the repository root to keep configuration consistent across OSes.

If you change this behavior, please add a unit test in `packages/api` to assert the resolution rules on Windows and POSIX systems.
