import request from 'supertest';
import express from 'express';
import resumeRouter from '../../src/routes/resume.js';
import { connectDatabase, closeDatabase } from '../../src/db.js';

describe('POST /api/resumes/save', () => {
  let app: express.Express;

  beforeAll(() => {
    // Use in-memory DB for tests
    process.env.DB_PATH = ':memory:';
    connectDatabase();
    app = express();
    app.use(express.json());

    // Simple test auth middleware: attach a fake user
    app.use((req, _res, next) => {
      (req as any).user = { id: 'test-user-1', email: 'test@example.com' };
      next();
    });

    app.use('/api/resumes', resumeRouter);
  });

  afterAll(() => {
    closeDatabase();
  });

  test('rejects when consent missing', async () => {
    const res = await request(app).post('/api/resumes/save').send({ regions: [] });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('saves draft when consent provided', async () => {
    const res = await request(app).post('/api/resumes/save').send({ consent: true, regions: [] });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('savedId');
    expect(typeof res.body.savedId).toBe('string');
  });
});
