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
  location?: string;
  stage?: Stage;
  jdText?: string;
  salary?: { currency?: Currency; base?: number; bonus?: number; equity?: string; notes?: string };
}

export interface Application extends NewApplication {
  id: string;
  lastUpdated: string;
  createdAt: string;
}

export const applicationsRepo = {
  create(app: NewApplication): Application {
    const id = randomUUID();
    const lastUpdated = new Date().toISOString();
    const createdAt = new Date().toISOString();
    const stage = app.stage ?? 'Prospect';
    const salary = app.salary || {};

    const stmt = db.prepare(`INSERT INTO applications (
      id, company, role, location, stage, last_updated, created_at, jd_text,
      currency, salary_base, salary_bonus, salary_equity, salary_notes
    ) VALUES (
      @id, @company, @role, @location, @stage, @lastUpdated, @createdAt, @jdText,
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
      jdText: app.jdText ?? null,
      currency: salary.currency ?? null,
      salary_base: salary.base ?? null,
      salary_bonus: salary.bonus ?? null,
      salary_equity: salary.equity ?? null,
      salary_notes: salary.notes ?? null,
    });

    return { id, lastUpdated, createdAt, ...app };
  },

  list(): Application[] {
    const rows = db
      .prepare('SELECT * FROM applications ORDER BY datetime(last_updated) DESC')
      .all();
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      company: r.company,
      role: r.role,
      location: r.location ?? undefined,
      stage: r.stage,
      lastUpdated: r.last_updated,
      createdAt: r.created_at,
      jdText: r.jd_text ?? undefined,
      salary: {
        currency: r.currency ?? undefined,
        base: r.salary_base ?? undefined,
        bonus: r.salary_bonus ?? undefined,
        equity: r.salary_equity ?? undefined,
        notes: r.salary_notes ?? undefined,
      },
    }));
  },

  updateStage(appId: string, toStage: Stage, note?: string): void {
    const tx = db.transaction(() => {
      const fromStageRow = db.prepare('SELECT stage FROM applications WHERE id = ?').get(appId);
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
    ).run(randomUUID(), appId, type, filename ?? null, mimeType ?? null, url ?? null);
  },
};
