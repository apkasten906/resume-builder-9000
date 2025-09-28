import { describe, it, expect } from 'vitest';
import {
  PersonalInfoSchema,
  ExperienceSchema,
  ResumeDataSchema,
  JobDetailsSchema,
  ResumeData,
  JobDetails,
} from '../src/index.js';

describe('Resume Schema Validation', () => {
  describe('PersonalInfoSchema', () => {
    it('should validate valid personal info', () => {
      const validInfo = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        location: 'New York, NY',
        linkedIn: 'https://linkedin.com/in/johndoe',
        website: 'https://johndoe.com',
        github: 'https://github.com/johndoe',
      };

      const result = PersonalInfoSchema.safeParse(validInfo);
      expect(result.success).toBe(true);
    });

    it('should require fullName and email', () => {
      const missingRequired = {
        phone: '+1234567890',
      };

      const result = PersonalInfoSchema.safeParse(missingRequired);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('fullName'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('email'))).toBe(true);
      }
    });

    it('should validate email format', () => {
      const invalidEmail = {
        fullName: 'John Doe',
        email: 'not-an-email',
      };

      const result = PersonalInfoSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('email'))).toBe(true);
      }
    });

    it('should validate URL formats', () => {
      const invalidUrls = {
        fullName: 'John Doe',
        email: 'john@example.com',
        linkedIn: 'not-a-url',
        website: 'also-not-a-url',
        github: 'github-but-not-url',
      };

      const result = PersonalInfoSchema.safeParse(invalidUrls);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('linkedIn'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('website'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('github'))).toBe(true);
      }
    });

    it('should accept empty URL fields', () => {
      const emptyUrls = {
        fullName: 'John Doe',
        email: 'john@example.com',
        linkedIn: '',
        website: '',
        github: '',
      };

      const result = PersonalInfoSchema.safeParse(emptyUrls);
      expect(result.success).toBe(true);
    });

    it('should accept undefined URL fields', () => {
      const undefinedUrls = {
        fullName: 'John Doe',
        email: 'john@example.com',
        // No URL fields defined
      };

      const result = PersonalInfoSchema.safeParse(undefinedUrls);
      expect(result.success).toBe(true);
    });
  });

  describe('ExperienceSchema', () => {
    it('should validate valid experience', () => {
      const validExperience = {
        title: 'Software Engineer',
        company: 'Tech Company',
        location: 'San Francisco, CA',
        startDate: '2020-01-01',
        endDate: '2022-12-31',
        current: false,
        responsibilities: ['Developed features', 'Fixed bugs'],
        results: ['Increased performance by 30%'],
        roleRelevance: { javascript: 0.9, react: 0.8 },
      };

      const result = ExperienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
    });

    it('should require title, company, startDate and responsibilities', () => {
      const missingRequired = {
        location: 'San Francisco, CA',
        endDate: '2022-12-31',
        current: false,
      };

      const result = ExperienceSchema.safeParse(missingRequired);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('title'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('company'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('startDate'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('responsibilities'))).toBe(
          true
        );
      }
    });
  });

  describe('ResumeDataSchema', () => {
    it('should validate a complete resume', () => {
      const validResume: ResumeData = {
        personalInfo: {
          fullName: 'John Doe',
          email: 'john@example.com',
          location: 'New York, NY',
        },
        summary: 'Experienced software developer with focus on web technologies.',
        experience: [
          {
            title: 'Senior Developer',
            company: 'Tech Co',
            startDate: '2020-01-01',
            endDate: '2022-12-31',
            current: false,
            responsibilities: ['Led development team', 'Implemented new features'],
            results: ['Increased team productivity by 20%'],
          },
        ],
        education: [
          {
            degree: 'B.S. Computer Science',
            institution: 'University of Technology',
            graduationDate: '2019-05-15',
          },
        ],
        skills: [
          { name: 'JavaScript', level: 5, category: 'Programming' },
          { name: 'React', level: 4, category: 'Framework' },
        ],
        certifications: ['AWS Certified Developer'],
        projects: ['E-commerce platform', 'Mobile app for fitness tracking'],
      };

      const result = ResumeDataSchema.safeParse(validResume);
      expect(result.success).toBe(true);
    });
  });

  describe('JobDetailsSchema', () => {
    it('should validate valid job details', () => {
      const validJob: JobDetails = {
        title: 'Frontend Developer',
        company: 'Web Solutions Inc.',
        location: 'Remote',
        description: 'Looking for an experienced frontend developer with React skills.',
        requirements: ['5+ years of experience', 'React proficiency', 'TypeScript knowledge'],
        url: 'https://example.com/jobs/frontend-dev',
      };

      const result = JobDetailsSchema.safeParse(validJob);
      expect(result.success).toBe(true);
    });

    it('should require title and description', () => {
      const missingRequired = {
        company: 'Web Solutions Inc.',
        location: 'Remote',
      };

      const result = JobDetailsSchema.safeParse(missingRequired);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('title'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('description'))).toBe(true);
      }
    });

    it('should validate URL format', () => {
      const invalidUrl = {
        title: 'Frontend Developer',
        description: 'Job description',
        url: 'not-a-url',
      };

      const result = JobDetailsSchema.safeParse(invalidUrl);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('url'))).toBe(true);
      }
    });

    it('should accept empty job URL field', () => {
      const emptyUrl = {
        title: 'Frontend Developer',
        description: 'Job description',
        url: '',
      };

      const result = JobDetailsSchema.safeParse(emptyUrl);
      expect(result.success).toBe(true);
    });

    it('should accept undefined job URL field', () => {
      const undefinedUrl = {
        title: 'Frontend Developer',
        description: 'Job description',
        // No URL field defined
      };

      const result = JobDetailsSchema.safeParse(undefinedUrl);
      expect(result.success).toBe(true);
    });
  });
});
