import { ResumeData, JobDetails } from './index';
export interface ResumeGenerator {
    /**
     * Generates a resume tailored to a specific job
     * @param resumeData The user's complete resume data
     * @param jobDetails The details of the job being applied for
     * @returns A tailored resume as a string (likely in HTML or Markdown format)
     */
    generateResume(resumeData: ResumeData, jobDetails: JobDetails): Promise<string>;
}
export interface ResumeFormatter {
    /**
     * Formats a resume string into a specific output format
     * @param resumeContent The resume content as a string
     * @returns The formatted resume (e.g., PDF, DOCX, etc.)
     */
    format(resumeContent: string): Promise<Buffer>;
}
export declare class ResumeService {
    private readonly generator;
    private readonly formatter?;
    constructor(generator: ResumeGenerator, formatter?: ResumeFormatter);
    createResume(resumeData: ResumeData, jobDetails: JobDetails): Promise<string | Buffer>;
}
