import { defineConfig } from '@playwright/test';

import dotenv from 'dotenv';

dotenv.config();

export const WEB_BASE = process.env.WEB_BASE || 'http://localhost:3000';

/**
 * Workspace-level Playwright metadata for maintainers
 * NOTE: This file is intentionally named `playwright.workspace.config.ts` to avoid
 * duplicate discovery in VS Code Test Explorer. The actual test config lives in
 * `apps/web/tests/e2e/playwright.config.ts` and should be used for running tests.
 */
export default defineConfig({
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
