import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { resumeRoutes, parseResumeHandler, postResumeHandler } from './controllers/resume.js';
import { connectDatabase } from './db.js';
import { logger, httpLogger, errorLogger } from './utils/logger.js';
import { openApiSpec } from './utils/openapi.js';
import cors from 'cors';
// Mount auth routes
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(httpLogger); // HTTP request logging
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

// Routes

// Redirect root to Swagger UI
app.get('/', (req, res) => res.redirect('/api/docs'));
app.use('/api/resumes', resumeRoutes);
// Only mount POST /api/resumes/parse for contract, not full router
app.post('/api/resumes/parse', parseResumeHandler, postResumeHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger documentation (using zod-openapi spec)
// Serve OpenAPI spec as JSON
app.get('/api/docs/openapi.json', (req, res) => res.json(openApiSpec));
// Configure Swagger UI to use the spec URL
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
