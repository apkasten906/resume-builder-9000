import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.ts',
  testIgnore: [
    '**/*.bak',
    '**/applications-*.spec.ts',
    '**/job-*.spec.ts',
    '**/jwt-*.spec.ts',
    '**/jd-*.spec.ts',
    '**/output-*.spec.ts',
    '**/resume-*.spec.ts',
    '**/standalone-*.spec.ts',
    '**/tailor-*.spec.ts',
    '**/login-flow.spec.ts',
    '**/auth-redirect-flow.spec.ts',
  ],
  timeout: 60000,
  retries: 2,
  outputDir: '../../test-results',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
