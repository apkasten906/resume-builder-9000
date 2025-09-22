## Architectural Decision Record: ESLint Custom Rule Plugin in Monorepo

### Status

Accepted

### Context

The Resume Builder 9000 monorepo requires custom ESLint rules (e.g., to prevent hardcoded test/mock data in production code) and strict TypeScript linting. Early attempts to colocate custom rules or use third-party loaders led to persistent loader errors, ESM/CJS interop issues, and plugin resolution problems, especially with Node ESM and workspace setups.

### Decision

- **Create a dedicated ESLint plugin package** (`packages/eslint-plugin-local-rules`) for all custom rules.
- **Export rules using CommonJS** (`module.exports`) for maximum compatibility.
- **Reference the plugin as `local-rules`** in ESLint config, not `eslint-plugin-local-rules`.
- **Use rule namespaced as `local-rules/rule-name`** in ESLint config.
- **Add a no-op `lint` script** to the plugin package to prevent npm workspace errors.
- **Relax TypeScript rules for config files** (e.g., `next.config.js`) using ESLint overrides.
- **Disable custom rules in test/mocks folders** using ESLint overrides.

### Consequences

- **No more loader or plugin resolution errors**: ESLint finds and loads the custom rules reliably.
- **Strict TypeScript linting** is enforced only where appropriate.
- **Workspace linting is stable**: No missing script errors from the plugin package.
- **Future custom rules** can be added in a scalable, maintainable way.

### Lessons Learned

- Always use a dedicated plugin package for custom rules in a monorepo.
- Use CommonJS for plugin entrypoints for compatibility.
- Exclude or relax strict rules for plain JS config files.
- Document plugin usage and troubleshooting in the plugin README.
