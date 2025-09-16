import { ResumeData, JobDetails } from '@rb9k/core';

export interface StoredResume {
  id: string;
  content: string;
  resumeData: ResumeData;
  jobDetails: JobDetails;
  createdAt: string;
}

export interface DatabaseRow {
  id: string;
  content: string;
  resume_data: string;
  job_details: string;
  created_at: string;
}
