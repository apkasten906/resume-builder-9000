// Configuration for VS Code Test Explorer
// This is just a stub - actual tests run through package.json scripts
// which call the individual workspace vitest.config.mjs files
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  // Basic configuration for test detection in VS Code
  resolve: {
    alias: {
      '@rb9k/core': resolve(__dirname, './packages/core/src'),
      '@rb9k/api': resolve(__dirname, './packages/api/src'),
      '@rb9k/web': resolve(__dirname, './apps/web/src'),
    },
  },
  test: {
    include: [
      'packages/*/tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'apps/*/tests/**/*.{test,spec}.{js,ts,jsx,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
