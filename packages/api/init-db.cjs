#!/usr/bin/env node
/**
 * Initialize the SQLite database with the core schema used by the API service.
 *
 * This script mirrors the table definitions in packages/api/src/db.ts so that
 * local databases created outside the service (for example when seeding data or
 * preparing automated tests) contain the same structure, including the parsed
 * resume fields introduced for story #53.
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DEFAULT_DB_PATH = path.join(__dirname, 'resume.db');
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : DEFAULT_DB_PATH;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

function ensureTable(sql) {
  db.exec(sql);
}

function ensureIndex(sql) {
  db.exec(sql);
}

const ALLOWED_TABLE_COLUMNS = {
  profile_parsed_fields: new Set([
    'upload_id',
    'parsed_summary',
    'personal_info',
    'experience',
    'skills',
    'education',
    'certifications',
    'awards',
    'hobbies',
    'created_at',
    'updated_at',
  ]),
};

function tableColumns(tableName) {
  if (!(tableName in ALLOWED_TABLE_COLUMNS)) {
    console.warn(`Unsupported table requested: ${tableName}. Skipping introspection.`);
    return [];
  }
  return db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .map(col => col.name);
}

function ensureColumn(tableName, columnName, definition) {
  const allowedColumns = ALLOWED_TABLE_COLUMNS[tableName];
  if (!allowedColumns) {
    console.warn(`Unsupported table requested: ${tableName}. Skipping column ensure.`);
    return;
  }
  if (!allowedColumns.has(columnName)) {
    console.warn(`Unsupported column requested: ${tableName}.${columnName}. Skipping.`);
    return;
  }
  const columns = tableColumns(tableName);
  if (!columns.includes(columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    console.log(`Added column ${columnName} to ${tableName}`);
  }
}

console.log(`Initializing database schema at ${dbPath}`);

ensureTable(`
  CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    resume_data TEXT NOT NULL,
    job_details TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

ensureTable(`
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

ensureTable(`
  CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

ensureIndex(`
  CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id
  ON email_verification_tokens(user_id)
`);

ensureIndex(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
`);

ensureTable(`
  CREATE TABLE IF NOT EXISTS profile_parsed_fields (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    upload_id TEXT,
    parsed_summary TEXT,
    personal_info TEXT,
    experience TEXT,
    skills TEXT,
    education TEXT,
    certifications TEXT,
    awards TEXT,
    hobbies TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (upload_id) REFERENCES resumes(id) ON DELETE SET NULL
  )
`);

// Ensure newly introduced columns exist for older databases
ensureColumn('profile_parsed_fields', 'upload_id', 'TEXT');
ensureColumn('profile_parsed_fields', 'parsed_summary', 'TEXT');
ensureColumn('profile_parsed_fields', 'personal_info', 'TEXT');
ensureColumn('profile_parsed_fields', 'experience', 'TEXT');
ensureColumn('profile_parsed_fields', 'skills', 'TEXT');
ensureColumn('profile_parsed_fields', 'education', 'TEXT');
ensureColumn('profile_parsed_fields', 'certifications', 'TEXT');
ensureColumn('profile_parsed_fields', 'awards', 'TEXT');
ensureColumn('profile_parsed_fields', 'hobbies', 'TEXT');
ensureColumn('profile_parsed_fields', 'created_at', "TEXT NOT NULL DEFAULT (datetime('now'))");
ensureColumn('profile_parsed_fields', 'updated_at', "TEXT NOT NULL DEFAULT (datetime('now'))");

ensureIndex(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_parsed_fields_user_upload
  ON profile_parsed_fields(user_id, upload_id)
`);

ensureIndex(`
  CREATE INDEX IF NOT EXISTS idx_profile_parsed_fields_upload
  ON profile_parsed_fields(upload_id)
`);

ensureTable(`
  CREATE TABLE IF NOT EXISTS profile_parsed_fields_history (
    id TEXT PRIMARY KEY,
    parsed_resume_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    upload_id TEXT,
    snapshot TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (parsed_resume_id) REFERENCES profile_parsed_fields(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (upload_id) REFERENCES resumes(id) ON DELETE SET NULL
  )
`);

ensureIndex(`
  CREATE INDEX IF NOT EXISTS idx_profile_parsed_history_user_upload
  ON profile_parsed_fields_history(user_id, upload_id, created_at DESC)
`);

ensureIndex(`
  CREATE INDEX IF NOT EXISTS idx_profile_parsed_history_resume
  ON profile_parsed_fields_history(parsed_resume_id)
`);

console.log('Database schema initialized successfully.');

db.close();
