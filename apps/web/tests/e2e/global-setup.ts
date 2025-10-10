import { execSync } from 'node:child_process';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');
const defaultDbPath = path.join(repoRoot, 'packages/api/test-e2e.db');

export default async function globalSetup(): Promise<void> {
  const dbPath = process.env.DB_PATH && process.env.DB_PATH.trim().length > 0 ? process.env.DB_PATH : defaultDbPath;

  await rm(dbPath, { force: true });

  const sharedEnv = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV ?? 'test',
    DB_PATH: dbPath,
  };

  const skipBuild = sharedEnv.PLAYWRIGHT_SKIP_BUILD === '1';

  if (!skipBuild) {
    execSync('npm run build --workspace=packages/api', {
      cwd: repoRoot,
      stdio: 'inherit',
      env: sharedEnv,
    });

    execSync('npm run build --workspace=apps/web', {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...sharedEnv,
        NEXT_PUBLIC_API_BASE: sharedEnv.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000',
        API_BASE: sharedEnv.API_BASE ?? 'http://localhost:4000',
      },
    });
  }

  execSync('node scripts/seed-users.js', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: sharedEnv,
  });
}
