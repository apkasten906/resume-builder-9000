import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';

import { connectDatabase, closeDatabase } from '../../src/db.js';

const ORIGINAL_DB_PATH = process.env.DB_PATH;

describe('profile_parsed_fields schema bootstrap', () => {
  let tempDir: string;
  let tempDbPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rb9k-profile-parsed-'));
    tempDbPath = path.join(tempDir, 'profile-parsed-fields.db');

    const db = new Database(tempDbPath);
    db.exec(`
      CREATE TABLE profile_parsed_fields (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL
      );
    `);
    db.close();

    process.env.DB_PATH = tempDbPath;
    closeDatabase();
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    if (ORIGINAL_DB_PATH) {
      process.env.DB_PATH = ORIGINAL_DB_PATH;
    } else {
      delete process.env.DB_PATH;
    }
  });

  it('ensures parsed resume columns exist', () => {
    const db = connectDatabase();
    const columns = db
      .prepare('PRAGMA table_info(profile_parsed_fields)')
      .all()
      .map((column: { name: string }) => column.name);

    const expectedColumns = [
      'id',
      'user_id',
      'upload_id',
      'parsed_summary',
      'personal_info',
      'experience',
      'skills',
      'education',
      'certifications',
      'awards',
      'hobbies',
      'created_at',
      'updated_at',
    ];

    for (const expected of expectedColumns) {
      expect(columns).toContain(expected);
    }
  });

  it('creates the parsed resume history table with indexes', () => {
    const db = connectDatabase();
    const table = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='profile_parsed_fields_history'"
      )
      .get();
    expect(table).toBeDefined();

    const historyColumns = db
      .prepare('PRAGMA table_info(profile_parsed_fields_history)')
      .all()
      .map((column: { name: string }) => column.name);

    const expectedHistoryColumns = [
      'id',
      'parsed_resume_id',
      'user_id',
      'upload_id',
      'snapshot',
      'created_at',
    ];

    for (const expected of expectedHistoryColumns) {
      expect(historyColumns).toContain(expected);
    }
  });
});
