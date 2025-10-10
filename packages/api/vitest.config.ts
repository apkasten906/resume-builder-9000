// Use ESM import
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add comment to indicate ESM usage
/** @type {import('vitest/config').UserConfig} */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@rb9k/core': path.resolve(__dirname, '../core/src/index.ts'),
      '@rb9k/core/testLogger': path.resolve(__dirname, '../core/src/testLogger.ts'),
    },
  },
});
