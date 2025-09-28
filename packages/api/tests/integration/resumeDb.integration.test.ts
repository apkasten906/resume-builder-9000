/**
 * Resume Database Integration Tests
 *
 * These tests verify the database operations for storing and retrieving resumes.
 * Each test runs with its own isolated test database to ensure test independence.
 * The database connection is established and closed for each test to prevent leaking state.
 */
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import {
  connectDatabase,
  getAllResumesFromDb,
  getResumeFromDb,
  insertResume,
  closeDatabase,
} from '../../src/db.js';
import { StoredResume } from '../../src/types/database.js';
import { ResumeData, JobDetails } from '@rb9k/core';
import { logger } from '../../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store original DB_PATH to restore after tests
const ORIGINAL_DB_PATH = process.env.DB_PATH;

describe('Resume Database Integration Tests', () => {
  // Generate a unique test database path for this test run to avoid conflicts
  const TEST_DB_PATH = path.join(__dirname, `test-resume-integration-${Date.now()}.db`);

  // Sample data for testing
  const mockResumeData: ResumeData = {
    personalInfo: {
      fullName: 'Integration Test User',
      email: 'integration@example.com',
    },
    experience: [
      {
        title: 'Software Developer',
        company: 'Tech Co',
        startDate: '2020-01-01',
        responsibilities: ['Coding', 'Testing'],
        current: true,
      },
    ],
    education: [
      {
        degree: 'Computer Science',
        institution: 'Test University',
        graduationDate: '2019-05-01',
      },
    ],
    summary: 'Integration test resume summary',
  };

  const mockJobDetails: JobDetails = {
    title: 'Integration Test Job',
    company: 'Test Company',
    description: 'Test job description for integration testing',
  };

  beforeAll(() => {
    // Save the original DB path for restoration later
    logger.info(`Original DB_PATH: ${ORIGINAL_DB_PATH || 'undefined'}`);
  });

  afterAll(() => {
    // Restore the original DB_PATH
    if (ORIGINAL_DB_PATH) {
      process.env.DB_PATH = ORIGINAL_DB_PATH;
    } else {
      delete process.env.DB_PATH;
    }
    logger.info('Restored original DB_PATH');
  });

  beforeEach(() => {
    // Create a fresh test database before each test
    try {
      // Close any existing database connection
      closeDatabase();

      // Delete the test database if it exists
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
        logger.debug(`Deleted existing test database at ${TEST_DB_PATH}`);
      }

      // Initialize the database with schema
      const db = new Database(TEST_DB_PATH);
      logger.debug(`Created fresh test database at ${TEST_DB_PATH}`);

      // Create resumes table
      db.exec(`
        CREATE TABLE IF NOT EXISTS resumes (
          id TEXT PRIMARY KEY,
          content TEXT NOT NULL,
          resume_data TEXT NOT NULL,
          job_details TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      db.close();

      // Set the test database path explicitly for our app
      process.env.DB_PATH = TEST_DB_PATH;
      logger.info(`Set DB_PATH for test: ${process.env.DB_PATH}`);

      // Create a fresh connection to the test database
      connectDatabase();
    } catch (error) {
      logger.error('Error setting up test database:', { error });
      throw error;
    }
  });

  afterEach(() => {
    // Close the database connection
    closeDatabase();

    // Clean up after each test
    try {
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
        logger.debug(`Cleaned up test database at ${TEST_DB_PATH}`);
      }
    } catch (error) {
      logger.error('Error cleaning up test database:', { error });
    }

    // Reset environment variable
    delete process.env.DB_PATH;
  });

  it('should insert and retrieve a resume', () => {
    // Arrange
    const resumeToInsert: Omit<StoredResume, 'id'> = {
      content: 'Test resume content',
      resumeData: mockResumeData,
      jobDetails: mockJobDetails,
      createdAt: new Date().toISOString(),
    };

    // Act
    const id = insertResume(resumeToInsert);
    const retrievedResume = getResumeFromDb(id);

    // Assert
    expect(id).toBeDefined();
    expect(retrievedResume).toBeDefined();
    expect(retrievedResume?.id).toBe(id);
    expect(retrievedResume?.content).toBe('Test resume content');
    expect(retrievedResume?.resumeData).toEqual(mockResumeData);
    expect(retrievedResume?.jobDetails).toEqual(mockJobDetails);
  });

  it('should return null when trying to get a non-existent resume', () => {
    // Act
    const nonExistentResume = getResumeFromDb('non-existent-id');

    // Assert
    expect(nonExistentResume).toBeNull();
  });

  it('should get all resumes in reverse chronological order', () => {
    // Arrange - Insert multiple resumes with different timestamps
    const olderResume: Omit<StoredResume, 'id'> = {
      content: 'Older resume content',
      resumeData: mockResumeData,
      jobDetails: mockJobDetails,
      createdAt: '2023-01-01T00:00:00.000Z',
    };

    const newerResume: Omit<StoredResume, 'id'> = {
      content: 'Newer resume content',
      resumeData: mockResumeData,
      jobDetails: mockJobDetails,
      createdAt: '2023-02-01T00:00:00.000Z',
    };

    const olderId = insertResume(olderResume);
    const newerId = insertResume(newerResume);

    // Act
    const allResumes = getAllResumesFromDb();

    // Assert
    expect(allResumes.length).toBe(2);
    // Check that newer resume comes first (reverse chronological order)
    expect(allResumes[0].id).toBe(newerId);
    expect(allResumes[1].id).toBe(olderId);
    expect(allResumes[0].createdAt).toBe('2023-02-01T00:00:00.000Z');
    expect(allResumes[1].createdAt).toBe('2023-01-01T00:00:00.000Z');
  });

  it('should handle empty resume list', () => {
    // Act - Get resumes from empty database
    const emptyList = getAllResumesFromDb();

    // Assert
    expect(emptyList).toEqual([]);
  });
});
