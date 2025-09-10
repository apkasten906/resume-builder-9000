"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.getResumeFromDb = getResumeFromDb;
exports.insertResume = insertResume;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const logger_1 = require("./utils/logger");
// Global database connection
let db = null;
async function connectDatabase() {
    if (db) {
        logger_1.logger.debug('Using existing database connection');
        return db;
    }
    logger_1.logger.info('Opening new database connection');
    // Open the database
    db = await (0, sqlite_1.open)({
        filename: './resume.db',
        driver: sqlite3_1.default.Database
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
    logger_1.logger.info('Database initialized successfully');
    return db;
}
async function getResumeFromDb(id) {
    const database = await connectDatabase();
    logger_1.logger.debug('Fetching resume from database', { resumeId: id });
    try {
        const result = await database.get('SELECT * FROM resumes WHERE id = ?', id);
        if (!result) {
            logger_1.logger.info('Resume not found in database', { resumeId: id });
            return null;
        }
        // Parse JSON data
        logger_1.logger.debug('Resume found in database', { resumeId: id });
        return {
            id: result.id,
            content: result.content,
            resumeData: JSON.parse(result.resume_data),
            jobDetails: JSON.parse(result.job_details),
            createdAt: result.created_at
        };
    }
    catch (error) {
        logger_1.logger.error('Error retrieving resume from database', { error, resumeId: id });
        throw error;
    }
}
async function insertResume(resumeData) {
    const database = await connectDatabase();
    // Generate a unique ID
    const id = generateUniqueId();
    logger_1.logger.debug('Inserting resume into database', { resumeId: id });
    try {
        await database.run('INSERT INTO resumes (id, content, resume_data, job_details, created_at) VALUES (?, ?, ?, ?, ?)', id, resumeData.content, JSON.stringify(resumeData.resumeData), JSON.stringify(resumeData.jobDetails), resumeData.createdAt);
        logger_1.logger.info('Resume saved successfully', { resumeId: id });
        return id;
    }
    catch (error) {
        logger_1.logger.error('Error saving resume to database', { error });
        throw error;
    }
}
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
