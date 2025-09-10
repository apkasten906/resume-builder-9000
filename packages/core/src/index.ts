import { z } from 'zod';

// Resume related types
export const PersonalInfoSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedIn: z.string().url().optional(),
  website: z.string().url().optional(),
  github: z.string().url().optional(),
});

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;

export const ExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  responsibilities: z.array(z.string()),
  results: z.array(z.string()).optional(),
  roleRelevance: z.record(z.string(), z.number()).optional(),
});

export type Experience = z.infer<typeof ExperienceSchema>;

export const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string().optional(),
  graduationDate: z.string(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export type Education = z.infer<typeof EducationSchema>;

export const SkillSchema = z.object({
  name: z.string(),
  level: z.number().min(1).max(5).optional(),
  category: z.string().optional(),
});

export type Skill = z.infer<typeof SkillSchema>;

export const ResumeDataSchema = z.object({
  personalInfo: PersonalInfoSchema,
  summary: z.string().optional(),
  experience: z.array(ExperienceSchema),
  education: z.array(EducationSchema),
  skills: z.array(SkillSchema).optional(),
  certifications: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;

// Job related types
export const JobDetailsSchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  location: z.string().optional(),
  description: z.string(),
  requirements: z.array(z.string()).optional(),
  url: z.string().url().optional(),
});

export type JobDetails = z.infer<typeof JobDetailsSchema>;

export * from './resume';
