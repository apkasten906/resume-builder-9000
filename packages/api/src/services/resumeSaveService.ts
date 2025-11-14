import { insertResume } from '../db.js';
import type { ParsedRegion } from '@rb9k/core/src/dtos/parsed-region.dto.js';
import { logger } from '../utils/logger.js';

/**
 * Persist parsed regions as a lightweight resume draft for the user.
 * This stores the parsed regions JSON into the existing `resumes` table as
 * the `resume_data` payload. The shape is intentionally minimal to avoid
 * requiring a full ResumeData object for early drafts.
 */
export async function saveParsedRegions(
  userId: string,
  regions: ParsedRegion[],
  sourceResumeId: string | null
): Promise<string> {
  try {
    const createdAt = new Date().toISOString();

    const content = `Parsed resume draft for user ${userId}`;

    const resumeData = {
      userId,
      sourceResumeId: sourceResumeId ?? null,
      parsedRegions: regions,
    } as unknown; // stored as JSON blob

    const jobDetails = {} as unknown;

    // Insert using `as any` to avoid strict ResumeData/JobDetails typing for early draft storage.
    const id = insertResume({
      content,
      resumeData: resumeData as any,
      jobDetails: jobDetails as any,
      createdAt,
    });

    logger.info('Saved resume draft', { resumeId: id, userId });
    return id;
  } catch (err) {
    logger.error('Error saving parsed regions', { error: err, userId });
    throw err;
  }
}

export default { saveParsedRegions };
