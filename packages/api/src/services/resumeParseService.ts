import type { Express } from 'express';
import { logger } from '../utils/logger.js';
import { parsePdfBuffer } from '../lib/pdf-parser.js';
// Import the DTO schema directly from the core package source to avoid
// runtime path-mapping issues in the test runner.
import ParsedRegionSchema from '../../../core/src/dtos/parsed-region.dto.js';

/**
 * Service: parse a resume file (PDF text-layer) and return validated regions.
 * Keeps parsing logic out of route handlers so routes remain thin.
 */
export async function parseResumeFile(file: Express.Multer.File, maxPages = 3) {
  if (!file || !file.buffer) {
    throw new Error('no file');
  }

  logger.debug('Parsing resume file', { fileName: file.originalname });

  const rawRegions = await parsePdfBuffer(file.buffer, maxPages);

  const regions = Array.isArray(rawRegions) ? rawRegions.map(r => ParsedRegionSchema.parse(r)) : [];

  return regions;
}

export default parseResumeFile;
