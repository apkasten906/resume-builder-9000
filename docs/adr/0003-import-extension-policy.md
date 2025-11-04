## 0003 — Import-extension policy: Node ESM (.js) vs Next.js (no extension)

Date: 2025-10-30

Status: Proposed / Implemented (work in progress)

## Context

This monorepo contains two different runtime/tooling contexts:

- Node packages (for example: `packages/api`, `packages/core`) that run under Node.js in ESM mode. In Node ESM, relative imports in runtime code typically require explicit file extensions (for example `import x from './foo.js'`).
- Next.js application code (for example: `apps/web`) which is built by the Next toolchain. Next.js and Vite-style bundlers resolve extension-less imports at build time (for example `import x from '../lib/foo'`) and prefer not to include explicit `.js` extensions in source imports.

Because these contexts behave differently, we need a policy that is clear and practical for developers working across the monorepo.

## Decision

- For Node-run packages in this repository (notably `packages/api` and `packages/core`), require explicit `.js` extensions on ESM relative imports in source files that will be executed by Node at runtime. Example:
  - `import { foo } from './lib/foo.js'` // Node ESM — include .js

- For Next.js application source (`apps/web`), prefer extension-less imports. Example:
  - `import { Bar } from '../components/Bar'` // Next.js — no extension

This hybrid rule keeps runtime Node ESM resolution correct while letting Next.js source remain idiomatic for the framework.

## Rationale

- Node ESM requires file extensions when importing local files at runtime. If we omit the `.js` extension for Node-run code, Node will fail to resolve modules at runtime unless we do additional build-time rewriting. Requiring `.js` in Node packages reduces surprises in runtime environments and CI.
- Next.js and modern bundlers resolve extension-less imports and keep source files clean. Keeping Next.js code extension-less matches community conventions and prevents accidental coupling to emitted file types.

## Implementation guidance

1. Code rules

- Node packages (`packages/*` that run on Node): use `.js` on relative imports in runtime or test files that run under Node ESM.
- Next.js app (`apps/web`): use extension-less imports for local modules and components.

2. Tooling and TS config

- Node packages: keep or set TypeScript `moduleResolution` to `node16` or `nodenext` and ensure the compiled output (tsc) emits `.js` files that match imports. Tests that run via Node should import compiled paths or use a runner configured to resolve `.ts` sources with `.js` imports (for example, using ts-node with ESM-aware settings).
- Next.js app: `moduleResolution: 'bundler'` (TypeScript 5+) is compatible with extension-less imports and aligns with the bundler's resolution.

3. Migration approach
   - Apply targeted changes rather than a blind global replace:
     - For files under `packages/core` and `packages/api`, ensure ESM relative imports include `.js`.
     - For files under `apps/web`, ensure imports are extension-less.
   - Update or generate tests to use the appropriate import style depending on where they run.

4. Validation

- Run unit tests (`npm run test:unit`) for Node packages.
- Run Next.js dev/build for the web app to validate no unresolved imports.

## Rollback plan

- If migration causes build/test regressions, revert the code changes and adjust the relevant package's tsconfig or test runner configuration to handle the desired import style. Reverts can be done by git.

## Acceptance criteria

- Node packages (`packages/api`, `packages/core`) contain `.js` extensions on ESM relative imports for files executed by Node.
- Next.js app (`apps/web`) uses extension-less imports for local modules.
- CI (unit tests, build) passes after the migration.

## Next steps

- Perform the targeted fixups for Node packages and run tests.
- Document the policy in CONTRIBUTING.md and consider adding an ESLint rule or codemod to enforce correctness per folder.

# 0003 — Import extension policy: use extension-less relative imports

Date: 2025-10-30

Status: Proposed / Implemented (work in progress)

## Context

Historically, parts of this repository used explicit `.js` file extensions in relative imports (for example: `import x from '../foo.js'`). Those imports point at compiled/runtime artifacts. During recent work we added TypeScript source files and tests that should import other source files rather than compiled outputs. Using explicit `.js` extensions in source imports creates coupling to the output bundle/compiled files and inhibits the editor/TypeScript's ability to resolve `.ts` sources consistently across different tooling.

## Decision

We will adopt an extension-less import policy for local relative imports in source code. Example:

- Good: import { foo } from '../lib/foo';
- Bad: import { foo } from '../lib/foo.js';

## Rationale

- Extension-less imports are resolved by the toolchain (TypeScript, bundlers, Node) and allow the same source to work whether the consumer of the module is a TypeScript compiler, a bundler (Vite, Rollup), or Node at runtime. This prevents accidentally referencing compiled artifacts.
- It avoids hard-coding a specific emitted filetype (.js, .mjs, .cjs) into the source.
- It makes the repository friendlier to source-level tooling (editors, linters, and type-checkers), and reduces churn when switching build targets.

## Consequences

Positive

- Source imports are decoupled from build output.
- Easier to refactor or change build target extensions.

Negative / Tradeoffs

- TypeScript's default node16/nodenext module resolution historically requires file extensions in ESM-style relative imports; switching to extension-less imports requires a matching toolchain configuration so TypeScript and runtime/bundler resolve identically.
- Some older tools or scripts may rely on explicit `.js` paths and will need updates.

## Implementation Plan

1. Code changes (in this branch)
   - Update existing imports in source files to remove `.js` extensions. Focus first on files added/modified by the feature work, then run a repo-wide migration.
   - Files touched in this change: examples include
     - `apps/api/src/lib/pdf-parser.ts`
     - `apps/api/src/routes/resume/parse.route.ts`
     - `apps/api/src/routes/resume/save.route.ts`
     - `packages/core/src/lib/mapper.ts`
     - `packages/core/src/models/parsed-region.ts`
     - `packages/core/src/models/user-profile-draft.ts`
     - `packages/core/test/*`

2. Tooling changes (required)
   - Update `tsconfig.json` for consistent resolution. Recommended options:
     - `"module": "esnext"` (or a value compatible with your bundler)
     - `"moduleResolution": "bundler"` (TypeScript 5+), or alternatively `"moduleResolution": "node16"` with additional guidance.
   - Ensure Vite / Rollup / Webpack config continues to resolve extension-less imports (Vite already resolves this when `resolve.extensions` includes `.ts` and `.js`).
   - Update ESLint rules if the repo currently enforces explicit extensions via a rule.

3. Migration
   - Perform a repository-wide search-and-replace to remove trailing `.js` in local relative import paths. Example PowerShell one-liner (review before running):

```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.jsx |
  Select-String "from\s+['\"](\.\.?/[^'\"]+)\.js['\"]" -AllMatches |
  ForEach-Object {
    $file = $_.Path
    $new = (Get-Content $file) -replace "from\s+(['\"])(\.\.?/[^'\"]+)\\.js(['\"])", "from $1$2$3"
    Set-Content -Path $file -Value $new
  }
```

4. Validation
   - Run `npm run lint` and `npm run test:unit` and fix any remaining issues.
   - Run the dev server and a subset of E2E tests to ensure runtime resolution works.

## Rollback plan

- If the TypeScript/bundler configuration causes widespread breakage that cannot be resolved quickly, revert the code changes and update the ADR with a phased migration strategy. The code changes can be reverted via git.

## Open questions / Next steps

- Which toolchain config will we standardize on? (Recommended: TypeScript `moduleResolution: 'bundler'` + `module: 'esnext'`)
- Do we want to enforce the new policy with an ESLint rule and codemod in CI?
- Are there any scripts or external tools that expect `.js` extensions and need updates?

## Acceptance criteria

- All new and modified source files use extension-less relative imports for local modules.
- `npm run test:unit` and `npm run lint` run cleanly after applying the recommended tsconfig/build changes.

## References

- TypeScript docs: moduleResolution options and `bundler` resolution mode.
- Node ESM resolution guidance.
