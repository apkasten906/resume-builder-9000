import { z } from 'zod';

export const ParsedPersonalInfoSchema = z.object({
  name: z.string().optional(),
  emails: z.array(z.string()).default([]),
  phones: z.array(z.string()).default([]),
  addresses: z.array(z.string()).default([]),
  websites: z.array(z.string()).default([]),
});

export type ParsedPersonalInfo = z.infer<typeof ParsedPersonalInfoSchema>;

export const ParsedExperienceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  company: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export type ParsedExperience = z.infer<typeof ParsedExperienceSchema>;

export const ParsedEducationSchema = z.object({
  id: z.string().optional(),
  institution: z.string(),
  degree: z.string(),
  graduationDate: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  notes: z.string().optional(),
});

export type ParsedEducation = z.infer<typeof ParsedEducationSchema>;

export const ParsedResumeFieldsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  uploadId: z.string().nullable(),
  parsedSummary: z.string().optional(),
  personalInfo: ParsedPersonalInfoSchema.default({
    emails: [],
    phones: [],
    addresses: [],
    websites: [],
  }),
  experience: z.array(ParsedExperienceSchema).default([]),
  skills: z.array(z.string()).default([]),
  education: z.array(ParsedEducationSchema).default([]),
  certifications: z.array(z.string()).default([]),
  awards: z.array(z.string()).default([]),
  hobbies: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ParsedResumeFields = z.infer<typeof ParsedResumeFieldsSchema>;

export const ParsedResumeUpsertSchema = ParsedResumeFieldsSchema.pick({
  parsedSummary: true,
  personalInfo: true,
  experience: true,
  skills: true,
  education: true,
  certifications: true,
  awards: true,
  hobbies: true,
}).partial();

export type ParsedResumeUpsertInput = z.infer<typeof ParsedResumeUpsertSchema>;
