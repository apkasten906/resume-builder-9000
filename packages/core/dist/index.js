import { z } from 'zod';
// Resume related types
export const PersonalInfoSchema = z.object({
    fullName: z.string(),
    email: z.email(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedIn: z
        .string()
        .refine(val => {
        if (!val)
            return true;
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, { message: 'Invalid URL' })
        .optional(),
    website: z
        .string()
        .refine(val => {
        if (!val)
            return true;
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, { message: 'Invalid URL' })
        .optional(),
    github: z
        .string()
        .refine(val => {
        if (!val)
            return true;
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, { message: 'Invalid URL' })
        .optional(),
});
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
export const EducationSchema = z.object({
    degree: z.string(),
    institution: z.string(),
    location: z.string().optional(),
    graduationDate: z.string(),
    gpa: z.string().optional(),
    highlights: z.array(z.string()).optional(),
});
export const SkillSchema = z.object({
    name: z.string(),
    level: z.number().min(1).max(5).optional(),
    category: z.string().optional(),
});
export const ResumeDataSchema = z.object({
    personalInfo: PersonalInfoSchema,
    summary: z.string().optional(),
    experience: z.array(ExperienceSchema),
    education: z.array(EducationSchema),
    skills: z.array(SkillSchema).optional(),
    certifications: z.array(z.string()).optional(),
    projects: z.array(z.string()).optional(),
});
// Job related types
export const JobDetailsSchema = z.object({
    title: z.string(),
    company: z.string().optional(),
    location: z.string().optional(),
    description: z.string(),
    requirements: z.array(z.string()).optional(),
    url: z
        .string()
        .refine(val => {
        if (!val)
            return true;
        try {
            new URL(val);
            return true;
        }
        catch {
            return false;
        }
    }, { message: 'Invalid URL' })
        .optional(),
});
export * from './resume.js';
