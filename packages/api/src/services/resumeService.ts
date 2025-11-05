import { Request, Response } from 'express';
import { getResumeFromDb, insertResume } from '../db.js';
import { logger } from '../utils/logger.js';
import { ResumeData, JobDetails } from '@rb9k/core';
import { StoredResume } from '../types/database.js';

/**
 * Service: fetch a resume by ID from the DB and return it (or null).
 * Keeps DB access and business logic out of controllers so controllers
 * remain thin and handle HTTP concerns.
 */
export async function fetchResumeById(id: string): Promise<StoredResume | null> {
  try {
    logger.debug('Fetching resume from database', { resumeId: id });
    const resume = getResumeFromDb(id);
    return resume ?? null;
  } catch (error) {
    logger.error('Error retrieving resume', { error, resumeId: id });
    throw error;
  }
}

// Compatibility wrapper: older code/tests call getResumeById(req,res).
// Keep a thin shim here to avoid breaking existing tests while keeping
// the primary service API (`fetchResumeById`) free of HTTP concerns.
export async function getResumeById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const resume = await fetchResumeById(id);
    if (!resume) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }
    res.json(resume);
  } catch (error) {
    logger.error('Error in legacy getResumeById shim', { error, resumeId: req.params.id });
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
