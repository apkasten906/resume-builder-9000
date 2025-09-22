// Regular expression patterns for parsing resume content
// These patterns are extracted for better maintainability and testing

export const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

export const FULL_NAME_PATTERN = /([A-Z][a-z]+\s[A-Z][a-z]+)/;

export const SKILLS_PATTERN = /Skills:?\s*([\w\s,]+)/i;

export const PHONE_PATTERN = /(\+?\d{1,4}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;

export const EXPERIENCE_SECTION_PATTERN =
  /(Experience|Work Experience|Employment History):?\s*(.*?)(?=Education|Skills|$)/is;

export const EDUCATION_SECTION_PATTERN =
  /(Education|Academic Background):?\s*(.*?)(?=Experience|Skills|$)/is;
