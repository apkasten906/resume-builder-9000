import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import {
  connectDatabase,
  closeDatabase,
  insertResume,
} from '../../src/db.js';
import {
  upsertParsedResume,
  getParsedResumeByUser,
  getParsedResumeHistoryByUser,
  restoreParsedResumeFromHistory,
} from '../../src/repositories/parsedResumeRepository.js';
import type { ParsedResumeUpsertInput } from '../../src/types/parsedResume.js';
import type { StoredResume } from '../../src/types/database.js';
import type { ResumeData, JobDetails } from '@rb9k/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORIGINAL_DB_PATH = process.env.DB_PATH;

function createTestPaths(): string {
  return path.join(__dirname, `parsed-resume-${Date.now()}.db`);
}

describe('parsed resume repository', () => {
  let TEST_DB_PATH: string;
  let userCounter = 0;

  beforeEach(() => {
    TEST_DB_PATH = createTestPaths();
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    const db = new Database(TEST_DB_PATH);
    db.close();
    process.env.DB_PATH = TEST_DB_PATH;
  });

  afterEach(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    if (ORIGINAL_DB_PATH) {
      process.env.DB_PATH = ORIGINAL_DB_PATH;
    } else {
      delete process.env.DB_PATH;
    }
  });

  function seedUserAndResume(): { userId: string; uploadId: string } {
    const db = connectDatabase();
    userCounter += 1;
    const userId = `user-${userCounter}`;
    const email = `user${userCounter}@example.com`;
    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, email_confirmed, created_at)
       VALUES (?, ?, 'hash', 'Test User', 1, datetime('now'))`
    ).run(userId, email);

    const resumeData: ResumeData = {
      personalInfo: {
        fullName: 'Test User',
        email,
      },
      summary: 'Summary content',
      experience: [
        {
          title: 'Engineer',
          company: 'Example Inc',
          startDate: '2024-01-01',
          responsibilities: ['Did things'],
          current: true,
        },
      ],
      education: [
        {
          degree: 'BS',
          institution: 'Example University',
          graduationDate: '2020-05-01',
        },
      ],
      skills: [],
      certifications: [],
      projects: [],
    };

    const jobDetails: JobDetails = {
      title: 'Role',
      description: 'Job description',
    };

    const resumeToInsert: Omit<StoredResume, 'id'> = {
      content: `resume-${userCounter}.pdf`,
      resumeData,
      jobDetails,
      createdAt: new Date().toISOString(),
    };

    const uploadId = insertResume(resumeToInsert);
    return { userId, uploadId };
  }

  it('creates a new parsed resume record when none exists', () => {
    const { userId, uploadId } = seedUserAndResume();

    const payload: ParsedResumeUpsertInput = {
      parsedSummary: 'New summary',
      personalInfo: {
        name: 'Test User',
        emails: ['user@example.com'],
        phones: ['+123456789'],
        addresses: ['123 Street'],
        websites: ['https://example.com'],
      },
      experience: [
        {
          id: 'exp-1',
          title: 'Engineer',
          company: 'Example Inc',
          startDate: '2024-01-01',
          description: 'Details',
        },
      ],
      skills: ['TypeScript'],
      education: [
        {
          id: 'edu-1',
          institution: 'Example University',
          degree: 'BS',
          graduationDate: '2020-05-01',
        },
      ],
      certifications: ['AWS'],
      awards: ['Employee of the Month'],
      hobbies: ['Reading'],
    };

    const created = upsertParsedResume(userId, uploadId, payload);
    expect(created.id).toBeDefined();
    expect(created.userId).toBe(userId);
    expect(created.uploadId).toBe(uploadId);
    expect(created.personalInfo.emails).toContain('user@example.com');

    const fetched = getParsedResumeByUser(userId, uploadId);
    expect(fetched).toBeDefined();
    expect(fetched?.parsedSummary).toBe('New summary');
    expect(fetched?.experience[0]?.title).toBe('Engineer');
  });

  it('updates an existing parsed resume record', () => {
    const { userId, uploadId } = seedUserAndResume();

    upsertParsedResume(userId, uploadId, {
      parsedSummary: 'Initial summary',
      personalInfo: {
        name: 'Test User',
        emails: ['user@example.com'],
        phones: [],
        addresses: [],
        websites: [],
      },
      experience: [],
      skills: [],
      education: [],
      certifications: [],
      awards: [],
      hobbies: [],
    });

    const updated = upsertParsedResume(userId, uploadId, {
      parsedSummary: 'Updated summary',
      skills: ['Node.js'],
    });

    expect(updated.parsedSummary).toBe('Updated summary');
    expect(updated.skills).toContain('Node.js');

    const fetched = getParsedResumeByUser(userId, uploadId);
    expect(fetched?.skills).toContain('Node.js');
  });

  it('records a history entry when updating an existing parsed resume', () => {
    const { userId, uploadId } = seedUserAndResume();

    upsertParsedResume(userId, uploadId, {
      parsedSummary: 'Initial summary',
      experience: [],
      skills: ['TypeScript'],
    });

    const historyBefore = getParsedResumeHistoryByUser(userId, uploadId);
    expect(historyBefore).toHaveLength(0);

    upsertParsedResume(userId, uploadId, {
      parsedSummary: 'Updated summary',
      skills: ['TypeScript', 'Node.js'],
    });

    const historyAfter = getParsedResumeHistoryByUser(userId, uploadId);
    expect(historyAfter).toHaveLength(1);
    expect(historyAfter[0]?.snapshot.parsedSummary).toBe('Initial summary');
    expect(historyAfter[0]?.snapshot.skills).toContain('TypeScript');
  });

  it('does not create duplicate history entries when saving identical data', () => {
    const { userId, uploadId } = seedUserAndResume();

    const payload = {
      parsedSummary: 'Initial summary',
      personalInfo: {
        name: 'Alex Candidate',
        emails: ['alex@example.com'],
        phones: ['555-0100'],
        addresses: ['123 Main St'],
        websites: ['https://example.com'],
      },
      experience: [
        {
          id: 'exp-1',
          title: 'Engineer',
          description: 'Built features.',
        },
      ],
      skills: ['TypeScript'],
      education: [],
      certifications: [],
      awards: [],
      hobbies: [],
    } as const;

    const initial = upsertParsedResume(userId, uploadId, payload);
    const historyBefore = getParsedResumeHistoryByUser(userId, uploadId);
    expect(historyBefore).toHaveLength(0);

    const unchanged = upsertParsedResume(userId, uploadId, payload);
    expect(unchanged.updatedAt).toBe(initial.updatedAt);

    const historyAfter = getParsedResumeHistoryByUser(userId, uploadId);
    expect(historyAfter).toHaveLength(0);

    const stored = getParsedResumeByUser(userId, uploadId);
    expect(stored?.updatedAt).toBe(initial.updatedAt);
  });

  it('restores parsed resume fields from a history snapshot', () => {
    const { userId, uploadId } = seedUserAndResume();

    upsertParsedResume(userId, uploadId, {
      parsedSummary: 'First summary',
      skills: ['TypeScript'],
    });

    upsertParsedResume(userId, uploadId, {
      parsedSummary: 'Second summary',
      skills: ['TypeScript', 'Node.js'],
    });

    const history = getParsedResumeHistoryByUser(userId, uploadId);
    expect(history).toHaveLength(1);

    const restored = restoreParsedResumeFromHistory(userId, uploadId, history[0]!.id);
    expect(restored).toBeDefined();
    expect(restored?.parsedSummary).toBe('First summary');
    expect(restored?.skills).toEqual(['TypeScript']);

    const persisted = getParsedResumeByUser(userId, uploadId);
    expect(persisted?.parsedSummary).toBe('First summary');
    expect(persisted?.skills).toEqual(['TypeScript']);

    const historyAfterRestore = getParsedResumeHistoryByUser(userId, uploadId);
    expect(historyAfterRestore).toHaveLength(2);
    expect(historyAfterRestore[0]?.snapshot.parsedSummary).toBe('Second summary');
  });

  it('returns undefined when history entry is missing or does not match the upload', () => {
    const { userId, uploadId } = seedUserAndResume();

    upsertParsedResume(userId, uploadId, {
      parsedSummary: 'Current summary',
    });

    const missing = restoreParsedResumeFromHistory(userId, uploadId, 'unknown-history');
    expect(missing).toBeUndefined();

    const otherUpload = seedUserAndResume();
    upsertParsedResume(otherUpload.userId, otherUpload.uploadId, {
      parsedSummary: 'Other summary',
      skills: ['Python'],
    });
    upsertParsedResume(otherUpload.userId, otherUpload.uploadId, {
      parsedSummary: 'Updated other summary',
      skills: ['Python', 'Rust'],
    });

    const otherHistory = getParsedResumeHistoryByUser(otherUpload.userId, otherUpload.uploadId);
    expect(otherHistory).toHaveLength(1);

    const mismatch = restoreParsedResumeFromHistory(userId, uploadId, otherHistory[0]!.id);
    expect(mismatch).toBeUndefined();
  });

  it('returns undefined when no record exists', () => {
    const { userId, uploadId } = seedUserAndResume();
    const result = getParsedResumeByUser(userId, uploadId);
    expect(result).toBeUndefined();
  });
});
