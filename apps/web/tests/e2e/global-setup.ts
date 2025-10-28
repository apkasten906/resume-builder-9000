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

  // Check if we're testing against Docker containers. Prefer the explicit env flag
  // `DOCKER_TESTING` rather than inferring from ports (which is fragile).
  const webBaseUrl = process.env.WEB_BASE || 'http://localhost:3000';
  const apiBaseUrl = process.env.API_BASE || 'http://localhost:4000';
  const isDockerTesting = process.env.DOCKER_TESTING === 'true';

  console.log('🧪 Global Setup Configuration:');
  console.log('   Web URL:', webBaseUrl);
  console.log('   API URL:', apiBaseUrl);
  console.log('   Docker Mode:', isDockerTesting);
  console.log('   Database:', dbPath);

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

  const skipBuild =
    process.env.PLAYWRIGHT_SKIP_BUILD === '1' || process.env.DOCKER_TESTING === 'true';

  if (!skipBuild) {
    // Build core package first (required dependency)
    console.log('🔨 Building @rb9k/core package...');
    execSync('npm run build --workspace=packages/core', {
      cwd: repoRoot,
      stdio: 'inherit',
      env: sharedEnv,
    });

    // Build API package
    console.log('🔨 Building API package...');
    execSync('npm run build --workspace=packages/api', {
      cwd: repoRoot,
      stdio: 'inherit',
      env: sharedEnv,
    });

    // Build web package
    console.log('🔨 Building web package...');
    execSync('npm run build --workspace=apps/web', {
      cwd: repoRoot,
      stdio: 'inherit',
      env: {
        ...sharedEnv,
        API_BASE: process.env.API_BASE ?? 'http://localhost:4000',
      },
    });
  }

  // Seed users: for Docker testing, use API endpoint to seed into container DB.
  // For local dev, use the seed-users.js script.
  if (isDockerTesting) {
    console.log('🌱 Seeding verified test user via API endpoint for Docker...');
    try {
      const fetch = globalThis.fetch;
      const seedRes = await fetch(`${apiBaseUrl}/__test/seed-verified-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-test-secret': process.env.TEST_ROUTE_SECRET || 'development-test-secret-123',
        },
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'ValidPassword1!',
          name: 'Test User',
        }),
      });
      if (seedRes.ok) {
        const seedData = await seedRes.json();
        console.log('   ✓ Verified user seeded:', seedData);
      } else {
        console.error('   ✗ Failed to seed user:', seedRes.status, await seedRes.text());
        throw new Error(`Failed to seed user: ${seedRes.status}`);
      }
    } catch (error) {
      console.error('   ✗ Error seeding user via API:', error);
      throw error;
    }
  } else {
    execSync('node scripts/seed-users.js', {
      cwd: repoRoot,
      stdio: 'inherit',
      env: sharedEnv,
    });
  }

  // If the test runner requested a specific seeded account, create and verify it now.
  // This ensures the account exists after the standard seeding step (which may reset the DB).
  if (process.env.TEST_SEED_EMAIL && process.env.TEST_SEED_PASSWORD) {
    try {
      console.log('Seeding additional test account:', process.env.TEST_SEED_EMAIL);
      const fetch = globalThis.fetch;
      const registerRes = await fetch(
        `${process.env.API_BASE || 'http://localhost:4000'}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: process.env.TEST_SEED_EMAIL,
            password: process.env.TEST_SEED_PASSWORD,
            confirmPassword: process.env.TEST_SEED_PASSWORD,
            fullName: 'Playwright Seed',
          }),
        }
      );
      console.log('  register status', registerRes.status);

      // Fetch the in-memory email outbox via the test-support endpoint and confirm the user's email
      const emailsRes = await fetch(
        `${process.env.API_BASE || 'http://localhost:4000'}/__test/emails`,
        {
          method: 'GET',
          headers: { 'x-test-secret': process.env.TEST_ROUTE_SECRET || '' },
        }
      );
      if (emailsRes.ok) {
        const outbox: Array<{ to: string; text?: string; metadata?: { token?: string } }> =
          await emailsRes.json();
        const found = outbox.reverse().find(e => e.to === process.env.TEST_SEED_EMAIL);
        if (found) {
          const token =
            found.metadata?.token ||
            (found.text && (found.text.match(/token=([a-f0-9]+)/) || [])[1]);
          if (token) {
            const verifyRes = await fetch(
              `${process.env.API_BASE || 'http://localhost:4000'}/auth/verify-email`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
              }
            );
            console.log('  verify status', verifyRes.status);
          } else {
            console.warn('  no verification token found for seeded account');
          }
        } else {
          console.warn('  no email found in outbox for', process.env.TEST_SEED_EMAIL);
        }
      } else {
        console.warn('  unable to read test email outbox (status=', emailsRes.status, ')');
      }
    } catch (e) {
      console.warn('Failed to create/verify TEST_SEED_EMAIL during global setup', e);
    }
  }
}
