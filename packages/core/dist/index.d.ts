import { z } from 'zod';
export declare const PersonalInfoSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodEmail;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    linkedIn: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    github: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export declare const ExperienceSchema: z.ZodObject<{
    title: z.ZodString;
    company: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    current: z.ZodDefault<z.ZodBoolean>;
    responsibilities: z.ZodArray<z.ZodString>;
    results: z.ZodOptional<z.ZodArray<z.ZodString>>;
    roleRelevance: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, z.core.$strip>;
export type Experience = z.infer<typeof ExperienceSchema>;
export declare const EducationSchema: z.ZodObject<{
    degree: z.ZodString;
    institution: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    graduationDate: z.ZodString;
    gpa: z.ZodOptional<z.ZodString>;
    highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type Education = z.infer<typeof EducationSchema>;
export declare const SkillSchema: z.ZodObject<{
    name: z.ZodString;
    level: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Skill = z.infer<typeof SkillSchema>;
export declare const ResumeDataSchema: z.ZodObject<{
    personalInfo: z.ZodObject<{
        fullName: z.ZodString;
        email: z.ZodEmail;
        phone: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        linkedIn: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        github: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    summary: z.ZodOptional<z.ZodString>;
    experience: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        company: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        current: z.ZodDefault<z.ZodBoolean>;
        responsibilities: z.ZodArray<z.ZodString>;
        results: z.ZodOptional<z.ZodArray<z.ZodString>>;
        roleRelevance: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, z.core.$strip>>;
    education: z.ZodArray<z.ZodObject<{
        degree: z.ZodString;
        institution: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        graduationDate: z.ZodString;
        gpa: z.ZodOptional<z.ZodString>;
        highlights: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
    skills: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        level: z.ZodOptional<z.ZodNumber>;
        category: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    certifications: z.ZodOptional<z.ZodArray<z.ZodString>>;
    projects: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export declare const JobDetailsSchema: z.ZodObject<{
    title: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    requirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
    url: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type JobDetails = z.infer<typeof JobDetailsSchema>;
export * from './resume.js';
