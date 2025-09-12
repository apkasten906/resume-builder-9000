import { describe, test, expect, vi } from 'vitest';
import supertest from 'supertest';
import { default as app } from '../src/index.js';

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
}));

describe('API Routes', () => {
  // Test health check endpoint
  test('GET /api/health should return status 200', async () => {
    const response = await supertest(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
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
});
