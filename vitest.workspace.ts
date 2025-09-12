// Despite the deprecation warning, this is still needed.  Vitests are not discovered in a monorepo without it for now.
// This file helps VS Code Test Explorer discover Vitest tests across packages

// @ts-ignore
import { defineWorkspace } from 'vitest/config';

// @ts-ignore
export default defineWorkspace([
  'apps/web/vitest.config.mjs',
  'packages/api/vitest.config.mjs',
  'packages/core/vitest.config.mjs',
]);
