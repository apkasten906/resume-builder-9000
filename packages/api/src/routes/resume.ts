import { Router, Request, Response } from 'express';
import { ResumeDataSchema, JobDetailsSchema } from '@rb9k/core';
import { generateResume, getResumeById, saveResume } from '../controllers/resume';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

const router = Router();

// Get a resume by ID
router.get('/:id', (req: Request, res: Response) => {
  getResumeById(req, res).catch((error: unknown) => {
    logger.error('Error fetching resume in route handler', {
      error: String(error),
      method: req.method,
      url: req.originalUrl,
      resumeId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to fetch resume' });
  });
});

// Define a type for the request body
interface ResumeRequestBody {
  resumeData: unknown;
  jobDetails: unknown;
}

// Generate a new resume
// Type guard for ZodError
function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

router.post('/', (req: Request<object, object, ResumeRequestBody>, res: Response) => {
  async function handleRequest(): Promise<void> {
    try {
      const { resumeData, jobDetails } = req.body;

      try {
        // Generate resume with validated data directly
        const result = await generateResume(
          // TypeScript will infer the correct types from the parse method
          ResumeDataSchema.parse(resumeData),
          JobDetailsSchema.parse(jobDetails)
        );

        // Save resume to database
        const savedResume = await saveResume(result);
        res.status(201).json(savedResume);
      } catch (validationError) {
        if (isZodError(validationError)) {
          logger.warn('Validation error in resume generation', {
            validationErrors: validationError.errors,
          });
          res.status(400).json({ error: 'Invalid input data', details: validationError.errors });
        } else {
          throw validationError; // Re-throw for the outer catch to handle
        }
      }
      // No code here - we already sent response in the try-catch block
    } catch (error: unknown) {
      logger.error('Error generating resume', {
        error: String(error),
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
