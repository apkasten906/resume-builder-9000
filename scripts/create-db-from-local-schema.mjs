#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Use the current working directory as the project root to avoid URL pathname quirks on Windows
const projectRoot = process.cwd();
const defaultDbPath = path.join(projectRoot, 'packages', 'api', 'data', 'resume.db');
const dbPath = process.env.DB_PATH || defaultDbPath;
const schemaPath = path.join(projectRoot, 'local-schema.sql');

if (!fs.existsSync(schemaPath)) {
  console.error('local-schema.sql not found at', schemaPath);
  process.exit(2);
}

// Read schema and handle possible UTF-16 BOM (some SQL files were saved as UTF-16 LE)
const buf = fs.readFileSync(schemaPath);
let sql;
if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
  // UTF-16 LE BOM
  sql = buf.toString('utf16le').replace(/^\uFEFF/, '');
} else if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
  // UTF-16 BE - convert by swapping bytes then decode as utf16le
  const swapped = Buffer.allocUnsafe(buf.length - 2);
  for (let i = 2; i < buf.length; i += 2) {
    swapped[i - 2] = buf[i + 1] || 0;
    swapped[i - 1] = buf[i] || 0;
  }
  sql = swapped.toString('utf16le').replace(/^\uFEFF/, '');
} else {
  sql = buf.toString('utf8');
}

// Ensure directory exists
const dir = path.dirname(dbPath);
fs.mkdirSync(dir, { recursive: true });

console.log('Creating/Opening database at', dbPath);
const db = new Database(dbPath);

try {
  // Remove attempts to create SQLite internal statistics tables which are reserved
  let cleanedSql = sql
    .replace(/CREATE TABLE sqlite_stat\d[^;]*;?/gi, '\n')
    .replace(/CREATE TABLE sqlite_sequence[^;]*;?/gi, '\n');
  // Make CREATE TABLE idempotent so we can safely re-run against existing DBs
  cleanedSql = cleanedSql.replace(/CREATE\s+TABLE\s+/gi, 'CREATE TABLE IF NOT EXISTS ');
  db.exec(cleanedSql);
  console.log('Schema applied successfully.');
} catch (err) {
  console.error('Failed to apply schema:', err.message || err);
  process.exit(3);
} finally {
  db.close();
}
