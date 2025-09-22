import { ResumeData, JobDetails, resumeDataToMarkdown } from './index.js';

export interface ResumeGenerator {
  /**
   * Generates a resume tailored to a specific job
   * @param resumeData The user's complete resume data
   * @param jobDetails The details of the job being applied for
   * @returns A tailored resume as a string (HTML/Markdown) or structured ResumeData for frontend rendering
   */
  generateResume(resumeData: ResumeData, jobDetails: JobDetails): Promise<string | ResumeData>;
}

export interface ResumeFormatter {
  /**
   * Formats a resume string into a specific output format
   * @param resumeContent The resume content as a string
   * @returns The formatted resume (e.g., PDF, DOCX, etc.)
   */
  format(resumeContent: string): Promise<Buffer>;
}

export class ResumeService {
  private readonly generator: ResumeGenerator;
  private readonly formatter?: ResumeFormatter;

  constructor(generator: ResumeGenerator, formatter?: ResumeFormatter) {
    this.generator = generator;
    this.formatter = formatter;
  }

  async createResume(resumeData: ResumeData, jobDetails: JobDetails): Promise<string | Buffer> {
    let resumeContent = await this.generator.generateResume(resumeData, jobDetails);
    // If structured data, serialize to Markdown for downstream formatting or return
    if (typeof resumeContent !== 'string') {
      resumeContent = resumeDataToMarkdown(resumeContent);
    }
    if (this.formatter) {
      return this.formatter.format(resumeContent);
    }
    return resumeContent;
  }
}
