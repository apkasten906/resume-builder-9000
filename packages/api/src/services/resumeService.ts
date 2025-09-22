import { Request, Response } from 'express';
import { getResumeFromDb, insertResume } from '../db.js';
import { logger } from '../utils/logger.js';
import { ResumeData, JobDetails } from '@rb9k/core';
import { StoredResume } from '../types/database.js';

export async function getResumeById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    logger.debug('Fetching resume from database', { resumeId: id });
    const resume = getResumeFromDb(id);
    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }
    res.json(resume);
  } catch (error) {
    logger.error('Error retrieving resume', { error, resumeId: req.params.id });
    res.status(500).json({ error: 'Failed to retrieve resume' });
  }
}
export function saveResume(
  resumeData: ResumeData,
  jobDetails: JobDetails,
  content: string,
  createdAt: string
): string {
  try {
    const resumeToInsert: Omit<StoredResume, 'id'> = {
      content,
      resumeData,
      jobDetails,
      createdAt,
    };
    const id = insertResume(resumeToInsert);
    return id;
  } catch (error) {
    logger.error('Error saving resume', { error });
    throw new Error('Failed to save resume');
  }
}
