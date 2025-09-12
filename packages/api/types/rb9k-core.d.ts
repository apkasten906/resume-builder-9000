declare module '@rb9k/core' {
  import { z } from 'zod';

  // Define the actual schema shapes based on the core package
  export interface PersonalInfo {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    website?: string;
    github?: string;
  }

  export interface Experience {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    responsibilities: string[];
    results?: string[];
    roleRelevance?: Record<string, number>;
  }

  export interface Education {
    degree: string;
    institution: string;
    location?: string;
    graduationDate: string;
    gpa?: string;
    highlights?: string[];
  }

  export interface Skill {
    name: string;
    level?: number;
    category?: string;
  }

  export interface ResumeData {
    personalInfo: PersonalInfo;
    summary?: string;
    experience: Experience[];
    education: Education[];
    skills?: Skill[];
    certifications?: string[];
    projects?: string[];
  }

  export interface JobDetails {
    title: string;
    company?: string;
    location?: string;
    description: string;
    requirements?: string[];
    url?: string;
  }

  // Export the schemas with proper typing
  export const PersonalInfoSchema: z.ZodType<PersonalInfo>;
  export const ExperienceSchema: z.ZodType<Experience>;
  export const EducationSchema: z.ZodType<Education>;
  export const SkillSchema: z.ZodType<Skill>;
  export const ResumeDataSchema: z.ZodType<ResumeData>;
  export const JobDetailsSchema: z.ZodType<JobDetails>;
}
