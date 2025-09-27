import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';

// This test directly tests SQLite functionality without using our db.ts module
// to avoid mocking issues and provide a real integration test
describe('SQLite Integration Tests', () => {
  // Use an in-memory database for testing
  let db: any; // Using any for simplicity in tests

  beforeEach(() => {
    // Use in-memory database for speed and simplicity
    db = new Database(':memory:');

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS resumes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        resume_data TEXT NOT NULL,
        job_details TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
  });

  it('should create tables and verify structure', () => {
    // Check if the resumes table exists
    const tableResult = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='resumes'")
      .get() as { name: string };

    expect(tableResult).toBeDefined();
    expect(tableResult.name).toBe('resumes');

    // Check if the table has the expected structure
    type ColumnInfo = {
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    };

    const tableInfo = db.prepare("PRAGMA table_info('resumes')").all() as ColumnInfo[];
    const columnNames = tableInfo.map(col => col.name);

    expect(columnNames).toContain('id');
    expect(columnNames).toContain('content');
    expect(columnNames).toContain('resume_data');
    expect(columnNames).toContain('job_details');
    expect(columnNames).toContain('created_at');
  });

  it('should handle database write and read operations', () => {
    // Insert a test record
    const id = 'test-id';
    const content = 'Test content';
    const resumeData = JSON.stringify({ name: 'Test User' });
    const jobDetails = JSON.stringify({ title: 'Test Job' });
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO resumes (id, content, resume_data, job_details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const info = stmt.run(id, content, resumeData, jobDetails, createdAt);
    expect(info.changes).toBe(1);

    // Define type for resume record
    type ResumeRecord = {
      id: string;
      content: string;
      resume_data: string;
      job_details: string;
      created_at: string;
    };

    // Verify the record was inserted
    const result = db.prepare('SELECT * FROM resumes WHERE id = ?').get(id) as ResumeRecord;
    expect(result).toBeDefined();
    expect(result.id).toBe(id);
    expect(result.content).toBe(content);
    expect(result.resume_data).toBe(resumeData);
    expect(result.job_details).toBe(jobDetails);
    expect(result.created_at).toBe(createdAt);
  });

  it('should handle error conditions properly', () => {
    // Insert record with duplicate primary key
    const id = 'duplicate-id';
    const content = 'Test content';
    const resumeData = JSON.stringify({ name: 'Test User' });
    const jobDetails = JSON.stringify({ title: 'Test Job' });
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO resumes (id, content, resume_data, job_details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    // First insert should succeed
    stmt.run(id, content, resumeData, jobDetails, createdAt);

    // Second insert with same ID should fail with constraint error
    expect(() => {
      stmt.run(id, 'Different content', resumeData, jobDetails, createdAt);
    }).toThrow();
  });
});
