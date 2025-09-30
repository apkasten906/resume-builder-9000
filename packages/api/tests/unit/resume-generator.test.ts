import { describe, it, expect, vi } from 'vitest';
import { DefaultResumeGenerator } from '../../src/services/resume-generator.js';
import { ResumeData, JobDetails } from '@rb9k/core';

describe('DefaultResumeGenerator', () => {
  it('should return the resume data unchanged', async () => {
    // Arrange
    const generator = new DefaultResumeGenerator();
    const mockResumeData: ResumeData = {
      personalInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        location: 'San Francisco, CA',
      },
      experience: [
        {
          title: 'Software Developer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: '2023-01',
          responsibilities: [
            'Developed web applications',
            'Implemented new features',
            'Optimized performance',
          ],
        },
      ],
      education: [
        {
          institution: 'University of Technology',
          degree: 'Bachelor of Science in Computer Science',
          location: 'San Francisco, CA',
          graduationDate: '2020-05',
        },
      ],
      skills: [
        {
          name: 'JavaScript',
          level: 4,
          category: 'Programming',
        },
        {
          name: 'TypeScript',
          level: 3,
          category: 'Programming',
        },
        {
          name: 'React',
          level: 4,
          category: 'Frontend',
        },
      ],
    };

    const mockJobDetails: JobDetails = {
      title: 'Senior Developer',
      company: 'New Tech Inc',
      description: 'Looking for an experienced developer',
      requirements: ['5 years of experience', 'JavaScript expertise'],
    };

    // Act
    const result = await generator.generateResume(mockResumeData, mockJobDetails);

    // Assert
    expect(result).toEqual(mockResumeData);
  });

  it('should work with a minimal resume', async () => {
    // Arrange
    const generator = new DefaultResumeGenerator();
    const mockMinimalResume: ResumeData = {
      personalInfo: {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
      },
      experience: [],
      education: [],
    };

    const mockJobDetails: JobDetails = {
      title: 'Developer',
      company: 'Company',
      description: 'Job description',
      requirements: [],
    };

    // Act
    const result = await generator.generateResume(mockMinimalResume, mockJobDetails);

    // Assert
    expect(result).toEqual(mockMinimalResume);
  });

  it('should handle asynchronous processing', async () => {
    // Arrange
    const generator = new DefaultResumeGenerator();
    const mockResumeData: ResumeData = {
      personalInfo: {
        fullName: 'Test User',
        email: 'test@example.com',
      },
      skills: [{ name: 'Test', category: 'Testing', level: 3 }],
      experience: [],
      education: [],
    };

    const mockJobDetails: JobDetails = {
      title: 'Tester',
      company: 'Test Co',
      description: 'Testing job',
      requirements: ['Testing experience'],
    };

    // Spy on setTimeout to ensure it's called
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    // Act
    const resultPromise = generator.generateResume(mockResumeData, mockJobDetails);

    // Assert
    expect(setTimeoutSpy).toHaveBeenCalled();
    const result = await resultPromise;
    expect(result).toEqual(mockResumeData);
  });
});
