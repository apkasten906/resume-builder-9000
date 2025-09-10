// Use ESM import
import { defineConfig } from 'vitest/config';

// Add comment to indicate ESM usage
/** @type {import('vitest/config').UserConfig} */
export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'html'],
    },
  },
});
