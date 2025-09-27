// Use ESM import
import { defineConfig } from 'vitest/config';

// Add comment to indicate ESM usage
/** @type {import('vitest/config').UserConfig} */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    deps: {
      interopDefault: true,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      exclude: ['**/node_modules/**', '**/tests/**', '**/dist/**'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
