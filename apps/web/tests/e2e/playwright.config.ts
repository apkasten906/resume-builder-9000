import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');
const defaultDbPath = path.join(repoRoot, 'packages/api/test-e2e.db');
const dbPath =
  process.env.DB_PATH && process.env.DB_PATH.trim().length > 0
    ? process.env.DB_PATH
    : defaultDbPath;

process.env.DB_PATH = dbPath;
process.env.API_BASE = process.env.API_BASE || 'http://localhost:4000';
process.env.NEXT_PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

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
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: path.join(repoRoot, 'packages/api'),
      url: 'http://localhost:4000/api/health',
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
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      timeout: 180000,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        DB_PATH: dbPath,
        NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000',
        API_BASE: process.env.API_BASE || 'http://localhost:4000',
        PORT: process.env.PORT || '3000',
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
