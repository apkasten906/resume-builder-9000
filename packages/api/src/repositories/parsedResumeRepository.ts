import { randomUUID } from 'crypto';
import { connectDatabase } from '../db.js';
import type {
  ParsedResumeFields,
  ParsedResumeUpsertInput,
  ParsedPersonalInfo,
  ParsedExperience,
  ParsedEducation,
} from '../types/parsedResume.js';

interface ParsedResumeRow {
  id: string;
  user_id: string;
  upload_id: string | null;
  parsed_summary: string | null;
  personal_info: string | null;
  experience: string | null;
  skills: string | null;
  education: string | null;
  certifications: string | null;
  awards: string | null;
  hobbies: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_PERSONAL_INFO: ParsedPersonalInfo = {
  name: undefined,
  emails: [],
  phones: [],
  addresses: [],
  websites: [],
};

// Prefer structuredClone when available (Node 17+ / modern runtimes). Fallback to
// JSON-based deep clone which preserves basic JSON-safe data.
function clone<T>(value: T): T {
  // Prefer a type-safe check for structuredClone on globalThis when available.
  const sc =
    'structuredClone' in globalThis
      ? (globalThis as unknown as { structuredClone: (v: unknown) => unknown }).structuredClone
      : undefined;

  if (typeof sc === 'function') {
    return sc(value) as T;
  }

  // Fallback for older Node versions / runtimes (JSON-safe deep clone)
  return JSON.parse(JSON.stringify(value)) as T;
}

const EMPTY_EXPERIENCE: ParsedExperience[] = [];
const EMPTY_EDUCATION: ParsedEducation[] = [];
const EMPTY_STRINGS: string[] = [];

type ParsedResumeRecord = ParsedResumeFields;

function parseJsonField<T>(value: string | null, fallback: T): T {
  if (!value) {
    return clone(fallback);
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return clone(fallback);
  }
}

function serialize(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function mapRow(row: ParsedResumeRow): ParsedResumeRecord {
  return {
    id: row.id,
    userId: row.user_id,
    uploadId: row.upload_id,
    parsedSummary: row.parsed_summary ?? undefined,
    personalInfo: parseJsonField<ParsedPersonalInfo>(row.personal_info, DEFAULT_PERSONAL_INFO),
    experience: parseJsonField<ParsedExperience[]>(row.experience, EMPTY_EXPERIENCE),
    skills: parseJsonField<string[]>(row.skills, EMPTY_STRINGS),
    education: parseJsonField<ParsedEducation[]>(row.education, EMPTY_EDUCATION),
    certifications: parseJsonField<string[]>(row.certifications, EMPTY_STRINGS),
    awards: parseJsonField<string[]>(row.awards, EMPTY_STRINGS),
    hobbies: parseJsonField<string[]>(row.hobbies, EMPTY_STRINGS),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Build a simple param descriptor for uploadId. Avoid returning raw SQL fragments
// that get injected into queries; instead choose the correct prepared statement
// branch at the callsite so the query stays parameterized.
function buildQueryParams(uploadId: string | null): { isNull: boolean; args: readonly unknown[] } {
  if (uploadId === null) {
    return { isNull: true, args: [] };
  }
  return { isNull: false, args: [uploadId] };
}

export function getParsedResumeByUser(
  userId: string,
  uploadId: string | null
): ParsedResumeRecord | undefined {
  const db = connectDatabase();
  const { isNull, args } = buildQueryParams(uploadId);

  let row: ParsedResumeRow | undefined;
  if (isNull) {
    row = db
      .prepare(
        `SELECT * FROM profile_parsed_fields WHERE user_id = ? AND upload_id IS NULL LIMIT 1`
      )
      .get(userId) as ParsedResumeRow | undefined;
  } else {
    row = db
      .prepare(`SELECT * FROM profile_parsed_fields WHERE user_id = ? AND upload_id = ? LIMIT 1`)
      .get(userId, ...args) as ParsedResumeRow | undefined;
  }

  if (!row) {
    return undefined;
  }
  return mapRow(row);
}

export function upsertParsedResume(
  userId: string,
  uploadId: string | null,
  payload: ParsedResumeUpsertInput
): ParsedResumeRecord {
  const db = connectDatabase();
  const now = new Date().toISOString();
  const { isNull, args } = buildQueryParams(uploadId);
  let existing: ParsedResumeRow | undefined;
  if (isNull) {
    existing = db
      .prepare(
        `SELECT * FROM profile_parsed_fields WHERE user_id = ? AND upload_id IS NULL LIMIT 1`
      )
      .get(userId) as ParsedResumeRow | undefined;
  } else {
    existing = db
      .prepare(`SELECT * FROM profile_parsed_fields WHERE user_id = ? AND upload_id = ? LIMIT 1`)
      .get(userId, ...args) as ParsedResumeRow | undefined;
  }

  const personalInfo = payload.personalInfo ?? DEFAULT_PERSONAL_INFO;
  const experience = payload.experience ? clone(payload.experience) : clone(EMPTY_EXPERIENCE);
  const skills = payload.skills ? clone(payload.skills) : clone(EMPTY_STRINGS);
  const education = payload.education ? clone(payload.education) : clone(EMPTY_EDUCATION);
  const certifications = payload.certifications
    ? clone(payload.certifications)
    : clone(EMPTY_STRINGS);
  const awards = payload.awards ? clone(payload.awards) : clone(EMPTY_STRINGS);
  const hobbies = payload.hobbies ? clone(payload.hobbies) : clone(EMPTY_STRINGS);

  if (!existing) {
    const id = randomUUID();
    db.prepare(
      `INSERT INTO profile_parsed_fields (
        id,
        user_id,
        upload_id,
        parsed_summary,
        personal_info,
        experience,
        skills,
        education,
        certifications,
        awards,
        hobbies,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      userId,
      uploadId,
      payload.parsedSummary ?? null,
      serialize(personalInfo),
      serialize(experience),
      serialize(skills),
      serialize(education),
      serialize(certifications),
      serialize(awards),
      serialize(hobbies),
      now,
      now
    );

    return {
      id,
      userId,
      uploadId,
      parsedSummary: payload.parsedSummary,
      personalInfo,
      experience,
      skills,
      education,
      certifications,
      awards,
      hobbies,
      createdAt: now,
      updatedAt: now,
    };
  }

  db.prepare(
    `UPDATE profile_parsed_fields
     SET parsed_summary = ?,
         personal_info = ?,
         experience = ?,
         skills = ?,
         education = ?,
         certifications = ?,
         awards = ?,
         hobbies = ?,
         updated_at = ?
     WHERE id = ?`
  ).run(
    payload.parsedSummary ?? null,
    serialize(personalInfo),
    serialize(experience),
    serialize(skills),
    serialize(education),
    serialize(certifications),
    serialize(awards),
    serialize(hobbies),
    now,
    existing.id
  );

  return {
    id: existing.id,
    userId: existing.user_id,
    uploadId: existing.upload_id,
    parsedSummary: payload.parsedSummary ?? undefined,
    personalInfo,
    experience,
    skills,
    education,
    certifications,
    awards,
    hobbies,
    createdAt: existing.created_at,
    updatedAt: now,
  };
}
