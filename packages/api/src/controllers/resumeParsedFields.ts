import type { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { getResumeFromDb } from '../db.js';
import {
  upsertParsedResume,
  getParsedResumeByUser,
} from '../repositories/parsedResumeRepository.js';
import type { ParsedResumeUpsertInput } from '../types/parsedResume.js';
import { ParsedResumeUpsertSchema, ParsedPersonalInfoSchema } from '../types/parsedResume.js';
import type { AuthenticatedUser } from '../services/authService.js';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

const UpdatePayloadSchema = ParsedResumeUpsertSchema.extend({
  personalInfo: ParsedPersonalInfoSchema.optional(),
}).strict();

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

export async function getResumeParsedFields(req: Request, res: Response): Promise<void> {
  const authedRequest = req as AuthenticatedRequest;
  const uploadId = req.params.id;
  if (!uploadId) {
    res.status(400).json({ error: 'Missing upload id' });
    return;
  }

  logger.debug('Fetching parsed resume fields', { uploadId, userId: authedRequest.user.id });

  const existing = getParsedResumeByUser(authedRequest.user.id, uploadId);
  if (existing) {
    res.json(existing);
    return;
  }

  const resume = getResumeFromDb(uploadId);
  if (!resume) {
    res.status(404).json({ error: 'Parsed resume not found' });
    return;
  }

  const defaults = buildDefaultsFromResume(resume);
  const created = upsertParsedResume(authedRequest.user.id, uploadId, defaults);
  res.json(created);
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
  res.json(updated);
}
