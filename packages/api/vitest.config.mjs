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
  },
});
