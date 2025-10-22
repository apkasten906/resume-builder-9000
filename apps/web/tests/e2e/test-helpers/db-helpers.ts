/**
 * Test helper for direct database manipulation
 *
 * This allows tests to bypass authentication and API calls
 * by directly adding records to the database.
 */
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';
import { testLogger } from '../utils/test-logger';

// Get the database connection (respects process.env.DB_PATH when provided)
let db: InstanceType<typeof Database> | null = null;

/**
 * Connect to the application database
 *
 * This helper will prefer a DB path provided via process.env.DB_PATH so that
 * Playwright and other test runners can point tests at an isolated database
 * (for example: packages/api/test-e2e.db). If DB_PATH is not set it falls
 * back to the repository root resume.db for backwards compatibility.
 */
function getTestDb(): InstanceType<typeof Database> {
  if (db) return db;

  // Find project root by going up 5 directories from this file
  const projectRoot = path.resolve(__dirname, '../../../../../');

  // Respect DB_PATH if set (Playwright sets this when spawning the servers)
  const envDbPath =
    process.env.DB_PATH && process.env.DB_PATH.trim().length > 0 ? process.env.DB_PATH : null;
  const dbPath = envDbPath || path.join(projectRoot, 'resume.db');

  testLogger.log(`Opening application database at ${dbPath}`);

  // Allow the database file to be created if it doesn't exist; the API server
  // will normally initialize schema when started. Using fileMustExist: false
  // avoids crashes when tests run before the server has created the DB file.
  db = new Database(dbPath, { fileMustExist: false });

  return db;
}

/**
 * Add an application directly to the database
 */
export function addTestApplication(company: string, role: string, stage = 'Prospect'): string {
  const db = getTestDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  db.prepare(
    `
    INSERT INTO applications (
      id, company, role, location, stage, last_updated, created_at,
      job_description, currency, salary_base, salary_bonus, salary_equity, salary_notes
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      NULL, NULL, NULL, NULL, NULL, NULL
    )
  `
  ).run(id, company, role, 'Test Location', stage, now, now);

  return id;
}

/**
 * List all applications in the database
 */
export function listTestApplications(): Array<{ id: string; company: string; role: string }> {
  const db = getTestDb();
  const results = db.prepare('SELECT id, company, role FROM applications').all();
  return results as Array<{ id: string; company: string; role: string }>;
}

/**
 * Clear all applications from the database
 */
export function clearTestApplications(): void {
  const db = getTestDb();
  db.prepare('DELETE FROM applications').run();
}

/**
 * Close the database connection
 */
export function closeTestDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
