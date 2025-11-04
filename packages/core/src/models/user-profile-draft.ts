export type Experience = {
  title?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type Education = {
  degree?: string;
  institution?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type UserProfileDraft = {
  userId: string;
  personalInfo?: { name?: string; email?: string; phone?: string; location?: string };
  experiences?: Experience[];
  education?: Education[];
  skills?: string[];
  sourceResumeId?: string | null;
};

// Removed default export to keep type-only module
