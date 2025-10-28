// scripts/seed-users.js
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the API package resume.db file. Prefer DB_PATH from environment when provided.
const defaultDbPath = path.join(__dirname, '..', 'packages', 'api', 'data', 'resume.db');
const dbPath =
  process.env.DB_PATH && process.env.DB_PATH.length > 0 ? process.env.DB_PATH : defaultDbPath;

console.log(`Seeding users into database at ${dbPath}`);

// Ensure parent directory exists so better-sqlite3 can open/create the file
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  console.log(`Database directory ${dbDir} does not exist - creating...`);
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to the database (will create file if it doesn't exist)
const db = new Database(dbPath);

// First check the schema of the users table
let userColumns = db.prepare('PRAGMA table_info(users)').all();
if (!userColumns || userColumns.length === 0) {
  console.log('No users table found - creating users table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      email_confirmed INTEGER NOT NULL DEFAULT 0,
      email_confirmed_at TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  userColumns = db.prepare('PRAGMA table_info(users)').all();
  console.log('Created users table with columns:');
  console.log(userColumns.map(col => col.name).join(', '));
} else {
  console.log('Existing table structure:');
  console.log(userColumns.map(col => col.name).join(', '));
}

// Clear existing test users to avoid duplicates
db.exec(`DELETE FROM users WHERE email = 'user@example.com'`);

// Insert test user with hashed password
const saltRounds = 10;
const hashedPassword = bcrypt.hashSync('ValidPassword1!', saltRounds);

// Dynamically build the SQL query based on available columns
const hasNameColumn = userColumns.some(col => col.name === 'name');
const hasEmailConfirmedColumn = userColumns.some(col => col.name === 'email_confirmed');

// Well-known test UUID for consistent E2E test data
// This fixed UUID ensures predictable user IDs across all E2E tests,
// making assertions and test data management reliable
const userId = '00000000-0000-0000-0000-000000000001';

let insert;
if (hasNameColumn && hasEmailConfirmedColumn) {
  insert = db.prepare(
    "INSERT INTO users (id, email, password_hash, name, created_at, email_confirmed, email_confirmed_at) VALUES (?, ?, ?, ?, datetime('now'), 1, datetime('now'))"
  );
  insert.run(userId, 'user@example.com', hashedPassword, 'Test User');
} else if (hasNameColumn) {
  insert = db.prepare(
    "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, datetime('now'))"
  );
  insert.run(userId, 'user@example.com', hashedPassword, 'Test User');
} else {
  insert = db.prepare(
    "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, datetime('now'))"
  );
  insert.run(userId, 'user@example.com', hashedPassword);
}

console.log('Test user created:');
console.log('- Email: user@example.com');
console.log('- Password: ValidPassword1!');

// Verify user was created
const user = db.prepare('SELECT * FROM users WHERE email = ?').get('user@example.com');
console.log('User record:', { id: user.id, email: user.email, name: user.name });

db.close();
console.log('Database seeding completed successfully!');
