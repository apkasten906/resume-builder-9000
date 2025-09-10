import { z } from 'zod';
export declare const PersonalInfoSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    linkedIn: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    github: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    phone?: string | undefined;
    location?: string | undefined;
    linkedIn?: string | undefined;
    website?: string | undefined;
    github?: string | undefined;
}, {
    fullName: string;
    email: string;
    phone?: string | undefined;
    location?: string | undefined;
    linkedIn?: string | undefined;
    website?: string | undefined;
    github?: string | undefined;
}>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export declare const ExperienceSchema: z.ZodObject<{
    title: z.ZodString;
    company: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodString;
    endDate: z.ZodOptional<z.ZodString>;
    current: z.ZodDefault<z.ZodBoolean>;
    responsibilities: z.ZodArray<z.ZodString, "many">;
    results: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    roleRelevance: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    company: string;
    startDate: string;
    current: boolean;
    responsibilities: string[];
    location?: string | undefined;
    endDate?: string | undefined;
    results?: string[] | undefined;
    roleRelevance?: Record<string, number> | undefined;
}, {
    title: string;
    company: string;
    startDate: string;
    responsibilities: string[];
    location?: string | undefined;
    endDate?: string | undefined;
    current?: boolean | undefined;
    results?: string[] | undefined;
    roleRelevance?: Record<string, number> | undefined;
}>;
export type Experience = z.infer<typeof ExperienceSchema>;
export declare const EducationSchema: z.ZodObject<{
    degree: z.ZodString;
    institution: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    graduationDate: z.ZodString;
    gpa: z.ZodOptional<z.ZodString>;
    highlights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    degree: string;
    institution: string;
    graduationDate: string;
    location?: string | undefined;
    gpa?: string | undefined;
    highlights?: string[] | undefined;
}, {
    degree: string;
    institution: string;
    graduationDate: string;
    location?: string | undefined;
    gpa?: string | undefined;
    highlights?: string[] | undefined;
}>;
export type Education = z.infer<typeof EducationSchema>;
export declare const SkillSchema: z.ZodObject<{
    name: z.ZodString;
    level: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    level?: number | undefined;
    category?: string | undefined;
}, {
    name: string;
    level?: number | undefined;
    category?: string | undefined;
}>;
export type Skill = z.infer<typeof SkillSchema>;
export declare const ResumeDataSchema: z.ZodObject<{
    personalInfo: z.ZodObject<{
        fullName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        linkedIn: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        github: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fullName: string;
        email: string;
        phone?: string | undefined;
        location?: string | undefined;
        linkedIn?: string | undefined;
        website?: string | undefined;
        github?: string | undefined;
    }, {
        fullName: string;
        email: string;
        phone?: string | undefined;
        location?: string | undefined;
        linkedIn?: string | undefined;
        website?: string | undefined;
        github?: string | undefined;
    }>;
    summary: z.ZodOptional<z.ZodString>;
    experience: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        company: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        startDate: z.ZodString;
        endDate: z.ZodOptional<z.ZodString>;
        current: z.ZodDefault<z.ZodBoolean>;
        responsibilities: z.ZodArray<z.ZodString, "many">;
        results: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        roleRelevance: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        company: string;
        startDate: string;
        current: boolean;
        responsibilities: string[];
        location?: string | undefined;
        endDate?: string | undefined;
        results?: string[] | undefined;
        roleRelevance?: Record<string, number> | undefined;
    }, {
        title: string;
        company: string;
        startDate: string;
        responsibilities: string[];
        location?: string | undefined;
        endDate?: string | undefined;
        current?: boolean | undefined;
        results?: string[] | undefined;
        roleRelevance?: Record<string, number> | undefined;
    }>, "many">;
    education: z.ZodArray<z.ZodObject<{
        degree: z.ZodString;
        institution: z.ZodString;
        location: z.ZodOptional<z.ZodString>;
        graduationDate: z.ZodString;
        gpa: z.ZodOptional<z.ZodString>;
        highlights: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        degree: string;
        institution: string;
        graduationDate: string;
        location?: string | undefined;
        gpa?: string | undefined;
        highlights?: string[] | undefined;
    }, {
        degree: string;
        institution: string;
        graduationDate: string;
        location?: string | undefined;
        gpa?: string | undefined;
        highlights?: string[] | undefined;
    }>, "many">;
    skills: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        level: z.ZodOptional<z.ZodNumber>;
        category: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        level?: number | undefined;
        category?: string | undefined;
    }, {
        name: string;
        level?: number | undefined;
        category?: string | undefined;
    }>, "many">>;
    certifications: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    projects: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    personalInfo: {
        fullName: string;
        email: string;
        phone?: string | undefined;
        location?: string | undefined;
        linkedIn?: string | undefined;
        website?: string | undefined;
        github?: string | undefined;
    };
    experience: {
        title: string;
        company: string;
        startDate: string;
        current: boolean;
        responsibilities: string[];
        location?: string | undefined;
        endDate?: string | undefined;
        results?: string[] | undefined;
        roleRelevance?: Record<string, number> | undefined;
    }[];
    education: {
        degree: string;
        institution: string;
        graduationDate: string;
        location?: string | undefined;
        gpa?: string | undefined;
        highlights?: string[] | undefined;
    }[];
    summary?: string | undefined;
    skills?: {
        name: string;
        level?: number | undefined;
        category?: string | undefined;
    }[] | undefined;
    certifications?: string[] | undefined;
    projects?: string[] | undefined;
}, {
    personalInfo: {
        fullName: string;
        email: string;
        phone?: string | undefined;
        location?: string | undefined;
        linkedIn?: string | undefined;
        website?: string | undefined;
        github?: string | undefined;
    };
    experience: {
        title: string;
        company: string;
        startDate: string;
        responsibilities: string[];
        location?: string | undefined;
        endDate?: string | undefined;
        current?: boolean | undefined;
        results?: string[] | undefined;
        roleRelevance?: Record<string, number> | undefined;
    }[];
    education: {
        degree: string;
        institution: string;
        graduationDate: string;
        location?: string | undefined;
        gpa?: string | undefined;
        highlights?: string[] | undefined;
    }[];
    summary?: string | undefined;
    skills?: {
        name: string;
        level?: number | undefined;
        category?: string | undefined;
    }[] | undefined;
    certifications?: string[] | undefined;
    projects?: string[] | undefined;
}>;
export type ResumeData = z.infer<typeof ResumeDataSchema>;
export declare const JobDetailsSchema: z.ZodObject<{
    title: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    requirements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    location?: string | undefined;
    company?: string | undefined;
    requirements?: string[] | undefined;
    url?: string | undefined;
}, {
    title: string;
    description: string;
    location?: string | undefined;
    company?: string | undefined;
    requirements?: string[] | undefined;
    url?: string | undefined;
}>;
export type JobDetails = z.infer<typeof JobDetailsSchema>;
export * from './resume';
