import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { logger } from './utils/logger';
import { StoredResume, DatabaseRow } from './types/database';

// Global database connection
let db: Database | null = null;

export async function connectDatabase(): Promise<Database> {
  if (db) {
    logger.debug('Using existing database connection');
    return db;
  }
  
  logger.info('Opening new database connection');
  // Open the database
  db = await open({
    filename: './resume.db',
    driver: sqlite3.Database
  });
  
  // Create tables if they don't exist
  await db.exec(`
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

export async function getResumeFromDb(id: string): Promise<StoredResume | null> {
  const database = await connectDatabase();
  logger.debug('Fetching resume from database', { resumeId: id });
  
  try {
    const result = await database.get<DatabaseRow>('SELECT * FROM resumes WHERE id = ?', id);
    
    if (!result) {
      logger.info('Resume not found in database', { resumeId: id });
      return null;
    }
    
    // Parse JSON data
    logger.debug('Resume found in database', { resumeId: id });
    return {
      id: result.id,
      content: result.content,
      resumeData: JSON.parse(result.resume_data),
      jobDetails: JSON.parse(result.job_details),
      createdAt: result.created_at
    };
  } catch (error) {
    logger.error('Error retrieving resume from database', { error, resumeId: id });
    throw error;
  }
}

export async function insertResume(resumeData: Omit<StoredResume, 'id'>): Promise<string> {
  const database = await connectDatabase();
  
  // Generate a unique ID
  const id = generateUniqueId();
  
  logger.debug('Inserting resume into database', { resumeId: id });
  
  try {
    await database.run(
      'INSERT INTO resumes (id, content, resume_data, job_details, created_at) VALUES (?, ?, ?, ?, ?)',
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
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
