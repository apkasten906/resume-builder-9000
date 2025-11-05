import type { Education } from '@rb9k/core';

/**
 * Parse a single raw education line into an Education-like shape.
 * This is intentionally forgiving and documented to handle common formats like:
 *  - "B.S. Computer Science - University Name"
 *  - "University Name, B.S. Computer Science"
 *  - "University Name - B.S. Computer Science, 2019"
 *
 * Returns a minimal Education-compatible object. Consumers should validate
 * further if they require strict formats.
 */
export function parseEducationString(raw: string): Partial<Education> {
  const candidate = raw.trim();
  if (!candidate) {
    return { degree: '', institution: '', graduationDate: '' };
  }

  // Try splitting on dash first (common delimiter between institution and degree)
  const dashParts = candidate.split(/\s[-–—]\s/);
  if (dashParts.length >= 2) {
    const institution = dashParts[0].trim();
    const rest = dashParts.slice(1).join(' - ').trim();
    // If rest contains a comma, treat trailing part as graduation date or extras
    const commaParts = rest.split(',').map(p => p.trim());
    const degree = commaParts[0] || '';
    const graduationDate = commaParts.slice(1).join(', ') || '';
    return {
      institution,
      degree,
      graduationDate,
    };
  }

  // Fallback: split on comma (institution, degree, date)
  if (candidate.includes(',')) {
    const parts = candidate.split(',').map(p => p.trim());
    const institution = parts[0] || '';
    const degree = parts.slice(1, 2).join(', ') || '';
    const graduationDate = parts.slice(2).join(', ') || '';
    return { institution, degree, graduationDate };
  }

  // If nothing else, place the whole string into institution and leave degree empty
  return { institution: candidate, degree: '', graduationDate: '' };
}
