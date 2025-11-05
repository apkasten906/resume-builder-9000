import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// fs not required here
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');
const envPath = path.join(repoRoot, '.env');

// Load repo root .env file so Playwright tests can access TEST_ROUTE_SECRET and other env vars
dotenv.config({ path: envPath });

const defaultDbPath = path.join(repoRoot, 'packages/api/test-e2e.db');
const dbPath =
  process.env.DB_PATH && process.env.DB_PATH.trim().length > 0
    ? process.env.DB_PATH
    : defaultDbPath;

process.env.DB_PATH = dbPath;
process.env.API_BASE = process.env.API_BASE || 'http://localhost:4001';

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.ts',
  timeout: 60000,
  retries: 2,
  outputDir: '../../test-results',
  fullyParallel: false,
  // IMPORTANT: no webServer entries here. This config assumes you started the dev servers separately (dev.ps1)
  use: {
    baseURL: process.env.WEB_BASE || 'http://localhost:3001',
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
