import type { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { getResumeFromDb } from '../db.js';
import {
  upsertParsedResume,
  getParsedResumeByUser,
  getParsedResumeHistoryByUser,
  restoreParsedResumeFromHistory,
} from '../repositories/parsedResumeRepository.js';
import type {
  ParsedResumeFields,
  ParsedResumeUpsertInput,
  ParsedResumeHistoryEntry,
} from '../types/parsedResume.js';
import { ParsedResumeUpsertSchema, ParsedPersonalInfoSchema } from '../types/parsedResume.js';
import type { AuthenticatedUser } from '../services/authService.js';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

const UpdatePayloadSchema = ParsedResumeUpsertSchema.extend({
  personalInfo: ParsedPersonalInfoSchema.optional(),
}).strict();

interface ParsedFieldsResponse {
  parsedFields: ParsedResumeFields;
  history: ParsedResumeHistoryEntry[];
}

function buildDefaultsFromResume(
  resume: ReturnType<typeof getResumeFromDb>
): ParsedResumeUpsertInput {
  if (!resume) {
    return {};
  }

  const personalInfoDefaults = resume.resumeData.personalInfo;

  return {
    parsedSummary: resume.resumeData.summary,
    personalInfo: {
      name: personalInfoDefaults.fullName,
      emails: personalInfoDefaults.email ? [personalInfoDefaults.email] : [],
      phones: personalInfoDefaults.phone ? [personalInfoDefaults.phone] : [],
      addresses: personalInfoDefaults.location ? [personalInfoDefaults.location] : [],
      websites: [
        personalInfoDefaults.linkedIn,
        personalInfoDefaults.website,
        personalInfoDefaults.github,
      ].filter((value): value is string => !!value),
    },
    experience: resume.resumeData.experience.map((experience, index) => ({
      id: `${resume.id}-exp-${index}`,
      title: experience.title,
      company: experience.company,
      startDate: experience.startDate,
      endDate: experience.endDate,
      description: experience.responsibilities.join('\n'),
    })),
    skills: (resume.resumeData.skills || []).map(skill => skill.name),
    education: (resume.resumeData.education || []).map((education, index) => ({
      id: `${resume.id}-edu-${index}`,
      institution: education.institution,
      degree: education.degree,
      graduationDate: education.graduationDate,
      fieldOfStudy: education.fieldOfStudy,
      notes: education.highlights ? education.highlights.join('\n') : undefined,
    })),
    certifications: resume.resumeData.certifications || [],
    awards: [],
    hobbies: [],
  };
}

function respondWithParsedFields(res: Response, payload: ParsedFieldsResponse): void {
  res.json(payload);
}

export async function getResumeParsedFields(req: Request, res: Response): Promise<void> {
  const authedRequest = req as AuthenticatedRequest;
  const uploadId = req.params.id;
  if (!uploadId) {
    res.status(400).json({ error: 'Missing upload id' });
    return;
  }

  logger.debug('Fetching parsed resume fields', { uploadId, userId: authedRequest.user.id });

  const existing = getParsedResumeByUser(authedRequest.user.id, uploadId);
  const history = getParsedResumeHistoryByUser(authedRequest.user.id, uploadId);
  if (existing) {
    respondWithParsedFields(res, { parsedFields: existing, history });
    return;
  }

  const resume = getResumeFromDb(uploadId);
  if (!resume) {
    res.status(404).json({ error: 'Parsed resume not found' });
    return;
  }

  const defaults = buildDefaultsFromResume(resume);
  const created = upsertParsedResume(authedRequest.user.id, uploadId, defaults);
  respondWithParsedFields(res, { parsedFields: created, history: [] });
}

export async function updateResumeParsedFields(req: Request, res: Response): Promise<void> {
  const authedRequest = req as AuthenticatedRequest;
  const uploadId = req.params.id;
  if (!uploadId) {
    res.status(400).json({ error: 'Missing upload id' });
    return;
  }

  const parseResult = UpdatePayloadSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid payload', details: parseResult.error.flatten() });
    return;
  }

  const payload = parseResult.data;

  const updated = upsertParsedResume(authedRequest.user.id, uploadId, payload);
  const history = getParsedResumeHistoryByUser(authedRequest.user.id, uploadId);
  respondWithParsedFields(res, { parsedFields: updated, history });
}

export async function getResumeParsedFieldsHistory(req: Request, res: Response): Promise<void> {
  const authedRequest = req as AuthenticatedRequest;
  const uploadId = req.params.id;
  if (!uploadId) {
    res.status(400).json({ error: 'Missing upload id' });
    return;
  }

  const history = getParsedResumeHistoryByUser(authedRequest.user.id, uploadId);
  res.json({ history });
}

export async function restoreResumeParsedFields(req: Request, res: Response): Promise<void> {
  const authedRequest = req as AuthenticatedRequest;
  const uploadId = req.params.id;
  const historyId = req.params.historyId;
  if (!uploadId || !historyId) {
    res.status(400).json({ error: 'Missing identifiers' });
    return;
  }

  const restored = restoreParsedResumeFromHistory(authedRequest.user.id, uploadId, historyId);
  if (!restored) {
    res.status(404).json({ error: 'History entry not found' });
    return;
  }

  const history = getParsedResumeHistoryByUser(authedRequest.user.id, uploadId);
  respondWithParsedFields(res, { parsedFields: restored, history });
}
