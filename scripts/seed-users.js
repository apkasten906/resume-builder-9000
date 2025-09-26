// scripts/seed-users.js
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the API package resume.db file
const dbPath = path.join(__dirname, '..', 'packages', 'api', 'resume.db');

console.log(`Seeding users into database at ${dbPath}`);

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.error(`Database file not found at ${dbPath}`);
  process.exit(1);
}

// Connect to the database
const db = new Database(dbPath);

// First check the schema of the users table
let userColumns;
try {
  userColumns = db.prepare('PRAGMA table_info(users)').all();
  console.log('Existing table structure:');
  console.log(userColumns.map(col => col.name).join(', '));
} catch (err) {
  console.error('Error checking table schema:', err.message);

  // Create users table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  userColumns = db.prepare('PRAGMA table_info(users)').all();
  console.log('Created users table with columns:');
  console.log(userColumns.map(col => col.name).join(', '));
}

// Clear existing test users to avoid duplicates
db.exec(`DELETE FROM users WHERE email = 'user@example.com'`);

// Insert test user with hashed password
const saltRounds = 10;
const hashedPassword = bcrypt.hashSync('ValidPassword1!', saltRounds);

// Dynamically build the SQL query based on available columns
const hasNameColumn = userColumns.some(col => col.name === 'name');

let insert;
if (hasNameColumn) {
  insert = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
  insert.run('user@example.com', hashedPassword, 'Test User');
} else {
  insert = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
  insert.run('user@example.com', hashedPassword);
}

console.log('Test user created:');
console.log('- Email: user@example.com');
console.log('- Password: ValidPassword1!');

// Verify user was created
const user = db.prepare('SELECT * FROM users WHERE email = ?').get('user@example.com');
console.log('User record:', { id: user.id, email: user.email, name: user.name });

db.close();
console.log('Database seeding completed successfully!');
