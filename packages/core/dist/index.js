"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobDetailsSchema = exports.ResumeDataSchema = exports.SkillSchema = exports.EducationSchema = exports.ExperienceSchema = exports.PersonalInfoSchema = void 0;
const zod_1 = require("zod");
// Resume related types
exports.PersonalInfoSchema = zod_1.z.object({
    fullName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    linkedIn: zod_1.z.string().url().optional(),
    website: zod_1.z.string().url().optional(),
    github: zod_1.z.string().url().optional(),
});
exports.ExperienceSchema = zod_1.z.object({
    title: zod_1.z.string(),
    company: zod_1.z.string(),
    location: zod_1.z.string().optional(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string().optional(),
    current: zod_1.z.boolean().default(false),
    responsibilities: zod_1.z.array(zod_1.z.string()),
    results: zod_1.z.array(zod_1.z.string()).optional(),
    roleRelevance: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
});
exports.EducationSchema = zod_1.z.object({
    degree: zod_1.z.string(),
    institution: zod_1.z.string(),
    location: zod_1.z.string().optional(),
    graduationDate: zod_1.z.string(),
    gpa: zod_1.z.string().optional(),
    highlights: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.SkillSchema = zod_1.z.object({
    name: zod_1.z.string(),
    level: zod_1.z.number().min(1).max(5).optional(),
    category: zod_1.z.string().optional(),
});
exports.ResumeDataSchema = zod_1.z.object({
    personalInfo: exports.PersonalInfoSchema,
    summary: zod_1.z.string().optional(),
    experience: zod_1.z.array(exports.ExperienceSchema),
    education: zod_1.z.array(exports.EducationSchema),
    skills: zod_1.z.array(exports.SkillSchema).optional(),
    certifications: zod_1.z.array(zod_1.z.string()).optional(),
    projects: zod_1.z.array(zod_1.z.string()).optional(),
});
// Job related types
exports.JobDetailsSchema = zod_1.z.object({
    title: zod_1.z.string(),
    company: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    description: zod_1.z.string(),
    requirements: zod_1.z.array(zod_1.z.string()).optional(),
    url: zod_1.z.string().url().optional(),
});
__exportStar(require("./resume"), exports);
