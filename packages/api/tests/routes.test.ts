import { describe, test, expect, vi, beforeAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { default as app } from '../src/index.js';
import { disableTestLogging, enableTestLogging } from './utils/test-logger.js';
import { authService } from '../src/services/authService.js';
import {
  getParsedResumeByUser,
  getParsedResumeHistoryByUser,
  restoreParsedResumeFromHistory,
} from '../src/repositories/parsedResumeRepository.js';

// Disable verbose logging for all tests by default
beforeAll(() => {
  disableTestLogging();
});

// Mock the database connection
vi.mock('../src/db', () => ({
  connectDatabase: vi.fn(() => ({})),
  getResumeFromDb: vi.fn(id => {
    if (id === 'test-resume-id') {
      return {
        id: 'test-resume-id',
        content: 'Test resume content',
        resumeData: { name: 'John Doe' },
        jobDetails: { title: 'Developer' },
        createdAt: '2025-09-10T12:00:00.000Z',
      };
    }
    return null;
  }),
  insertResume: vi.fn(resumeData => 'test-resume-id'),
}));

vi.mock('../src/repositories/parsedResumeRepository', () => ({
  upsertParsedResume: vi.fn((userId, uploadId, payload) => ({
    id: 'parsed-id',
    userId,
    uploadId,
    parsedSummary: payload.parsedSummary,
    personalInfo: payload.personalInfo ?? {
      name: undefined,
      emails: [],
      phones: [],
      addresses: [],
      websites: [],
    },
    experience: payload.experience ?? [],
    skills: payload.skills ?? [],
    education: payload.education ?? [],
    certifications: payload.certifications ?? [],
    awards: payload.awards ?? [],
    hobbies: payload.hobbies ?? [],
    createdAt: '2025-10-23T00:00:00.000Z',
    updatedAt: '2025-10-23T00:00:00.000Z',
  })),
  getParsedResumeByUser: vi.fn(),
  getParsedResumeHistoryByUser: vi.fn(() => []),
  restoreParsedResumeFromHistory: vi.fn(() => undefined),
}));

vi.mock('../src/services/authService', () => ({
  authService: {
    getUserFromRequest: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(authService);
const mockedGetParsedResumeByUser = vi.mocked(getParsedResumeByUser);
const mockedGetParsedResumeHistoryByUser = vi.mocked(getParsedResumeHistoryByUser);
const mockedRestoreParsedResumeFromHistory = vi.mocked(restoreParsedResumeFromHistory);

// Mock the resume generator service
vi.mock('../src/services/resume-generator', () => ({
  DefaultResumeGenerator: class {
    generateResume(): Promise<string> {
      return Promise.resolve('Generated resume content');
    }
  },
}));

// Mock the logger to prevent console output during tests
vi.mock('../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
  httpLogger: vi.fn((req, res, next) => next()),
  errorLogger: vi.fn((err, req, res, next) => next()),
  enableVerboseLogging: vi.fn(),
  disableVerboseLogging: vi.fn(),
}));

describe('API Routes', () => {
  beforeEach(() => {
    mockedAuthService.getUserFromRequest.mockReset();
    mockedGetParsedResumeByUser.mockReset();
    mockedGetParsedResumeHistoryByUser.mockReset();
    mockedRestoreParsedResumeFromHistory.mockReset();
  });

  // Test health check endpoint
  test('GET /api/health should return status 200', async () => {
    const response = await supertest(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  // Example of a test with verbose logging enabled
  test('GET /api/health with verbose logging', async () => {
    // Enable verbose logging for just this test
    enableTestLogging();
    try {
      const response = await supertest(app).get('/api/health');
      expect(response.status).toBe(200);
    } finally {
      disableTestLogging();
    }
  });

  // Test getting a resume by ID
  test('GET /api/resumes/:id should return the resume when found', async () => {
    const response = await supertest(app).get('/api/resumes/test-resume-id');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 'test-resume-id');
    expect(response.body).toHaveProperty('content', 'Test resume content');
  });

  test('GET /api/resumes/:id should return 404 when resume not found', async () => {
    const response = await supertest(app).get('/api/resumes/non-existent-id');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Resume not found');
  });

  // Basic test for resume creation
  test('POST /api/resumes should create a resume', async () => {
    const resumeData = {
      personalInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
      },
      experience: [
        {
          title: 'Developer',
          company: 'Tech Co',
          startDate: '2020-01',
          current: true,
          responsibilities: ['Coding'],
        },
      ],
      education: [
        {
          degree: 'BS',
          institution: 'University',
          graduationDate: '2019',
        },
      ],
    };

    const jobDetails = {
      title: 'Senior Developer',
      description: 'Experienced developer needed',
    };

    const response = await supertest(app).post('/api/resumes').send({ resumeData, jobDetails });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 'test-resume-id');
  });

  test('GET /api/resumes/:id/parsed-fields requires authentication', async () => {
    mockedAuthService.getUserFromRequest.mockResolvedValueOnce(null);

    const response = await supertest(app).get('/api/resumes/test-resume-id/parsed-fields');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Unauthorized');
  });

  test('GET /api/resumes/:id/parsed-fields returns parsed data when authenticated', async () => {
    mockedAuthService.getUserFromRequest.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
    });

    const parsedRecord = {
      id: 'parsed-id',
      userId: 'user-1',
      uploadId: 'test-resume-id',
      parsedSummary: 'Summary',
      personalInfo: {
        name: 'User',
        emails: ['user@example.com'],
        phones: [],
        addresses: [],
        websites: [],
      },
      experience: [],
      skills: [],
      education: [],
      certifications: [],
      awards: [],
      hobbies: [],
      createdAt: '2025-10-23T00:00:00.000Z',
      updatedAt: '2025-10-23T00:00:00.000Z',
    };

    mockedGetParsedResumeByUser.mockReturnValueOnce(parsedRecord);
    mockedGetParsedResumeHistoryByUser.mockReturnValueOnce([
      {
        id: 'history-1',
        parsedResumeId: parsedRecord.id,
        userId: parsedRecord.userId,
        uploadId: parsedRecord.uploadId,
        snapshot: parsedRecord,
        createdAt: '2025-10-23T00:00:00.000Z',
      },
    ]);

    const response = await supertest(app).get('/api/resumes/test-resume-id/parsed-fields');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('parsedFields');
    expect(response.body.parsedFields).toHaveProperty('parsedSummary', 'Summary');
    expect(response.body.history).toHaveLength(1);
  });

  test('GET /api/resumes/:id/parsed-fields/history requires authentication', async () => {
    mockedAuthService.getUserFromRequest.mockResolvedValueOnce(null);

    const response = await supertest(app).get('/api/resumes/test-resume-id/parsed-fields/history');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Unauthorized');
  });

  test('GET /api/resumes/:id/parsed-fields/history returns change history when authenticated', async () => {
    mockedAuthService.getUserFromRequest.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
    });

    const snapshot = {
      id: 'parsed-id',
      userId: 'user-1',
      uploadId: 'test-resume-id',
      parsedSummary: 'Earlier summary',
      personalInfo: {
        name: 'User',
        emails: ['user@example.com'],
        phones: [],
        addresses: [],
        websites: [],
      },
      experience: [],
      skills: [],
      education: [],
      certifications: [],
      awards: [],
      hobbies: [],
      createdAt: '2025-10-22T00:00:00.000Z',
      updatedAt: '2025-10-22T00:00:00.000Z',
    };

    mockedGetParsedResumeHistoryByUser.mockReturnValueOnce([
      {
        id: 'history-2',
        parsedResumeId: snapshot.id,
        userId: snapshot.userId,
        uploadId: snapshot.uploadId,
        snapshot,
        createdAt: '2025-10-23T00:00:00.000Z',
      },
    ]);

    const response = await supertest(app).get('/api/resumes/test-resume-id/parsed-fields/history');

    expect(response.status).toBe(200);
    expect(response.body.history).toHaveLength(1);
    expect(response.body.history[0]).toHaveProperty('snapshot.parsedSummary', 'Earlier summary');
  });

  test('POST /api/resumes/:id/parsed-fields/history/:historyId/restore requires authentication', async () => {
    mockedAuthService.getUserFromRequest.mockResolvedValueOnce(null);

    const response = await supertest(app).post(
      '/api/resumes/test-resume-id/parsed-fields/history/history-1/restore'
    );

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Unauthorized');
  });

  test('POST /api/resumes/:id/parsed-fields/history/:historyId/restore returns 404 when entry missing', async () => {
    mockedAuthService.getUserFromRequest.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
    });

    mockedRestoreParsedResumeFromHistory.mockReturnValueOnce(undefined);

    const response = await supertest(app)
      .post('/api/resumes/test-resume-id/parsed-fields/history/history-1/restore')
      .set('Authorization', 'Bearer token');

    expect(mockedRestoreParsedResumeFromHistory).toHaveBeenCalledWith(
      'user-1',
      'test-resume-id',
      'history-1'
    );
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'History entry not found');
  });

  test('POST /api/resumes/:id/parsed-fields/history/:historyId/restore restores data when authenticated', async () => {
    mockedAuthService.getUserFromRequest.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
    });

    const restoredRecord = {
      id: 'parsed-id',
      userId: 'user-1',
      uploadId: 'test-resume-id',
      parsedSummary: 'Restored summary',
      personalInfo: {
        name: 'User',
        emails: ['user@example.com'],
        phones: [],
        addresses: [],
        websites: [],
      },
      experience: [],
      skills: ['TypeScript'],
      education: [],
      certifications: [],
      awards: [],
      hobbies: [],
      createdAt: '2025-10-23T00:00:00.000Z',
      updatedAt: '2025-10-24T00:00:00.000Z',
    };

    mockedRestoreParsedResumeFromHistory.mockReturnValueOnce(restoredRecord);
    mockedGetParsedResumeHistoryByUser.mockReturnValueOnce([
      {
        id: 'history-2',
        parsedResumeId: 'parsed-id',
        userId: 'user-1',
        uploadId: 'test-resume-id',
        snapshot: restoredRecord,
        createdAt: '2025-10-24T00:00:00.000Z',
      },
    ]);

    const response = await supertest(app)
      .post('/api/resumes/test-resume-id/parsed-fields/history/history-1/restore')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.parsedFields).toHaveProperty('parsedSummary', 'Restored summary');
    expect(response.body.history).toHaveLength(1);
  });
});
