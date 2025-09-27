import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';

import { logger } from './utils/logger.js';
import { StoredResume, DatabaseRow } from './types/database.js';

// Type alias for a better-sqlite3 database instance
type SQLiteDatabase = InstanceType<typeof Database>;
let db: SQLiteDatabase | null = null;

// Database should be in the packages/api directory
// DB_PATH can be used to override the default location
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'resume.db');

export function connectDatabase(): SQLiteDatabase {
  if (db) {
    logger.debug('Using existing database connection');
    return db;
  }

  logger.info(`Opening new database connection to ${DB_PATH}`);
  db = new Database(DB_PATH);

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

function generateUniqueId(): string {
  // Uses Node.js crypto.randomUUID() for secure, collision-resistant IDs
  return randomUUID();
}
