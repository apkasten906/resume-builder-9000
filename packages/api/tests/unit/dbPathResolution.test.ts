import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, closeDatabase } from '../../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..', '..');
const repoRoot = path.resolve(packageRoot, '..', '..');

describe('DB path resolution', () => {
  beforeEach(() => {
    // clear any existing DB connection
    closeDatabase();
    delete process.env.DB_PATH;
  });

  afterEach(() => {
    closeDatabase();
    delete process.env.DB_PATH;
  });

  const cases: Array<{ dbPath: string; shouldCreateFile: boolean }> = [
    { dbPath: ':memory:', shouldCreateFile: false },
    { dbPath: 'file:memdb?mode=memory&cache=shared', shouldCreateFile: false },
    { dbPath: '/packages/api/data/resume.test.db', shouldCreateFile: true },
    { dbPath: 'packages/api/data/resume.test2.db', shouldCreateFile: true },
    { dbPath: 'data/resume.test3.db', shouldCreateFile: true },
  ];

  for (const c of cases) {
    it(`connects for DB_PATH='${c.dbPath}' (createFile=${c.shouldCreateFile})`, () => {
      process.env.DB_PATH = c.dbPath;

      const db = connectDatabase();
      expect(db).toBeTruthy();

      // If file-backed DB expected, ensure the file exists at the resolved repo location
      if (c.shouldCreateFile) {
        // compute expected resolved path similar to implementation rules
        const raw = c.dbPath.replace(/\\/g, '/');
        const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
        const expected = path.resolve(repoRoot, `.${withLeading}`);

        // Close DB so the file handle is released and we can check the file exists
        closeDatabase();

        const exists = fs.existsSync(expected);
        expect(exists).toBeTruthy();

        // cleanup the created test db file
        try {
          if (exists) fs.unlinkSync(expected);
        } catch (err) {
          // ignore cleanup errors
        }
      } else {
        // in-memory or file: URIs should not produce files under repo root
        closeDatabase();
      }
    });
  }
});
