// Configuration for VS Code Test Explorer
// This is just a stub - actual tests run through package.json scripts
// which call the individual workspace vitest.config.mjs files
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './apps/web/vitest.config.ts',
      './packages/api/vitest.config.ts',
      './packages/core/vitest.config.ts',
    ],
  },
});
