import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');
const envPath = path.join(repoRoot, '.env');

// Load repo root .env file so Playwright tests can access TEST_ROUTE_SECRET and other env vars
const result = dotenv.config({ path: envPath });

// Debug output to help troubleshoot Test Explorer env loading
if (!process.env.TEST_ROUTE_SECRET) {
  console.error('❌ TEST_ROUTE_SECRET not loaded from .env!');
  console.error('   Config file:', __filename);
  console.error('   Repo root:', repoRoot);
  console.error('   .env path:', envPath);
  console.error('   .env exists?', fs.existsSync(envPath));
  console.error('   Working dir:', process.cwd());
  if (result.error) {
    console.error('   dotenv error:', result.error);
  }
} else {
  console.log('✓ TEST_ROUTE_SECRET loaded (length:', process.env.TEST_ROUTE_SECRET.length, ')');
}

const defaultDbPath = path.join(repoRoot, 'packages/api/test-e2e.db');
const dbPath =
  process.env.DB_PATH && process.env.DB_PATH.trim().length > 0
    ? process.env.DB_PATH
    : defaultDbPath;

process.env.DB_PATH = dbPath;

// Configure URLs based on environment (Docker vs development).
// Prefer a single source of truth: WEB_PORT / API_PORT. Fall back to PLAYWRIGHT_* for legacy support.
const playwrightWebPort = process.env.WEB_PORT || process.env.PLAYWRIGHT_WEB_PORT || '3000';
const playwrightApiPort = process.env.API_PORT || process.env.PLAYWRIGHT_API_PORT || '4000';

const webBaseUrl = process.env.WEB_BASE || `http://localhost:${playwrightWebPort}`;
const apiBaseUrl = process.env.API_BASE || `http://localhost:${playwrightApiPort}`;

console.log('🎭 Playwright Configuration:');
console.log('   Web URL:', webBaseUrl);
console.log('   API URL:', apiBaseUrl);
console.log('   Database:', dbPath);

// Check if we're testing against Docker containers.
// Prefer the explicit `DOCKER_TESTING` flag; fall back to production port checks.
const isDockerTesting =
  process.env.DOCKER_TESTING === 'true' || // Explicit Docker flag
  webBaseUrl.includes(':8080') ||
  apiBaseUrl.includes(':8081'); // Production container ports as a fallback
console.log('   Docker Mode:', isDockerTesting);

// Ensure test route credentials are available to test code
// These should be set in your local .env or passed via command line
if (!process.env.TEST_ROUTE_SECRET) {
  console.warn('TEST_ROUTE_SECRET not set - test routes will not be accessible');
}
if (!process.env.ENABLE_TEST_ROUTES) {
  console.warn('ENABLE_TEST_ROUTES not set - test routes may not be enabled');
}

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.ts',
  testIgnore: [
    '**/*.bak',
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
  timeout: 60000,
  retries: 2,
  outputDir: '../../test-results',
  fullyParallel: false,
  globalSetup: './global-setup.ts',
  use: {
    baseURL: webBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Only start web servers if not testing against Docker containers
  webServer: isDockerTesting
    ? []
    : [
        {
          command: 'npm run dev',
          cwd: path.join(repoRoot, 'packages/api'),
          url: `${apiBaseUrl}/api/health`,
          reuseExistingServer: !process.env.CI,
          stdout: 'pipe',
          stderr: 'pipe',
          timeout: 120000,
          env: {
            ...process.env,
            NODE_ENV: 'development',
            DB_PATH: dbPath,
          },
        },
        {
          command: 'npm run dev',
          cwd: path.join(repoRoot, 'apps/web'),
          url: webBaseUrl,
          reuseExistingServer: !process.env.CI,
          stdout: 'pipe',
          stderr: 'pipe',
          timeout: 180000,
          env: {
            ...process.env,
            NODE_ENV: 'development',
            DB_PATH: dbPath,
            API_BASE: apiBaseUrl,
            PORT: playwrightWebPort,
          },
        },
      ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
