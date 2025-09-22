//
import { ResumeData, JobDetails, ResumeGenerator } from '@rb9k/core';

export class DefaultResumeGenerator implements ResumeGenerator {
  async generateResume(
    resumeData: ResumeData,
    _jobDetails: JobDetails
  ): Promise<string | ResumeData> {
    await new Promise(resolve => setTimeout(resolve, 0)); // Simulate async operation
    // Return structured resume data for frontend rendering
    return resumeData;
  }
}
