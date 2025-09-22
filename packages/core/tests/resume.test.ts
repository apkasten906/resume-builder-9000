test('should serialize ResumeData to Markdown if generator returns structured data', async () => {
  // Arrange
  const generatorReturnsData = {
    generateResume: vi.fn().mockResolvedValue(mockResumeData),
  };
  const resumeService = new ResumeService(generatorReturnsData);

  // Act
  const result = await resumeService.createResume(mockResumeData, mockJobDetails);

  // Assert
  expect(generatorReturnsData.generateResume).toHaveBeenCalledWith(mockResumeData, mockJobDetails);
  expect(result).toBe(resumeDataToMarkdown(mockResumeData));
});

test('should pass serialized Markdown to formatter if generator returns ResumeData', async () => {
  // Arrange
  const generatorReturnsData = {
    generateResume: vi.fn().mockResolvedValue(mockResumeData),
  };
  const formatter = {
    format: vi.fn().mockResolvedValue(Buffer.from('Formatted Resume Content')),
  };
  const resumeService = new ResumeService(generatorReturnsData, formatter);

  // Act
  const result = await resumeService.createResume(mockResumeData, mockJobDetails);

  // Assert
  expect(generatorReturnsData.generateResume).toHaveBeenCalledWith(mockResumeData, mockJobDetails);
  expect(formatter.format).toHaveBeenCalledWith(resumeDataToMarkdown(mockResumeData));
  expect(result).toEqual(Buffer.from('Formatted Resume Content'));
});
import { describe, test, expect, vi } from 'vitest';
import { ResumeService } from '../src/resume.js';
import { ResumeData, JobDetails, resumeDataToMarkdown } from '../src/index.js';

// Mock implementations for testing
const mockResumeData: ResumeData = {
  personalInfo: {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
  },
  experience: [
    {
      title: 'Software Engineer',
      company: 'Tech Corp',
      startDate: '2020-01-01',
      current: true,
      responsibilities: ['Developed features', 'Fixed bugs'],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science',
      institution: 'University',
      graduationDate: '2019-05-01',
    },
  ],
};

const mockJobDetails: JobDetails = {
  title: 'Senior Developer',
  description: 'Looking for an experienced developer',
};

// Mock generator and formatter
const mockGenerator = {
  generateResume: vi.fn().mockResolvedValue('Generated Resume Content'),
};

const mockFormatter = {
  format: vi.fn().mockResolvedValue(Buffer.from('Formatted Resume Content')),
};

describe('ResumeService', () => {
  test('should create a resume with generator only', async () => {
    // Arrange
    const resumeService = new ResumeService(mockGenerator);

    // Act
    const result = await resumeService.createResume(mockResumeData, mockJobDetails);

    // Assert
    expect(mockGenerator.generateResume).toHaveBeenCalledWith(mockResumeData, mockJobDetails);
    expect(result).toBe('Generated Resume Content');
  });

  test('should format a resume when formatter is provided', async () => {
    // Arrange
    const resumeService = new ResumeService(mockGenerator, mockFormatter);

    // Act
    const result = await resumeService.createResume(mockResumeData, mockJobDetails);

    // Assert
    expect(mockGenerator.generateResume).toHaveBeenCalledWith(mockResumeData, mockJobDetails);
    expect(mockFormatter.format).toHaveBeenCalledWith('Generated Resume Content');
    expect(result).toEqual(Buffer.from('Formatted Resume Content'));
  });
});
