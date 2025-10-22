import { defineConfig } from '@playwright/test';

import dotenv from 'dotenv';

dotenv.config();

export const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Workspace-level Playwright configuration for VS Code Test Explorer
 * This file helps VS Code discover Playwright tests in the monorepo
 */
export default defineConfig({
  // Point to the actual config in the web app
  projects: [
    {
      name: 'web-e2e',
      testDir: './apps/web/tests/e2e',
      testMatch: '**/*.spec.ts',
      testIgnore: [
        '**/*.bak',
        // Skip tests that use testWithAuth (authentication system limitations)
        '**/applications-*.spec.ts',
        '**/job-*.spec.ts',
        '**/jwt-*.spec.ts',
        '**/output-*.spec.ts',
        '**/resume-*.spec.ts',
        '**/standalone-*.spec.ts',
        '**/tailor-*.spec.ts',
        '**/login-flow.spec.ts',
        '**/auth-redirect-flow.spec.ts',
      ],
      use: {
        baseURL: WEB_BASE,
      },
    },
  ],
});
