/**
 * Test helper for direct database manipulation
 *
 * This allows tests to bypass authentication and API calls
 * by directly adding records to the database.
 */
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';

// Use the same database as the application
// By default, this is resume.db in the project root

// Get the database connection
let db: InstanceType<typeof Database> | null = null;

/**
 * Connect to the application database
 */
function getTestDb(): InstanceType<typeof Database> {
  if (db) {
    return db;
  }

  // Find project root by going up 5 directories from this file
  const projectRoot = path.resolve(__dirname, '../../../../../');
  const dbPath = path.join(projectRoot, 'resume.db');
  console.log(`Opening application database at ${dbPath}`);

  db = new Database(dbPath, { fileMustExist: true });

  // Use the actual database that the app is using
  // Don't create tables as they should already exist

  // No need to create the test user here as we're just adding records
  // directly for an existing user

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
      jd_text, currency, salary_base, salary_bonus, salary_equity, salary_notes
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
