# eslint-plugin-local-rules

Custom ESLint rules for the Resume Builder 9000 monorepo.

- `no-hardcoded-test-data`: Disallow hardcoded test/mock data in production code.

## Usage

Add `local-rules` to your ESLint plugins and enable the rule as `local-rules/no-hardcoded-test-data`.

## Monorepo ESLint Setup Learnings & Best Practices

- **Dedicated Plugin Package:** For custom rules in a monorepo, always create a dedicated plugin package (e.g., `packages/eslint-plugin-local-rules`). This avoids loader and ESM/CJS interop issues.
- **Plugin Naming:** In your ESLint config, reference the plugin as `local-rules` (not `eslint-plugin-local-rules`).
- **Rule Usage:** Use rules as `local-rules/rule-name`.
- **Workspace Scripts:** Add a no-op `lint` script to the plugin package to prevent npm workspace errors.
- **Config File Linting:** Exclude or relax TypeScript rules for root-level and config `.js` files (e.g., `next.config.js`) to avoid false positives.
- **Test/Mock Data:** Exclude or disable custom rules in test/mocks folders using ESLint overrides.
- **TypeScript Strictness:** Apply strict TypeScript rules only to `.ts`/`.tsx` files, not plain `.js` config files.
- **Plugin Resolution:** Ensure the plugin is discoverable by ESLint (use relative or workspace paths if needed).

## Troubleshooting

- If you see `Definition for rule 'local-rules/...' was not found`, check plugin naming and workspace resolution.
- If you see ESM/CJS loader errors, ensure all plugin entrypoints use CommonJS (`module.exports`).
- If npm workspace lint fails, add a dummy `lint` script to the plugin package.
