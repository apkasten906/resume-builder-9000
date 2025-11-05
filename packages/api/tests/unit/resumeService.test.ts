import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { fetchResumeById, saveResume } from '../../src/services/resumeService.js';
import * as db from '../../src/db.js';
import { ResumeData, JobDetails } from '@rb9k/core';

// Mock the db module
vi.mock('../../src/db.js', () => ({
  getResumeFromDb: vi.fn(),
  insertResume: vi.fn(),
}));

// Mock the logger to avoid noise in tests
vi.mock('../../src/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('resumeService', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      params: { id: 'test-id' },
    };

    mockRes = {
      json: jsonMock,
      status: statusMock,
    };

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchResumeById', () => {
    it('should return a resume when found', async () => {
      // Arrange
      const mockResume = {
        id: 'test-id',
        content: 'test content',
        resumeData: {
          personalInfo: { fullName: 'Test User', email: 'test@example.com' },
          experience: [],
          education: [],
        } as ResumeData,
        jobDetails: { title: 'Test Job', description: 'Test Description' } as JobDetails,
        createdAt: '2023-01-01T00:00:00Z',
      };

      vi.mocked(db.getResumeFromDb).mockReturnValue(mockResume);

      // Act
      const result = await fetchResumeById('test-id');

      // Assert
      expect(db.getResumeFromDb).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(mockResume);
    });

    it('should return null when resume is not found', async () => {
      // Arrange
      vi.mocked(db.getResumeFromDb).mockReturnValue(null);

      // Act
      const result = await fetchResumeById('test-id');

      // Assert
      expect(db.getResumeFromDb).toHaveBeenCalledWith('test-id');
      expect(result).toBeNull();
    });

    it('should throw when the DB access fails', async () => {
      // Arrange
      const error = new Error('Test error');
      vi.mocked(db.getResumeFromDb).mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      await expect(fetchResumeById('test-id')).rejects.toThrow(error);
    });
  });

  describe('saveResume', () => {
    it('should save a resume and return its ID', () => {
      // Arrange
      const mockResumeData = {
        personalInfo: {
          fullName: 'Test User',
          email: 'test@example.com',
        },
        experience: [],
        education: [],
      } as ResumeData;

      const mockJobDetails = {
        title: 'Test Job',
        description: 'Test Description',
      } as JobDetails;

      const mockContent = 'Generated resume content';
      const mockCreatedAt = '2023-01-01T00:00:00Z';
      const mockId = 'generated-id';

      vi.mocked(db.insertResume).mockReturnValue(mockId);

      // Act
      const result = saveResume(mockResumeData, mockJobDetails, mockContent, mockCreatedAt);

      // Assert
      expect(db.insertResume).toHaveBeenCalledWith({
        content: mockContent,
        resumeData: mockResumeData,
        jobDetails: mockJobDetails,
        createdAt: mockCreatedAt,
      });
      expect(result).toBe(mockId);
    });

    it('should throw an error when saving fails', () => {
      // Arrange
      const mockResumeData = {
        personalInfo: {
          fullName: 'Test User',
          email: 'test@example.com',
        },
        experience: [],
        education: [],
      } as ResumeData;

      const mockJobDetails = {
        title: 'Test Job',
        description: 'Test Description',
      } as JobDetails;

      const mockContent = 'Generated resume content';
      const mockCreatedAt = '2023-01-01T00:00:00Z';

      vi.mocked(db.insertResume).mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act & Assert
      expect(() => {
        saveResume(mockResumeData, mockJobDetails, mockContent, mockCreatedAt);
      }).toThrow('Failed to save resume');
    });
  });
});
