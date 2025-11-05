import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { logger } from './utils/logger.js';
import { StoredResume, DatabaseRow } from './types/database.js';

/**
 * Type alias for a better-sqlite3 database instance
 */
type SQLiteDatabase = InstanceType<typeof Database>;

/**
 * Global database connection singleton
 * This is kept as module-level state to avoid multiple connections
 */
let db: SQLiteDatabase | null = null;

/**
 * Connect to the SQLite database
 *
 * The database path is determined from process.env.DB_PATH or defaults to 'resume.db' in the current directory.
 * This function reads the environment variable dynamically on each call to support test isolation.
 * Multiple calls to this function will reuse the existing connection unless closeDatabase() was called.
 *
 * @returns A connected SQLite database instance
 */
export function connectDatabase(): SQLiteDatabase {
  if (db) {
    logger.debug('Using existing database connection');
    return db;
  }

  // Resolve DB path robustly:
  // - If DB_PATH is provided and absolute, use it as-is
  // - If DB_PATH is provided and relative, resolve it relative to the API package
  //   directory (not process.cwd()) so callers can pass 'data/resume.db' and
  //   it will resolve to 'packages/api/data/resume.db'.
  // - If DB_PATH is not provided, default to '<packageRoot>/data/resume.db'.
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const packageRoot = path.resolve(__dirname, '..');

  const rawDbPath =
    process.env.DB_PATH && process.env.DB_PATH.length > 0 ? process.env.DB_PATH : undefined;

  // Decide final DB path. Preserve special SQLite URIs such as ':memory:' or
  // 'file:...' exactly as provided by tests or callers. If a relative path is
  // provided, resolve it relative to the api package root so callers can pass
  // 'data/resume.db'. If none provided, default to packages/api/data/resume.db.
  let dbPath: string;
  if (rawDbPath) {
    if (rawDbPath === ':memory:' || rawDbPath.startsWith('file:')) {
      dbPath = rawDbPath; // in-memory or file URI -- do not resolve
    } else {
      // Normalize path separators first
      const cleaned = rawDbPath.replace(/\\/g, '/');

      // Check if this is a repo-relative path (starts with 'packages/', '/packages/', 'apps/', '/apps/', or single segment like 'data/')
      // These should be resolved relative to repo root, not treated as absolute even if they start with '/'
      const isRepoRelative =
        cleaned.startsWith('packages/') ||
        cleaned.startsWith('/packages/') ||
        cleaned.startsWith('apps/') ||
        cleaned.startsWith('/apps/') ||
        (!cleaned.includes(':') && !path.isAbsolute(cleaned.replace(/^\//, ''))); // Remove leading / before checking if absolute

      if (isRepoRelative) {
        // For repo-relative paths, resolve against the repository root
        const repoRoot = path.resolve(packageRoot, '..', '..');
        const withLeading = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
        dbPath = path.resolve(repoRoot, `.${withLeading}`);
      } else {
        // True absolute paths (e.g., C:\..., /absolute/posix/path) are used as-is
        dbPath = rawDbPath;
      }
    }
  } else {
    dbPath = path.join(packageRoot, 'data', 'resume.db');
  }

  logger.info(`Resolved DB path: ${dbPath}`);
  // Ensure parent directory exists before opening the database file
  const dbDir = path.dirname(dbPath);
  try {
    if (!fs.existsSync(dbDir)) {
      logger.info(`Database directory ${dbDir} does not exist - creating...`);
      fs.mkdirSync(dbDir, { recursive: true });
    }
  } catch (err) {
    logger.error('Failed to create database directory', { err });
    throw err;
  }

  logger.info(`Opening new database connection to ${dbPath}`);
  db = new Database(dbPath, {
    fileMustExist: false,
  });

  // Note: verbose logging removed due to type compatibility issues with newer better-sqlite3 versions

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      resume_data TEXT NOT NULL,
      job_details TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT,
      email_confirmed INTEGER NOT NULL DEFAULT 0,
      email_confirmed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id
    ON email_verification_tokens(user_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
  `);

  const userColumns = db.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>;
  const columnNames = new Set(userColumns.map(col => col.name));
  if (!columnNames.has('name')) {
    db.exec('ALTER TABLE users ADD COLUMN name TEXT');
  }
  if (!columnNames.has('created_at')) {
    db.exec("ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (datetime('now'))");
  }
  if (!columnNames.has('email_confirmed')) {
    db.exec('ALTER TABLE users ADD COLUMN email_confirmed INTEGER NOT NULL DEFAULT 0');
  }
  if (!columnNames.has('email_confirmed_at')) {
    db.exec('ALTER TABLE users ADD COLUMN email_confirmed_at TEXT');
  }

  logger.info('Database initialized successfully');
  return db;
}

export function getAllResumesFromDb(): StoredResume[] {
  const database = connectDatabase();
  logger.debug('Fetching all resumes from database');
  try {
    const stmt = database.prepare('SELECT * FROM resumes ORDER BY created_at DESC');
    const results = stmt.all() as DatabaseRow[];
    return results.map(result => ({
      id: result.id,
      content: result.content,
      resumeData: JSON.parse(result.resume_data),
      jobDetails: JSON.parse(result.job_details),
      createdAt: result.created_at,
    }));
  } catch (error) {
    logger.error('Error retrieving all resumes from database', { error });
    throw error;
  }
}

export function getResumeFromDb(id: string): StoredResume | null {
  const database = connectDatabase();
  logger.debug('Fetching resume from database', { resumeId: id });

  try {
    const stmt = database.prepare('SELECT * FROM resumes WHERE id = ?');
    const result = stmt.get(id) as DatabaseRow | undefined;

    if (!result) {
      logger.info('Resume not found in database', { resumeId: id });
      return null;
    }

    // Parse JSON fields and construct StoredResume
    const resumeData = JSON.parse(result.resume_data);
    const jobDetails = JSON.parse(result.job_details);
    const storedResume: StoredResume = {
      id: result.id,
      content: result.content,
      resumeData,
      jobDetails,
      createdAt: result.created_at,
    };
    logger.debug('Resume found in database', { resumeId: id });
    return storedResume;
  } catch (error) {
    logger.error('Error retrieving resume from database', { error, resumeId: id });
    throw error;
  }
}

export function insertResume(resumeData: Omit<StoredResume, 'id'>): string {
  const database = connectDatabase();

  // Generate a unique ID
  const id = generateUniqueId();

  logger.debug('Inserting resume into database', { resumeId: id });

  try {
    const stmt = database.prepare(
      'INSERT INTO resumes (id, content, resume_data, job_details, created_at) VALUES (?, ?, ?, ?, ?)'
    );

    stmt.run(
      id,
      resumeData.content,
      JSON.stringify(resumeData.resumeData),
      JSON.stringify(resumeData.jobDetails),
      resumeData.createdAt
    );

    logger.info('Resume saved successfully', { resumeId: id });
    return id;
  } catch (error) {
    logger.error('Error saving resume to database', { error });
    throw error;
  }
}

/**
 * Generate a unique UUID for database records
 *
 * @returns A random UUID string
 */
function generateUniqueId(): string {
  // Uses Node.js crypto.randomUUID() for secure, collision-resistant IDs
  return randomUUID();
}

/**
 * Close the database connection
 *
 * This function properly closes the current database connection and resets the internal state.
 * This is particularly useful for tests to ensure proper isolation between test runs.
 * After calling this, the next call to connectDatabase() will create a new connection.
 */
export function closeDatabase(): void {
  if (db) {
    logger.debug('Closing database connection');
    db.close();
    db = null;
  }
}
