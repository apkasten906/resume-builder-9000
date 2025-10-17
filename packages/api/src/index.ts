import express from 'express';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';

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

// Load environment variables. Prefer the repository root .env when present so
// a developer can set ENABLE_TEST_ROUTES / TEST_ROUTE_SECRET at the repo level
// and have all workspace packages pick it up in development.
try {
  const repoRoot = path.resolve(__dirname, '../../..');
  const rootEnv = path.join(repoRoot, '.env');
  if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
  } else {
    dotenv.config();
  }
} catch (err) {
  // Fallback to default behavior
  dotenv.config();
}

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
app.use(cors());
import testSupportRoutes from './routes/test-support.js';
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
// These routes expose test helpers (e.g., clearing or reading the in-memory email outbox)
const enableTestRoutes =
  process.env.NODE_ENV === 'test' || process.env.ENABLE_TEST_ROUTES === 'true';
if (enableTestRoutes) {
  app.use('/', testSupportRoutes);
}

// Error handling middleware (must be after routes)
app.use(errorLogger);

// Initialize database
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

export default app;
