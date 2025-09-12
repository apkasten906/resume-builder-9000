import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@rb9k/core': resolve(__dirname, './src'),
      '@rb9k/api': resolve(__dirname, '../api/src'),
      '@rb9k/web': resolve(__dirname, '../../apps/web/src'),
    },
  },
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
});
