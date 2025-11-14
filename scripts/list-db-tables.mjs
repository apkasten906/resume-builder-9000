#!/usr/bin/env node
import Database from 'better-sqlite3';
import path from 'path';

const dbPath =
  process.env.DB_PATH || path.join(process.cwd(), 'packages', 'api', 'data', 'resume.db');
console.log('Reading DB at', dbPath);
const db = new Database(dbPath, { readonly: true });
const rows = db
  .prepare(
    "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table','index') ORDER BY name"
  )
  .all();
for (const r of rows) {
  console.log(r.name, r.type);
}
db.close();
