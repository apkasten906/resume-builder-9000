import { randomUUID } from 'crypto';
import { connectDatabase } from '../db.js';
import { logger } from '../utils/logger.js';
import type {
  ParsedResumeFields,
  ParsedResumeUpsertInput,
  ParsedPersonalInfo,
  ParsedExperience,
  ParsedEducation,
  ParsedResumeHistoryEntry,
} from '../types/parsedResume.js';
import { ParsedResumeHistoryEntrySchema, ParsedResumeFieldsSchema } from '../types/parsedResume.js';

type SQLiteDatabase = ReturnType<typeof connectDatabase>;

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

interface ParsedResumeHistoryRow {
  id: string;
  parsed_resume_id: string;
  user_id: string;
  upload_id: string | null;
  snapshot: string;
  created_at: string;
}

const DEFAULT_PERSONAL_INFO: ParsedPersonalInfo = {
  name: undefined,
  emails: [],
  phones: [],
  addresses: [],
  websites: [],
};

// Parsed resume structures only contain JSON-serializable primitives/arrays,
// so JSON cloning is safe for copying their shape.
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const EMPTY_EXPERIENCE: ParsedExperience[] = [];
const EMPTY_EDUCATION: ParsedEducation[] = [];
const EMPTY_STRINGS: string[] = [];

function createEmptyParsedResume(): ParsedResumeFields {
  return {
    id: '',
    userId: '',
    uploadId: null,
    parsedSummary: undefined,
    personalInfo: clone(DEFAULT_PERSONAL_INFO),
    experience: clone(EMPTY_EXPERIENCE),
    skills: clone(EMPTY_STRINGS),
    education: clone(EMPTY_EDUCATION),
    certifications: clone(EMPTY_STRINGS),
    awards: clone(EMPTY_STRINGS),
    hobbies: clone(EMPTY_STRINGS),
    createdAt: '',
    updatedAt: '',
  };
}

type ParsedResumeRecord = ParsedResumeFields;

function toUpsertInput(snapshot: ParsedResumeRecord): ParsedResumeUpsertInput {
  return {
    parsedSummary: snapshot.parsedSummary ?? undefined,
    personalInfo: clone(snapshot.personalInfo),
    experience: clone(snapshot.experience),
    skills: clone(snapshot.skills),
    education: clone(snapshot.education),
    certifications: clone(snapshot.certifications),
    awards: clone(snapshot.awards),
    hobbies: clone(snapshot.hobbies),
  };
}

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

function parseSnapshot(snapshot: string): ParsedResumeFields {
  try {
    const parsed = JSON.parse(snapshot) as unknown;
    const validation = ParsedResumeFieldsSchema.safeParse(parsed);
    if (validation.success) {
      return validation.data;
    }
  } catch (error) {
    logger.error('Failed to parse resume snapshot', { error });
    logger.warn('Falling back to empty parsed resume snapshot due to parse failure', {
      snapshot: snapshot,
    });
    // Ignore parse errors and fall back to an empty structure
  }
  return createEmptyParsedResume();
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

function mapHistoryRow(row: ParsedResumeHistoryRow): ParsedResumeHistoryEntry {
  const candidate: ParsedResumeHistoryEntry = {
    id: row.id,
    parsedResumeId: row.parsed_resume_id,
    userId: row.user_id,
    uploadId: row.upload_id,
    snapshot: parseSnapshot(row.snapshot),
    createdAt: row.created_at,
  };
  return ParsedResumeHistoryEntrySchema.parse(candidate);
}

function toUndefined<T>(value: T | null | undefined): T | undefined {
  return value === null ? undefined : value;
}

function normalizePersonalInfo(info: ParsedPersonalInfo | null | undefined): ParsedPersonalInfo {
  const normalized = info ?? clone(DEFAULT_PERSONAL_INFO);
  return {
    name: toUndefined(normalized.name),
    emails: Array.isArray(normalized.emails) ? normalized.emails : clone(EMPTY_STRINGS),
    phones: Array.isArray(normalized.phones) ? normalized.phones : clone(EMPTY_STRINGS),
    addresses: Array.isArray(normalized.addresses) ? normalized.addresses : clone(EMPTY_STRINGS),
    websites: Array.isArray(normalized.websites) ? normalized.websites : clone(EMPTY_STRINGS),
  };
}

function ensureArray<T>(value: T[] | null | undefined, fallback: T[]): T[] {
  return Array.isArray(value) ? value : clone(fallback);
}

function normalizeRecordForFingerprint(record: ParsedResumeRecord) {
  return {
    parsedSummary: toUndefined(record.parsedSummary),
    personalInfo: normalizePersonalInfo(record.personalInfo),
    experience: ensureArray(record.experience, EMPTY_EXPERIENCE),
    skills: ensureArray(record.skills, EMPTY_STRINGS),
    education: ensureArray(record.education, EMPTY_EDUCATION),
    certifications: ensureArray(record.certifications, EMPTY_STRINGS),
    awards: ensureArray(record.awards, EMPTY_STRINGS),
    hobbies: ensureArray(record.hobbies, EMPTY_STRINGS),
  };
}

function fingerprintRecord(record: ParsedResumeRecord): string {
  return JSON.stringify(normalizeRecordForFingerprint(record));
}

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
  const query = isNull
    ? `SELECT * FROM profile_parsed_fields WHERE user_id = ? AND upload_id IS NULL LIMIT 1`
    : `SELECT * FROM profile_parsed_fields WHERE user_id = ? AND upload_id = ? LIMIT 1`;
  const row = db.prepare(query).get(userId, ...(isNull ? [] : args)) as ParsedResumeRow | undefined;
  if (!row) {
    return undefined;
  }
  return mapRow(row);
}

function recordHistory(db: SQLiteDatabase, existing: ParsedResumeRow): void {
  const historyId = randomUUID();
  const snapshot = serialize(mapRow(existing));
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO profile_parsed_fields_history (
        id,
        parsed_resume_id,
        user_id,
        upload_id,
        snapshot,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(historyId, existing.id, existing.user_id, existing.upload_id, snapshot, createdAt);
}

export function upsertParsedResume(
  userId: string,
  uploadId: string | null,
  payload: ParsedResumeUpsertInput
): ParsedResumeRecord {
  const db = connectDatabase();
  const now = new Date().toISOString();
  const { isNull, args } = buildQueryParams(uploadId);
  const selectExistingQuery = isNull
    ? `SELECT * FROM profile_parsed_fields WHERE user_id = ? AND upload_id IS NULL LIMIT 1`
    : `SELECT * FROM profile_parsed_fields WHERE user_id = ? AND upload_id = ? LIMIT 1`;
  const existing = db.prepare(selectExistingQuery).get(userId, ...(isNull ? [] : args)) as
    | ParsedResumeRow
    | undefined;

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

  const existingRecord = mapRow(existing);
  const nextRecord: ParsedResumeRecord = {
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

  const existingFingerprint = fingerprintRecord(existingRecord);
  const nextFingerprint = fingerprintRecord(nextRecord);

  if (existingFingerprint === nextFingerprint) {
    return existingRecord;
  }

  recordHistory(db, existing);

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

  return nextRecord;
}

export function getParsedResumeHistoryByUser(
  userId: string,
  uploadId: string | null
): ParsedResumeHistoryEntry[] {
  const db = connectDatabase();
  const { isNull, args } = buildQueryParams(uploadId);
  const historyQuery = isNull
    ? `SELECT *
       FROM profile_parsed_fields_history
       WHERE user_id = ? AND upload_id IS NULL
       ORDER BY datetime(created_at) DESC`
    : `SELECT *
       FROM profile_parsed_fields_history
       WHERE user_id = ? AND upload_id = ?
       ORDER BY datetime(created_at) DESC`;
  const rows = db
    .prepare(historyQuery)
    .all(userId, ...(isNull ? [] : args)) as ParsedResumeHistoryRow[];

  return rows.map(mapHistoryRow);
}

export function restoreParsedResumeFromHistory(
  userId: string,
  uploadId: string | null,
  historyId: string
): ParsedResumeRecord | undefined {
  const db = connectDatabase();
  const historyRow = db
    .prepare(
      `SELECT *
       FROM profile_parsed_fields_history
       WHERE id = ? AND user_id = ?
       LIMIT 1`
    )
    .get(historyId, userId) as ParsedResumeHistoryRow | undefined;

  if (!historyRow) {
    return undefined;
  }

  if (uploadId === null) {
    if (historyRow.upload_id !== null) {
      return undefined;
    }
  } else if (historyRow.upload_id !== uploadId) {
    return undefined;
  }

  const entry = mapHistoryRow(historyRow);
  const payload = toUpsertInput(entry.snapshot);
  return upsertParsedResume(userId, uploadId, payload);
}
