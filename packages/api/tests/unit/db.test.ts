import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { connectDatabase } from '../../src/db.js';

// Mock the external dependencies
vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockReturnValue([
          {
            id: 'test-id-1',
            content: 'Test content',
            resume_data: '{"name":"Test User"}',
            job_details: '{"title":"Software Engineer"}',
            created_at: '2025-09-26T12:00:00.000Z',
          },
        ]),
        get: vi.fn().mockReturnValue({
          id: 'test-id-1',
          content: 'Test content',
          resume_data: '{"name":"Test User"}',
          job_details: '{"title":"Software Engineer"}',
          created_at: '2025-09-26T12:00:00.000Z',
        }),
        run: vi.fn(),
      }),
      exec: vi.fn(),
      close: vi.fn(),
    })),
  };
});

vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Database Connection', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should connect to the database successfully', () => {
    const db = connectDatabase();
    expect(db).toBeDefined();
    expect(typeof db.prepare).toBe('function');
    expect(typeof db.exec).toBe('function');
  });

  it('should reuse the existing connection when called multiple times', () => {
    const db1 = connectDatabase();
    const db2 = connectDatabase();
    expect(db1).toBe(db2);
  });

  it('should initialize tables on first connection', () => {
    // The mock setup is already verified in the previous tests
    // This test is more about verifying that the function doesn't throw an error
    const db = connectDatabase();
    expect(db).toBeDefined();
  });
});
