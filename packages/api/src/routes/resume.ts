import { Router } from 'express';
import { ResumeDataSchema, JobDetailsSchema } from '@rb9k/core';
import { generateResume, getResumeById, saveResume } from '../controllers/resume';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

const router = Router();

// Get a resume by ID
router.get('/:id', (req, res) => {
  getResumeById(req, res).catch(error => {
    logger.error('Error fetching resume in route handler', {
      error,
      method: req.method,
      url: req.originalUrl,
      resumeId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to fetch resume' });
  });
});

// Generate a new resume
// Type guard for ZodError
function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

router.post('/', (req, res) => {
  async function handleRequest(): Promise<void> {
    try {
      const { resumeData, jobDetails } = req.body;

      // Validate input data
      const validResumeData = ResumeDataSchema.parse(resumeData);
      const validJobDetails = JobDetailsSchema.parse(jobDetails);

      // Generate resume
      const result = await generateResume(validResumeData, validJobDetails);

      // Save resume to database
      const savedResume = await saveResume(result);
      res.status(201).json(savedResume);
    } catch (error: unknown) {
      logger.error('Error generating resume', {
        error,
        method: req.method,
        url: req.originalUrl,
      });

      if (isZodError(error)) {
        logger.warn('Validation error in resume generation', {
          validationErrors: error.errors,
        });
        res.status(400).json({ error: 'Invalid input data', details: error.errors });
        return;
      }

      res.status(500).json({ error: 'Failed to generate resume' });
    }
  }

  void handleRequest();
});

export default router;
