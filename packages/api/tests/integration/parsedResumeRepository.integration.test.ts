import { beforeEach, afterEach, describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { connectDatabase, closeDatabase, insertResume } from '../../src/db.js';
import {
  upsertParsedResume,
  getParsedResumeByUser,
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
    const userId = 'user-123';
    db.prepare(
      `INSERT INTO users (id, email, password_hash, name, email_confirmed, created_at)
       VALUES (?, 'user@example.com', 'hash', 'Test User', 1, datetime('now'))`
    ).run(userId);

    const resumeData: ResumeData = {
      personalInfo: {
        fullName: 'Test User',
        email: 'user@example.com',
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
      content: 'resume.pdf',
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

  it('returns undefined when no record exists', () => {
    const { userId, uploadId } = seedUserAndResume();
    const result = getParsedResumeByUser(userId, uploadId);
    expect(result).toBeUndefined();
  });
});
