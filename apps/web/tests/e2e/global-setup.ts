import { execSync } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');

// Load repo root .env file before running setup
dotenv.config({ path: path.join(repoRoot, '.env') });

const defaultDbPath = path.join(repoRoot, 'packages/api/test-e2e.db');

export default async function globalSetup(): Promise<void> {
  const dbPath =
    process.env.DB_PATH && process.env.DB_PATH.trim().length > 0
      ? process.env.DB_PATH
      : defaultDbPath;

  // Only remove the database file when running in CI or when explicitly requested.
  // If Playwright is reusing an existing dev server (local test-explorer workflow),
  // deleting the repo DB may fail with EBUSY because the running server holds the file open.
  const shouldRemoveDb = process.env.CI === 'true' || process.env.PLAYWRIGHT_REMOVE_DB === '1';
  if (shouldRemoveDb) {
    await rm(dbPath, { force: true });
  } else {
    console.warn(
      `Skipping removal of database at ${dbPath} (CI=${process.env.CI}). Set PLAYWRIGHT_REMOVE_DB=1 to force removal.`
    );
  }

  const sharedEnv = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV ?? 'test',
    DB_PATH: dbPath,
    APP_BASE: process.env.APP_BASE ?? 'http://localhost:3000',
  };

  // const skipBuild = sharedEnv.PLAYWRIGHT_SKIP_BUILD === '1';

  // if (!skipBuild) {
  //   execSync('npm run build --workspace=packages/api', {
  //     cwd: repoRoot,
  //     stdio: 'inherit',
  //     env: sharedEnv,
  //   });

  //   execSync('npm run build --workspace=apps/web', {
  //     cwd: repoRoot,
  //     stdio: 'inherit',
  //     env: {
  //       ...sharedEnv,
  //       API_BASE: sharedEnv.API_BASE ?? 'http://localhost:4000',
  //       API_BASE: sharedEnv.API_BASE ?? 'http://localhost:4000',
  //     },
  //   });
  // }

  execSync('node scripts/seed-users.js', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: sharedEnv,
  });
}
