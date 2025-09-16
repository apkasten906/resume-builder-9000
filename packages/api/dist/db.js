import BetterSQLite3 from 'better-sqlite3';
import { logger } from './utils/logger.js';
// Global database connection
let db = null;
export function connectDatabase() {
    if (db) {
        logger.debug('Using existing database connection');
        return db;
    }
    logger.info('Opening new database connection');
    // Open the database
    db = new BetterSQLite3('./resume.db');
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
export function getResumeFromDb(id) {
    const database = connectDatabase();
    logger.debug('Fetching resume from database', { resumeId: id });
    try {
        const stmt = database.prepare('SELECT * FROM resumes WHERE id = ?');
        const result = stmt.get(id);
        if (!result) {
            logger.info('Resume not found in database', { resumeId: id });
            return null;
        }
        // Parse JSON data
        const parsedResumeData = JSON.parse(result.resume_data);
        logger.debug('Resume found in database', { resumeId: id });
        return parsedResumeData;
    }
    catch (error) {
        logger.error('Error retrieving resume from database', { error, resumeId: id });
        throw error;
    }
}
export function insertResume(resumeData) {
    const database = connectDatabase();
    // Generate a unique ID
    const id = generateUniqueId();
    logger.debug('Inserting resume into database', { resumeId: id });
    try {
        const stmt = database.prepare('INSERT INTO resumes (id, content, resume_data, job_details, created_at) VALUES (?, ?, ?, ?, ?)');
        stmt.run(id, resumeData.content, JSON.stringify(resumeData.resumeData), JSON.stringify(resumeData.jobDetails), resumeData.createdAt);
        logger.info('Resume saved successfully', { resumeId: id });
        return id;
    }
    catch (error) {
        logger.error('Error saving resume to database', { error });
        throw error;
    }
}
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
