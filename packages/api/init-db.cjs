#!/usr/bin/env node
/**
 * Database Initialization Script
 *
 * This script ensures the database schema is created before the API server starts.
 * It runs migrations and creates required tables if they don't exist.
 *
 * DB_PATH behavior (important):
 * - If the environment variable DB_PATH is provided, that path will be used.
 * - In Docker/container runtime we expect DB_PATH to point at a container mount,
 *   by convention: /app/data/resume.db
 * - For local development the repository convention is to use
 *   packages/api/data/resume.db (setup scripts default to this path).
 *
 * Summary:
 * - Container default: /app/data/resume.db
 * - Local dev default: packages/api/data/resume.db
 * - DB_PATH env var overrides both when set
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Determine database path from environment or use a container-friendly default
// In the container runtime the production compose mounts data at /app/data
const dbPath = process.env.DB_PATH || '/app/data/resume.db';
const dataDir = path.dirname(dbPath);

console.log('[init-db] Starting database initialization...');
console.log('[init-db] Database path:', dbPath);
console.log('[init-db] Data directory:', dataDir);

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  console.log('[init-db] Creating data directory:', dataDir);
  fs.mkdirSync(dataDir, { recursive: true });
}

// Connect to database
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('[init-db] Connected to database');

// Define schema SQL (CREATE TABLE IF NOT EXISTS ensures idempotency)
const schemaSql = `
-- Core users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  name TEXT,
  email_confirmed INTEGER DEFAULT 0,
  email_confirmed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Schema migrations tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  content TEXT NOT NULL,
  resume_data TEXT NOT NULL,
  job_details TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Applications table for job tracking
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  stage TEXT NOT NULL CHECK (stage IN ('Prospect','Applied','Interview','Offer','Rejected','Accepted')),
  last_updated TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  jd_text TEXT,
  currency TEXT CHECK (currency IN ('USD','EUR','GBP','CAD','AUD')),
  salary_base REAL,
  salary_bonus REAL,
  salary_equity TEXT,
  salary_notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Application status history
CREATE TABLE IF NOT EXISTS application_status_history (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Attachments for applications
CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('resume','cover_letter','other')),
  filename TEXT,
  mime_type TEXT,
  url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_application_status_history_app_id ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_attachments_app_id ON attachments(application_id);
`;

try {
  console.log('[init-db] Applying schema...');
  db.exec(schemaSql);
  console.log('[init-db] Schema applied successfully');

  // Verify critical tables exist
  const tables = db
    .prepare(
      `
    SELECT name FROM sqlite_master
    WHERE type='table'
    AND name IN ('users', 'applications', 'resumes', 'schema_migrations')
    ORDER BY name
  `
    )
    .all();

  console.log('[init-db] Verified tables:', tables.map(t => t.name).join(', '));

  // Insert migration record
  const migrationId = 'docker-init-schema-v1';
  db.prepare(
    `
    INSERT OR IGNORE INTO schema_migrations (id, applied_at)
    VALUES (?, datetime('now'))
  `
  ).run(migrationId);

  console.log('[init-db] Database initialization complete ✓');
  db.close();
  process.exit(0);
} catch (error) {
  console.error('[init-db] Error during initialization:', error.message);
  console.error('[init-db] Stack trace:', error.stack);
  db.close();
  process.exit(1);
}
