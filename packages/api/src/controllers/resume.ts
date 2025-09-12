import { Request, Response, Router } from 'express';
import { ResumeData, JobDetails } from '@rb9k/core';
import { ResumeService } from '@rb9k/core/dist/resume.js';
import { DefaultResumeGenerator } from '../services/resume-generator.js';
import { getResumeFromDb, insertResume } from '../db.js';
import { logger } from '../utils/logger.js';
// Express router for resume endpoints
const resumeRoutes = Router();

/**
 * @swagger
 * /api/resumes/{id}:
 *   get:
 *     summary: Get a resume by ID
 *     description: Retrieve a specific resume by its unique identifier
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier for the resume
 *     responses:
 *       200:
 *         description: Resume found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 content:
 *                   type: string
 *                 metadata:
 *                   type: object
 *       404:
 *         description: Resume not found
 *       500:
 *         description: Internal server error
 */
resumeRoutes.get('/:id', async (req, res) => {
  await getResumeById(req, res);
});

/**
 * @swagger
 * /api/resumes:
 *   post:
 *     summary: Create a new resume
 *     description: Generate a new resume based on user data and job details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resumeData:
 *                 type: object
 *                 description: User's resume data
 *               jobDetails:
 *                 type: object
 *                 description: Target job details
 *     responses:
 *       201:
 *         description: Resume created successfully
 *       500:
 *         description: Failed to create resume
 */
resumeRoutes.post('/', async (req, res) => {
  try {
    const { resumeData, jobDetails } = req.body;
    // Generate resume content
    const generated = await generateResume(resumeData, jobDetails);
    // Save resume
    const saved = await saveResume(generated);
    res.status(201).json(saved);
  } catch (error) {
    logger.error('Error creating resume', { error });
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

export { resumeRoutes };

export async function getResumeById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const resume = getResumeFromDb(id);

    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }
    res.json(resume);
    return;
  } catch (error) {
    logger.error('Error retrieving resume', { error, resumeId: req.params.id });
    res.status(500).json({ error: 'Failed to retrieve resume' });
  }
}

export async function generateResume(
  resumeData: ResumeData,
  jobDetails: JobDetails
): Promise<{
  content: string;
  resumeData: ResumeData;
  jobDetails: JobDetails;
  createdAt: string;
}> {
  // Create service with default generator
  const generator = new DefaultResumeGenerator();
  const resumeService = new ResumeService(generator);

  // Generate the resume content
  let resumeContent = await resumeService.createResume(resumeData, jobDetails);
  if (Buffer.isBuffer(resumeContent)) {
    resumeContent = resumeContent.toString('utf-8');
  }
  // Return the result
  return {
    content: resumeContent,
    resumeData,
    jobDetails,
    createdAt: new Date().toISOString(),
  };
}

export async function saveResume(resumeData: {
  content: string;
  resumeData: ResumeData;
  jobDetails: JobDetails;
  createdAt: string;
}): Promise<{
  id: string;
  content: string;
  resumeData: ResumeData;
  jobDetails: JobDetails;
  createdAt: string;
}> {
  // Save to database and return with ID
  const id = insertResume(resumeData);
  return { id, ...resumeData };
}
