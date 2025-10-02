// Use ESM import
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Add comment to indicate ESM usage
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}', 'src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['tests/e2e/**/*.ts'],
    setupFiles: ['./tests/vitest.setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      exclude: ['**/node_modules/**', '**/tests/e2e/**', '**/dist/**', '**/.next/**'],
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75,
      },
    },
    deps: {
      optimizer: {
        web: {
          include: ['@testing-library/jest-dom'],
        },
      },
    },
  },
});
