// packages/api/src/repositories/applicationsRepo.ts
import { randomUUID } from 'crypto';
import { connectDatabase } from '../db.js';

// Get the database connection
const db = connectDatabase();

export type Stage = 'Prospect' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Accepted';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface NewApplication {
  company: string;
  role: string;
  location?: string | null;
  stage?: Stage;
  jobDescription?: string | null;
  salary?: {
    currency?: Currency | null;
    base?: number | null;
    bonus?: number | null;
    equity?: string | null;
    notes?: string | null;
  };
}

export interface Application extends Omit<NewApplication, 'salary'> {
  id: string;
  lastUpdated: string;
  createdAt: string;
  location: string | null;
  jobDescription: string | null;
  salary: {
    currency: Currency | null;
    base: number | null;
    bonus: number | null;
    equity: string | null;
    notes: string | null;
  };
}

// Database row interface for better typing
interface ApplicationRow {
  id: string;
  company: string;
  role: string;
  location: string | null;
  stage: string;
  last_updated: string;
  created_at: string;
  job_description: string | null;
  currency: string | null;
  salary_base: number | null;
  salary_bonus: number | null;
  salary_equity: string | null;
  salary_notes: string | null;
}

export const applicationsRepo = {
  create(app: NewApplication): Application {
    const id = randomUUID();
    const lastUpdated = new Date().toISOString();
    const createdAt = new Date().toISOString();
    const stage = app.stage ?? 'Prospect';
    const salary = app.salary || {};

    const stmt = db.prepare(`INSERT INTO applications (
      id, company, role, location, stage, last_updated, created_at, job_description,
      currency, salary_base, salary_bonus, salary_equity, salary_notes
    ) VALUES (
      @id, @company, @role, @location, @stage, @lastUpdated, @createdAt, @jobDescription,
      @currency, @salary_base, @salary_bonus, @salary_equity, @salary_notes
    )`);

    stmt.run({
      id,
      company: app.company,
      role: app.role,
      location: app.location ?? null,
      stage,
      lastUpdated,
      createdAt,
      jobDescription: app.jobDescription ?? null,
      currency: salary.currency ?? null,
      salary_base: salary.base ?? null,
      salary_bonus: salary.bonus ?? null,
      salary_equity: salary.equity ?? null,
      salary_notes: salary.notes ?? null,
    });

    return {
      id,
      lastUpdated,
      createdAt,
      company: app.company,
      role: app.role,
      location: app.location ?? null,
      stage,
      jobDescription: app.jobDescription ?? null,
      salary: {
        currency: salary.currency ?? null,
        base: salary.base ?? null,
        bonus: salary.bonus ?? null,
        equity: salary.equity ?? null,
        notes: salary.notes ?? null,
      },
    };
  },

  list(): Application[] {
    const rows = db
      .prepare('SELECT * FROM applications ORDER BY datetime(last_updated) DESC')
      .all() as ApplicationRow[];
    return rows.map((r: ApplicationRow) => ({
      id: r.id,
      company: r.company,
      role: r.role,
      location: r.location ?? null,
      stage: r.stage as Stage,
      lastUpdated: r.last_updated,
      createdAt: r.created_at,
      jobDescription: r.job_description ?? null,
      salary: {
        currency: r.currency ? (r.currency as Currency) : null,
        base: r.salary_base ?? null,
        bonus: r.salary_bonus ?? null,
        equity: r.salary_equity ?? null,
        notes: r.salary_notes ?? null,
      },
    }));
  },

  updateStage(appId: string, toStage: Stage, note?: string): void {
    const tx = db.transaction(() => {
      const fromStageRow = db.prepare('SELECT stage FROM applications WHERE id = ?').get(appId) as
        | { stage: string }
        | undefined;
      const fromStage = fromStageRow?.stage ?? null;
      db.prepare('UPDATE applications SET stage=?, last_updated=? WHERE id=?').run(
        toStage,
        new Date().toISOString(),
        appId
      );
      db.prepare(
        'INSERT INTO application_status_history (id, application_id, from_stage, to_stage, note) VALUES (?,?,?,?,?)'
      ).run(randomUUID(), appId, fromStage, toStage, note ?? null);
    });
    tx();
  },

  addAttachment(
    appId: string,
    type: 'resume' | 'cover_letter' | 'other',
    filename?: string,
    mimeType?: string,
    url?: string
  ): void {
    db.prepare(
      'INSERT INTO attachments (id, application_id, type, filename, mime_type, url) VALUES (?,?,?,?,?,?)'
    ).run(
      randomUUID(),
      appId,
      type,
      filename ?? undefined,
      mimeType ?? undefined,
      url ?? undefined
    );
  },
};
