import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 30000,
  retries: 1,
  outputDir: '../../test-results',
  use: {
    baseURL:
      process.env.BASE_URL ||
      (process.env.DOCKER_E2E_TEST
        ? 'http://resumebuilder-frontend:3000'
        : 'http://localhost:3000'),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: process.env.DOCKER_E2E_TEST ? '/usr/bin/chromium' : undefined,
          args: process.env.DOCKER_E2E_TEST
            ? [
                '--no-sandbox',
                '--headless',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
              ]
            : [],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],
});
