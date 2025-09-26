// scripts/patch-user-id.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the API package resume.db file
const dbPath = path.join(__dirname, '..', 'packages', 'api', 'resume.db');
console.log(`Patching user record in database at ${dbPath}`);

// Connect to the database
const db = new Database(dbPath);

// Check current user record
const currentUser = db.prepare('SELECT * FROM users WHERE email = ?').get('user@example.com');
console.log('Current user record:', currentUser);

if (!currentUser) {
  console.error('No user found with email user@example.com');
  process.exit(1);
}

if (currentUser.id) {
  console.log(`User already has ID: ${currentUser.id}`);
  // If the ID is null or empty string, we'll update it anyway
  if (currentUser.id !== null && currentUser.id !== '') {
    console.log('No update needed, exiting');
    db.close();
    process.exit(0);
  }
}

// Generate a UUID
const userId = '00000000-0000-0000-0000-000000000001'; // Use a predictable ID for test user

// Update the user record with the UUID
const updateStmt = db.prepare('UPDATE users SET id = ? WHERE email = ?');
const result = updateStmt.run(userId, 'user@example.com');

console.log(`Updated ${result.changes} user records`);

// Verify the update
const updatedUser = db.prepare('SELECT * FROM users WHERE email = ?').get('user@example.com');
console.log('Updated user record:', {
  id: updatedUser.id,
  email: updatedUser.email,
  created_at: updatedUser.created_at,
});

db.close();
console.log('Database patching completed successfully!');
