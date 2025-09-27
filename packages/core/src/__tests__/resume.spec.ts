import { describe, it, expect, vi } from 'vitest';
import { ResumeService, ResumeGenerator, ResumeFormatter } from '../resume.js';
import { ResumeData, JobDetails } from '../index.js';

// Mock implementation of ResumeGenerator
class MockResumeGenerator implements ResumeGenerator {
  generateResume = vi.fn().mockImplementation(async (resumeData: ResumeData, jobDetails: JobDetails): Promise<string> => {
    return '<html><body>Mocked Resume</body></html>';
  });
}

// Mock implementation that returns structured data
class MockStructuredDataGenerator implements ResumeGenerator {
  generateResume = vi.fn().mockImplementation(async (resumeData: ResumeData, jobDetails: JobDetails): Promise<ResumeData> => {
    return resumeData; // Just returns the same data
  });
}

// Mock implementation of ResumeFormatter
class MockResumeFormatter implements ResumeFormatter {
  format = vi.fn().mockImplementation(async (resumeContent: string): Promise<Buffer> => {
    return Buffer.from(resumeContent);
  });
}

describe('ResumeService', () => {
  // Sample test data
  const sampleResumeData: ResumeData = {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@example.com',
    },
    experience: [
      {
        title: 'Developer',
        company: 'Tech Co',
        startDate: '2020-01-01',
        responsibilities: ['Coding', 'Testing'],
        current: true,
      },
    ],
    education: [
      {
        degree: 'Computer Science',
        institution: 'University',
        graduationDate: '2019-05-15',
      },
    ],
  };

  const sampleJobDetails: JobDetails = {
    title: 'Senior Developer',
    description: 'Looking for experienced developer',
  };

  it('should create a resume string when formatter is not provided', async () => {
    // Arrange
    const generator = new MockResumeGenerator();
    const service = new ResumeService(generator);

    // Act
    const result = await service.createResume(sampleResumeData, sampleJobDetails);

    // Assert
    expect(result).toBe('<html><body>Mocked Resume</body></html>');
    expect(generator.generateResume).toHaveBeenCalledWith(sampleResumeData, sampleJobDetails);
  });

  it('should format the resume when formatter is provided', async () => {
    // Arrange
    const generator = new MockResumeGenerator();
    const formatter = new MockResumeFormatter();
    const service = new ResumeService(generator, formatter);

    // Act
    const result = await service.createResume(sampleResumeData, sampleJobDetails);

    // Assert
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(formatter.format).toHaveBeenCalledWith('<html><body>Mocked Resume</body></html>');
  });

  it('should throw error when generator returns structured data', async () => {
    // Arrange
    const generator = new MockStructuredDataGenerator();
    const service = new ResumeService(generator);

    // Act & Assert
    await expect(service.createResume(sampleResumeData, sampleJobDetails)).rejects.toThrow(
      'ResumeService expects generator to return a string. Received structured data.'
    );
  });
});