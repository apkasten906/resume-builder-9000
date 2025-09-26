// Script for migrating the SQLite database schema
// Standalone version for docs/db migrations
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'resume.db');
const MIGRATIONS_DIR = path.join(process.cwd(), 'docs', 'db migrations');

function getApplied(db) {
  const exists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'")
    .get();
  if (!exists) return new Set();
  const rows = db.prepare('SELECT id FROM schema_migrations').all();
  return new Set(rows.map(r => r.id));
}

function applyMigration(db, file, sql) {
  console.log(`Applying migration: ${file}`);
  db.exec(sql);
}

function main() {
  const db = new Database(DB_PATH);
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  const applied = getApplied(db);
  for (const f of files) {
    if (applied.has(f)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf-8');
    applyMigration(db, f, sql);
  }
  console.log('Migrations complete.');
}

main();
