// scripts/debug-auth.js
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the API package resume.db file
const dbPath = path.join(__dirname, '..', 'packages', 'api', 'resume.db');
console.log(`Debugging auth in database at ${dbPath}`);

// Connect to the database
const db = new Database(dbPath);

// Get the user record
const user = db.prepare('SELECT * FROM users WHERE email = ?').get('user@example.com');
console.log('User record:', user);

// Test password comparison
const testPassword = 'ValidPassword1!';
console.log(`Testing password comparison for "${testPassword}" against stored hash...`);

try {
  // Compare password synchronously for easier debugging
  const compareResult = bcrypt.compareSync(testPassword, user.password_hash);
  console.log('Password comparison result:', compareResult);

  // Create a new hash with the same password to see if it's a bcrypt version issue
  const newHash = bcrypt.hashSync(testPassword, 10);
  console.log('New hash for same password:', newHash);

  // Compare with the new hash
  const newCompareResult = bcrypt.compareSync(testPassword, newHash);
  console.log('Password comparison with new hash result:', newCompareResult);

  // Log bcrypt version info
  console.log('bcrypt version:', bcrypt.version || 'unknown');
} catch (error) {
  console.error('Error during password comparison:', error);
}

db.close();
