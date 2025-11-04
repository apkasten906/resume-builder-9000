import type { ResumeData, JobDetails } from '@rb9k/core';

export interface ParsedResumePersonalInfo {
  readonly name?: string;
  readonly emails: readonly string[];
  readonly phones: readonly string[];
  readonly addresses: readonly string[];
  readonly websites: readonly string[];
}

export interface ParsedResumeExperience {
  readonly id?: string;
  readonly title: string;
  readonly company?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly description?: string;
}

export interface ParsedResumeEducation {
  readonly id?: string;
  readonly institution: string;
  readonly degree: string;
  readonly graduationDate?: string;
  readonly fieldOfStudy?: string;
  readonly notes?: string;
}

export interface ParsedResumeFieldsPayload {
  readonly id: string;
  readonly userId: string;
  readonly uploadId: string | null;
  readonly parsedSummary?: string;
  readonly personalInfo: ParsedResumePersonalInfo;
  readonly experience: readonly ParsedResumeExperience[];
  readonly skills: readonly string[];
  readonly education: readonly ParsedResumeEducation[];
  readonly certifications: readonly string[];
  readonly awards: readonly string[];
  readonly hobbies: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ParsedResumeHistoryEntry {
  readonly id: string;
  readonly parsedResumeId: string;
  readonly userId: string;
  readonly uploadId: string | null;
  readonly snapshot: ParsedResumeFieldsPayload;
  readonly createdAt: string;
}

export interface ParsedResumeUpdateRequest {
  readonly parsedSummary?: string;
  readonly personalInfo?: ParsedResumePersonalInfo;
  readonly experience?: readonly ParsedResumeExperience[];
  readonly skills?: readonly string[];
  readonly education?: readonly ParsedResumeEducation[];
  readonly certifications?: readonly string[];
  readonly awards?: readonly string[];
  readonly hobbies?: readonly string[];
}

export interface ParsedResumeRestoreRequest {
  readonly uploadId: string;
  readonly historyId: string;
}

export interface StoredResumeResponse {
  readonly id: string;
  readonly content: string;
  readonly resumeData: ResumeData;
  readonly jobDetails: JobDetails;
  readonly createdAt: string;
}

export interface ResumeDetailsApiResponse {
  readonly parsedFields: ParsedResumeFieldsPayload;
  readonly history: readonly ParsedResumeHistoryEntry[];
  readonly resume: StoredResumeResponse | null;
  readonly resumeError?: unknown;
}
