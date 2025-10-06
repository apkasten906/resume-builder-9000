// Use ESM import
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Add comment to indicate ESM usage
/** @type {import('vitest/config').UserConfig} */
export default defineConfig({
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    loader: 'tsx',
    include: /.*\.(js|jsx|ts|tsx)$/,
    target: 'node14',
  },
  plugins: [
    react({
      jsxImportSource: 'react',
      include: '**/*.{js,jsx,ts,tsx}',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    // Only include unit tests from the dedicated unit test directory
    include: ['tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: [
      'tests/e2e/**/*',
      'tests/AuthContext.test.*',
      'tests/AuthLogoutFlow.test.*',
      'tests/home.test.*',
      'tests/HomePageAuth.test.*',
      'src/**/*.{test,spec}.*',
      'tests/unit/**/BuildPageImpl.test.*',
    ],
    setupFiles: ['./tests/vitest.setup.ts'],
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
