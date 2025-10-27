const Database = require('better-sqlite3');
const path = '/app/packages/api/resume.db';
const db = new Database(path);
const row = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='applications'")
  .get();
console.log('applications exists:', !!row);
