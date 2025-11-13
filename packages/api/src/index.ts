// IMPORTANT: Load environment variables FIRST before any other imports
import './env.js';

import express from 'express';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';

import applicationsRoutes from './routes/applications.js';
import { parseJobDescription } from './controllers/jobDescription.js';
import { tailorBullets } from './controllers/tailor.js';
import { downloadResume } from './controllers/resumeDownload.js';
import { resumeRoutes, parseResumeHandler, postResumeHandler } from './controllers/resume.js';
import { connectDatabase } from './db.js';
import { logger, httpLogger, errorLogger } from './utils/logger.js';
import { openApiSpec } from './utils/openapi.js';
import cors from 'cors';
import authRoutes from './routes/auth.js';

// Environment variables are now loaded via env.ts import above

// Create Express app
const app = express();
const defaultPort = 4000;
const apiBase = process.env.API_BASE;
let port = Number(process.env.PORT || process.env.API_PORT);

if (!port || Number.isNaN(port)) {
  if (apiBase) {
    try {
      const parsed = new URL(apiBase);
      port = Number(parsed.port) || defaultPort;
    } catch {
      port = defaultPort;
    }
  } else {
    port = defaultPort;
  }
}

// Middleware
app.use(httpLogger); // HTTP request logging
// Configure CORS using env var so browser fetches with credentials are allowed
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true, // reflect request origin when not set
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Test-Secret'],
};
app.use(cors(corsOptions));
// Parse cookies on incoming requests so req.cookies is available
app.use(cookieParser());
// NOTE: We purposely avoid a static import of test-support here because
// ESM static imports are hoisted and would execute before dotenv.config()
// runs above, causing process.env values such as NODE_ENV to be undefined
// inside the test-support module. We'll dynamically import the module after
// environment variables have been loaded and evaluated.
app.use(express.json());
app.use('/auth', authRoutes);

// Mount new API routes (per ROUTES_WIRING.md)
app.use('/applications', applicationsRoutes);
app.post('/jobDescription/parse', parseJobDescription);
app.post('/tailor', tailorBullets);
app.post('/resume/download', downloadResume);

// Existing routes
app.get('/', (req, res) => res.redirect('/api/docs'));
app.use('/api/resumes', resumeRoutes);
app.post('/api/resumes/parse', parseResumeHandler, postResumeHandler);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/docs/openapi.json', (req, res) => res.json(openApiSpec));
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, { swaggerUrl: '/api/docs/openapi.json' })
);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check the health of the API
 *     description: Returns the status of the API and current timestamp
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   example: 2025-09-13T00:00:00.000Z
 */

// Mount test-support routes when running in test mode or when explicitly enabled.
// Use a dynamic import to ensure dotenv has already populated process.env.
const enableTestRoutes =
  process.env.NODE_ENV === 'test' || process.env.ENABLE_TEST_ROUTES === 'true';

async function mountOptionalRoutesAndStart() {
  if (enableTestRoutes) {
    // dynamic import so the module sees the environment variables loaded above
    // and so logs like NODE_ENV are accurate.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires -- dynamic import
      const module = await import('./routes/test-support.js');
      const testSupportRoutes = module.default;
      app.use('/', testSupportRoutes);
    } catch (err) {
      // If test routes fail to load, log but continue startup (non-fatal)
      console.warn('[index] Failed to load test-support routes:', err);
    }
  }

  // Error handling middleware (must be after routes)
  app.use(errorLogger);

  // Initialize database and start server
  try {
    connectDatabase();

    // Start server
    app.listen(port, () => {
      logger.info(`API server running on http://localhost:${port}`);
    });
  } catch (err) {
    logger.error('Failed to connect to database:', { error: err });
    process.exit(1);
  }
}

// Execute mounting and startup
mountOptionalRoutesAndStart();

export default app;
