// Despite the deprecation warning, this is still needed.  Vitests are not discovered in a monorepo without it for now.
// This file helps VS Code Test Explorer discover Vitest tests across packages

// @ts-expect-error: Vitest's defineWorkspace is required for monorepo support, but may not have proper type definitions yet. See https://github.com/vitest-dev/vitest/issues/7382
import { defineWorkspace } from 'vitest/config';

// @ts-expect-error: Vitest's defineWorkspace is required for monorepo support, but may not have proper type definitions yet. See https://github.com/vitest-dev/vitest/issues/7382
export default defineWorkspace([
  'apps/web/vitest.config.mjs',
  'packages/api/vitest.config.mjs',
  'packages/core/vitest.config.mjs',
]);
