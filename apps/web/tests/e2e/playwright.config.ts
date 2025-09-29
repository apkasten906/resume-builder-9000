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
  timeout: 60000, // Increased timeout to give tests more time to complete
  retries: 2,     // Increased retries for better stability
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
  webServer: {
    command:
      'concurrently "npm run dev --workspace=packages/api" "npm run dev --workspace=apps/web"',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: true,
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
