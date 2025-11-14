const MONTHS = new Map(
  [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
    'jan',
    'feb',
    'mar',
    'apr',
    'jun',
    'jul',
    'aug',
    'sep',
    'sept',
    'oct',
    'nov',
    'dec',
    'januar',
  ].map((name, index) => [name, (index % 12) + 1] as const)
);

const PAGE_MARKER_REGEX = /^\d+\s+of\s+\d+$/i;
const EXPERIENCE_HEADER_REGEX = new RegExp(
  `^(?<title>.+?)\\s+[\\u2013-]\\s+(?<company>.+?)\\s+(?<start>${buildDatePattern()})(?:\\s+[\\u2013-]\\s+(?<end>${buildDatePattern()}|present|current|today))?`,
  'i'
);

interface ExtractedExperience {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface ExtractedEducation {
  institution: string;
  degree: string;
  graduationDate?: string;
}

interface ExtractedPersonalInfo {
  name?: string;
  emails: string[];
  phones: string[];
  addresses: string[];
  websites: string[];
}

export interface ResumeExtractionResult {
  summary?: string;
  experiences: ExtractedExperience[];
  skills: string[];
  education: ExtractedEducation[];
  personalInfo: ExtractedPersonalInfo;
}

function buildDatePattern(): string {
  const monthAlternatives = Array.from(MONTHS.keys()).join('|');
  return `(?:(?:${monthAlternatives})\\.?\\s+\\d{4}|\\d{4})`;
}

function normalizeDateInput(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.replace(/\./g, '').trim();
  if (!trimmed) return undefined;
  const lower = trimmed.toLowerCase();
  if (lower === 'present' || lower === 'current' || lower === 'today') {
    return 'Present';
  }
  const monthMatch = lower.match(/^(?<month>[a-z]+)\s+(?<year>\d{4})$/i);
  if (monthMatch) {
    const monthValue = MONTHS.get(monthMatch.groups?.month?.toLowerCase() ?? '');
    if (monthValue) {
      return `${monthMatch.groups?.year}-${String(monthValue).padStart(2, '0')}`;
    }
  }
  if (/^\d{4}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }
  return trimmed;
}

function sanitizeBlocks(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(block => block.length > 0 && !PAGE_MARKER_REGEX.test(block));
}

function extractSummary(blocks: readonly string[]): string | undefined {
  const languagesIndex = blocks.findIndex(block => /^languages?/i.test(block));
  if (languagesIndex !== -1 && blocks[languagesIndex + 1]) {
    const summaryCandidate = blocks[languagesIndex + 1];
    if (!/work experience/i.test(summaryCandidate)) {
      return summaryCandidate.replace(/\s+/g, ' ').trim();
    }
  }

  const fallback = blocks.find(block => {
    const lower = block.toLowerCase();
    if (lower.includes('work experience')) return false;
    if (lower.startsWith('knowledge')) return false;
    if (lower.startsWith('education')) return false;
    if (lower.startsWith('languages')) return false;
    if (lower.includes('@')) return false;
    return block.split(/\s+/).length >= 12;
  });

  return fallback?.replace(/\s+/g, ' ').trim();
}

function extractExperienceSections(lines: readonly string[]): ExtractedExperience[] {
  const experiences: ExtractedExperience[] = [];
  let current: { entry: ExtractedExperience; descriptionParts: string[] } | null = null;

  const stopSectionRegex = /^(education|knowledge)/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || PAGE_MARKER_REGEX.test(line)) continue;
    if (stopSectionRegex.test(line)) {
      if (current) {
        current.entry.description = current.descriptionParts.join('\n').trim() || undefined;
        experiences.push(current.entry);
        current = null;
      }
      break;
    }

    if (/^relevant work experience$/i.test(line) || /^core responsibilities$/i.test(line) || /^selected achievements$/i.test(line)) {
      continue;
    }

    const headerMatch = EXPERIENCE_HEADER_REGEX.exec(line);
    if (headerMatch?.groups) {
      if (current) {
        current.entry.description = current.descriptionParts.join('\n').trim() || undefined;
        experiences.push(current.entry);
      }
      current = {
        entry: {
          title: headerMatch.groups.title.trim(),
          company: headerMatch.groups.company.trim(),
          startDate: normalizeDateInput(headerMatch.groups.start),
          endDate: normalizeDateInput(headerMatch.groups.end),
        },
        descriptionParts: [],
      };
      continue;
    }

    if (current) {
      current.descriptionParts.push(line);
    }
  }

  if (current) {
    current.entry.description = current.descriptionParts.join('\n').trim() || undefined;
    experiences.push(current.entry);
  }

  return experiences;
}

function extractSkills(blocks: readonly string[]): string[] {
  const knowledgeBlock = blocks.find(block => /^knowledge/i.test(block));
  if (!knowledgeBlock) return [];

  const lines = knowledgeBlock.split('\n').map(line => line.trim()).filter(Boolean);
  const skills = new Set<string>();

  for (const line of lines) {
    if (/^knowledge/i.test(line)) continue;
    const colonIdx = line.indexOf(':');
    let data = '';
    if (colonIdx !== -1) {
      data = line.slice(colonIdx + 1);
    } else {
      const doubleSpaceMatch = line.match(/^[A-Za-z ]{3,}\s{2,}(.+)$/);
      data = doubleSpaceMatch ? doubleSpaceMatch[1] : line;
    }
    data
      .split(',')
      .map(token => token.trim())
      .filter(Boolean)
      .forEach(token => skills.add(token));
  }

  return Array.from(skills);
}

function extractEducation(blocks: readonly string[]): ExtractedEducation[] {
  const educationBlock = blocks.find(block => /^education/i.test(block));
  if (!educationBlock) return [];

  const lines = educationBlock.split('\n').map(line => line.trim()).filter(Boolean);
  const queue = lines.filter(line => !/^education/i.test(line));
  const entries: ExtractedEducation[] = [];

  for (let index = 0; index < queue.length; index += 2) {
    const degreeLine = queue[index];
    const institutionLine = queue[index + 1];
    if (!degreeLine && !institutionLine) continue;

    let institution = institutionLine || '';
    let graduationDate: string | undefined;
    if (institution) {
      const dateMatch = institution.match(/,?\s*(\d{4})$/);
      if (dateMatch) {
        graduationDate = dateMatch[1];
        institution = institution.replace(/,?\s*\d{4}$/, '').trim();
      }
    }

    entries.push({
      degree: degreeLine || institution || 'Education',
      institution: institution || degreeLine || 'Education',
      graduationDate,
    });
  }

  return entries;
}

const CONTACT_STOP_REGEX =
  /^(languages?|experienced|experience|summary|relevant work experience)/i;
const JOB_KEYWORDS = ['developer', 'engineer', 'manager', 'coach', 'consultant', 'lead', 'director'];

function looksLikeName(line: string): boolean {
  const tokens = line.trim().split(/\s+/);
  if (tokens.length < 2 || tokens.length > 3) {
    return false;
  }
  const lowerLine = line.toLowerCase();
  if (JOB_KEYWORDS.some(keyword => lowerLine.includes(keyword))) {
    return false;
  }
  // Allow ASCII apostrophes, Unicode left/right single quotes, or hyphens inside names
  return tokens.every(token => /^[A-Z][a-z'\u2019\u2018-]+$/.test(token));
}

function extractPersonalInfo(lines: readonly string[]): ExtractedPersonalInfo {
  const result: ExtractedPersonalInfo = {
    name: undefined,
    emails: [],
    phones: [],
    addresses: [],
    websites: [],
  };

  const stopIndex = lines.findIndex(line => CONTACT_STOP_REGEX.test(line));
  const headerLines = (stopIndex === -1 ? lines : lines.slice(0, stopIndex)).filter(Boolean);

  for (const line of headerLines) {
    const emailMatches = line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
    if (emailMatches) {
      for (const match of emailMatches) {
        if (!result.emails.includes(match)) {
          result.emails.push(match);
        }
      }
    }

    const phoneMatches = line.match(/(\+?\d[\d\s().\-]{6,})/g);
    if (phoneMatches) {
      for (const match of phoneMatches) {
        const cleaned = match.trim();
        if (cleaned && !result.phones.includes(cleaned)) {
          result.phones.push(cleaned);
        }
      }
    }

    const urlMatches = line.match(/https?:\/\/\S+|www\.\S+/gi);
    if (urlMatches) {
      for (const url of urlMatches) {
        if (!result.websites.includes(url)) {
          result.websites.push(url);
        }
      }
    }
  }

  const addressCandidates = headerLines.filter(line => {
    if (line.includes('@') || /https?:\/\//i.test(line) || /^www\./i.test(line)) {
      return false;
    }
    if (result.phones.some(phone => line.includes(phone))) {
      return false;
    }
    return /\d/.test(line) && /[A-Za-z]/.test(line);
  });
  for (const line of addressCandidates) {
    if (!result.addresses.includes(line)) {
      result.addresses.push(line);
    }
  }

  const nameCandidate = headerLines.find(line => looksLikeName(line));
  if (nameCandidate) {
    result.name = nameCandidate.trim();
  }

  return result;
}

export function extractResumeFieldsFromText(text: string): ResumeExtractionResult {
  const sanitizedBlocks = sanitizeBlocks(text);
  const rawLines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const summary = extractSummary(sanitizedBlocks);
  const experiences = extractExperienceSections(rawLines);
  const skills = extractSkills(sanitizedBlocks);
  const education = extractEducation(sanitizedBlocks);
  const personalInfo = extractPersonalInfo(rawLines);

  return {
    summary,
    experiences,
    skills,
    education,
    personalInfo,
  };
}
