import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import { getAllResumesFromDb, getResumeFromDb, insertResume } from '../../src/db.js';
import { StoredResume } from '../../src/types/database.js';
// We use these types in our test fixtures and assertions
import { ResumeData, JobDetails } from '@rb9k/core';

// Function to create properly typed test fixtures
function createMockResumeData(): ResumeData {
  return {
    personalInfo: {
      fullName: 'Test User',
      email: 'test@example.com'
    },
    summary: 'Test summary',
    experience: [],
    education: []
  };
}

function createMockJobDetails(): JobDetails {
  return {
    title: 'Test Job',
    company: 'Test Company',
    description: 'Test job description'
  };
}

// Define interfaces for our mock objects to improve type safety
interface MockDatabase {
  prepare: MockInstance;
  exec: MockInstance;
}

// Helper function for creating error-throwing function to avoid deep nesting
function createErrorThrowingFn(errorMessage: string) {
  return () => { throw new Error(errorMessage); };
}
vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      prepare: vi.fn().mockImplementation(query => {
        if (query.includes('SELECT * FROM resumes ORDER BY created_at DESC')) {
          return {
            all: vi.fn().mockReturnValue([
              {
                id: 'test-resume-id-1',
                content: 'Base64EncodedContent1',
                resume_data: JSON.stringify({
                  personalInfo: {
                    fullName: 'John Doe',
                    email: 'john@example.com',
                  },
                  summary: 'Experienced developer',
                  experience: [],
                  education: [],
                }),
                job_details: JSON.stringify({
                  title: 'Software Engineer',
                  company: 'Tech Corp',
                  description: 'Engineering role',
                }),
                created_at: '2025-09-27T12:00:00.000Z',
              },
              {
                id: 'test-resume-id-2',
                content: 'Base64EncodedContent2',
                resume_data: JSON.stringify({
                  personalInfo: {
                    fullName: 'Jane Smith',
                    email: 'jane@example.com',
                  },
                  summary: 'Senior manager',
                  experience: [],
                  education: [],
                }),
                job_details: JSON.stringify({
                  title: 'Product Manager',
                  company: 'Acme Inc',
                  description: 'Management role',
                }),
                created_at: '2025-09-26T12:00:00.000Z',
              },
            ]),
          };
        } else if (query.includes('SELECT * FROM resumes WHERE id = ?')) {
          return {
            get: vi.fn().mockImplementation(id => {
              if (id === 'test-resume-id-1') {
                return {
                  id: 'test-resume-id-1',
                  content: 'Base64EncodedContent1',
                  resume_data: JSON.stringify({
                    personalInfo: {
                      fullName: 'John Doe',
                      email: 'john@example.com',
                    },
                    summary: 'Experienced developer',
                    experience: [],
                    education: [],
                  }),
                  job_details: JSON.stringify({
                    title: 'Software Engineer',
                    company: 'Tech Corp',
                    description: 'Engineering role',
                  }),
                  created_at: '2025-09-27T12:00:00.000Z',
                };
              }
              return undefined; // Return undefined for non-existent IDs
            }),
          };
        } else if (query.includes('INSERT INTO resumes')) {
          return {
            run: vi.fn(),
          };
        }
        return {
          all: vi.fn(),
          get: vi.fn(),
          run: vi.fn(),
        };
      }),
      exec: vi.fn(),
    })),
  };
});

// Mock crypto's randomUUID
vi.mock('crypto', () => ({
  randomUUID: vi.fn().mockReturnValue('test-generated-id'),
}));

// Mock logger to avoid console output during tests
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Resume Database Operations', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Mock Date.now to return a fixed timestamp
    mockDate = new Date('2025-09-27T12:00:00.000Z');
    vi.setSystemTime(mockDate);
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore the original Date functionality
    vi.useRealTimers();
  });

  describe('getAllResumesFromDb', () => {
    it('should return all resumes from the database', () => {
      const resumes = getAllResumesFromDb();

      // Verify we get 2 resumes as defined in our mock
      expect(resumes).toHaveLength(2);

      // Verify first resume properties
      expect(resumes[0].id).toBe('test-resume-id-1');
      expect(resumes[0].content).toBe('Base64EncodedContent1');
      expect(resumes[0].resumeData).toEqual({
        personalInfo: {
          fullName: 'John Doe',
          email: 'john@example.com',
        },
        summary: 'Experienced developer',
        experience: [],
        education: [],
      });
      expect(resumes[0].jobDetails).toEqual({
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Engineering role',
      });
      expect(resumes[0].createdAt).toBe('2025-09-27T12:00:00.000Z');

      // Verify second resume
      expect(resumes[1].id).toBe('test-resume-id-2');
    });

    it('should handle database errors gracefully', async () => {
      // Since we're testing at the module level, we'll need to temporarily
      // override the mock for better-sqlite3

      // Store original mock
      const originalMock = vi.importActual('better-sqlite3');

      // Use our helper function to create the error throwing function
      const errorThrowingFunction = createErrorThrowingFn('Database error');
      const createErrorMock = () => ({
        default: vi.fn().mockImplementation(errorThrowingFunction),
      });

      // Mock implementation that throws an error
      vi.doMock('better-sqlite3', createErrorMock);

      // We need to clear the module cache and re-import to use our new mock
      vi.resetModules();

      // Re-import the module with our new mock using dynamic import
      const dbModule = await import('../../src/db.js');
      const { getAllResumesFromDb: getResumes } = dbModule;

      // Now our test should throw the expected error
      expect(() => getResumes()).toThrow('Database error');

      // Clean up
      vi.doMock('better-sqlite3', () => originalMock);
      vi.resetModules();
    });
  });

  describe('getResumeFromDb', () => {
    it('should return a single resume by ID', () => {
      const resume = getResumeFromDb('test-resume-id-1');

      // Verify it returns the correct resume
      expect(resume).not.toBeNull();
      expect(resume?.id).toBe('test-resume-id-1');
      expect(resume?.resumeData).toEqual({
        personalInfo: {
          fullName: 'John Doe',
          email: 'john@example.com',
        },
        summary: 'Experienced developer',
        experience: [],
        education: [],
      });
    });

    it('should return null for non-existent resume ID', () => {
      const resume = getResumeFromDb('non-existent-id');

      // Verify it returns null for non-existent ID
      expect(resume).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      // Define the mock database outside the nested context
      const mockDb: MockDatabase = {
        prepare: vi.fn().mockImplementation(() => {
          throw new Error('Database error');
        }),
        exec: vi.fn(),
      };
      
      // Store original mock
      const originalMock = vi.importActual('better-sqlite3');

      // Create a function to return our mock
      const createErrorMock = () => ({
        default: vi.fn().mockReturnValue(mockDb),
      });
      
      // Apply the mock
      vi.doMock('better-sqlite3', createErrorMock);
      
      // Reset modules and re-import
      vi.resetModules();
      const dbModule = await import('../../src/db.js');
      const { getResumeFromDb: getResume } = dbModule;
      
      // Expect function to throw error
      expect(() => getResume('test-resume-id-1')).toThrow('Database error');
      
      // Clean up
      vi.doMock('better-sqlite3', () => originalMock);
    });
  });

  describe('insertResume', () => {
    it('should insert a resume and return the generated ID', () => {
      const resumeData: Omit<StoredResume, 'id'> = {
        content: 'Base64EncodedContent',
        resumeData: createMockResumeData(),
        jobDetails: createMockJobDetails(),
        createdAt: mockDate.toISOString(),
      };

      const id = insertResume(resumeData);

      // Verify ID is the one generated by our mocked randomUUID function
      expect(id).toBe('test-generated-id');
    });

    it('should handle database errors during insert gracefully', async () => {
      // Create resumeData before mocking
      const testResumeData: Omit<StoredResume, 'id'> = {
        content: 'Base64EncodedContent',
        resumeData: createMockResumeData(),
        jobDetails: createMockJobDetails(),
        createdAt: mockDate.toISOString(),
      };
      
      // Create a mock run function that throws an error
      const mockRun = vi.fn().mockImplementation(() => {
        throw new Error('Insert error');
      });
      
      // Create a mock prepare function that returns an object with the mock run function
      const mockPrepare = vi.fn().mockReturnValue({
        run: mockRun,
      });
      
      // Create the mock database
      const mockDb: MockDatabase = {
        prepare: mockPrepare,
        exec: vi.fn(),
      };
      
      // Store original mock
      const originalMock = vi.importActual('better-sqlite3');
      
      // Create a function to return our mock
      const createErrorMock = () => ({
        default: vi.fn().mockReturnValue(mockDb),
      });
      
      // Apply the mock
      vi.doMock('better-sqlite3', createErrorMock);
      
      // Reset modules and re-import
      vi.resetModules();
      const dbModule = await import('../../src/db.js');
      const { insertResume: insert } = dbModule;
      
      // Expect function to throw error
      expect(() => insert(testResumeData)).toThrow('Insert error');
      
      // Clean up
      vi.doMock('better-sqlite3', () => originalMock);
    });
  });
});
