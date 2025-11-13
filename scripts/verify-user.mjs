import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultDbPath = path.join(__dirname, '..', 'packages', 'api', 'data', 'resume.db');
const dbPath =
  process.env.DB_PATH && process.env.DB_PATH.length > 0 ? process.env.DB_PATH : defaultDbPath;

console.log(`Opening database at ${dbPath}`);
const db = new Database(dbPath, { readonly: true });

try {
  const user = db
    .prepare(
      'SELECT id, email, email_confirmed, email_confirmed_at, created_at FROM users WHERE email = ?'
    )
    .get('user@example.com');
  if (!user) {
    console.log('No test user found (user@example.com)');
    process.exitCode = 2;
  } else {
    console.log('Found test user:');
    console.log(user);
    process.exitCode = 0;
  }
} catch (err) {
  console.error('Error querying users table:', err.message);
  process.exitCode = 3;
} finally {
  db.close();
}
