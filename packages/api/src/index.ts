import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { resumeRoutes } from './controllers/resume.js';
import { connectDatabase } from './db.js';
import { logger, httpLogger, errorLogger } from './utils/logger.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(httpLogger); // HTTP request logging
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/resumes', resumeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
