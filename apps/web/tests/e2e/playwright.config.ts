import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration for Playwright tests
 *
 * When running in Docker:
 * - baseURL points to the frontend container
 *
 * When running locally:
 * - baseURL points to localhost:3000
 */
export default defineConfig({
  testDir: './',
  timeout: 30000,
  retries: 1,
  use: {
    // Point to appropriate hostnames based on environment
    // Allow baseURL override for local/dev/CI
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
          headless: true,
          executablePath: process.env.DOCKER_E2E_TEST ? '/usr/bin/chromium' : undefined,
          args: process.env.DOCKER_E2E_TEST
            ? [
                '--no-sandbox',
                '--headless',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
              ]
            : ['--headless'],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          headless: true,
        },
      },
    },
  ],
});
