// --- ResumeData serialization ---
/**
 * Converts ResumeData to a Markdown string for fallback rendering.
 * This is a minimal implementation; customize as needed for richer output.
 */
export function resumeDataToMarkdown(resume: ResumeData): string {
  const sections: string[] = [];
  if (resume.personalInfo) sections.push(renderPersonalInfo(resume.personalInfo));
  if (resume.summary) sections.push(renderSummary(resume.summary));
  if (resume.experience && resume.experience.length > 0)
    sections.push(renderExperience(resume.experience));
  if (resume.education && resume.education.length > 0)
    sections.push(renderEducation(resume.education));
  if (resume.skills && resume.skills.length > 0) sections.push(renderSkills(resume.skills));
  if (resume.certifications && resume.certifications.length > 0)
    sections.push(renderCertifications(resume.certifications));
  if (resume.projects && resume.projects.length > 0) sections.push(renderProjects(resume.projects));
  return sections.join('\n').trim();
}

function renderPersonalInfo(info: PersonalInfo): string {
  let md = `# ${info.fullName}\n`;
  if (info.email) md += `Email: ${info.email}\n`;
  if (info.location) md += `Location: ${info.location}\n`;
  if (info.linkedIn) md += `LinkedIn: ${info.linkedIn}\n`;
  if (info.website) md += `Website: ${info.website}\n`;
  if (info.github) md += `GitHub: ${info.github}\n`;
  return md + '\n';
}

function renderSummary(summary: string): string {
  return `## Summary\n${summary}\n`;
}

function renderExperience(experience: Experience[]): string {
  let md = '## Experience\n';
  for (const exp of experience) {
    md += `- **${exp.title}**, ${exp.company}`;
    if (exp.location) md += ` (${exp.location})`;
    if (exp.startDate) md += ` | ${exp.startDate}`;
    if (exp.endDate) md += ` - ${exp.endDate}`;
    md += '\n';
    if (exp.responsibilities && exp.responsibilities.length > 0) {
      for (const resp of exp.responsibilities) {
        md += `  - ${resp}\n`;
      }
    }
  }
  return md + '\n';
}

function renderEducation(education: Education[]): string {
  let md = '## Education\n';
  for (const edu of education) {
    md += `- **${edu.degree}**, ${edu.institution}`;
    if (edu.location) md += ` (${edu.location})`;
    if (edu.graduationDate) md += ` | ${edu.graduationDate}`;
    md += '\n';
  }
  return md + '\n';
}

function renderSkills(skills: Skill[]): string {
  return '## Skills\n' + skills.map(s => s.name).join(', ') + '\n';
}

function renderCertifications(certs: string[]): string {
  let md = '## Certifications\n';
  for (const cert of certs) {
    md += `- ${cert}\n`;
  }
  return md + '\n';
}

function renderProjects(projects: string[]): string {
  let md = '## Projects\n';
  for (const proj of projects) {
    md += `- ${proj}\n`;
  }
  return md + '\n';
}
import { z } from 'zod';

// Resume related types
export const PersonalInfoSchema = z.object({
  fullName: z.string(),
  email: z.email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedIn: z
    .string()
    .refine(
      val => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid URL' }
    )
    .optional(),
  website: z
    .string()
    .refine(
      val => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid URL' }
    )
    .optional(),
  github: z
    .string()
    .refine(
      val => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid URL' }
    )
    .optional(),
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

// Type aliases for array element types to reduce verbose type annotations

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
  url: z
    .string()
    .refine(
      val => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid URL' }
    )
    .optional(),
});

export type JobDetails = z.infer<typeof JobDetailsSchema>;

export * from './resume.js';
