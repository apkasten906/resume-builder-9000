// packages/api/src/controllers/applications.ts
import { Request, Response } from 'express';
import { applicationsRepo } from '../repositories/applicationsRepo.js';

export async function listApplications(_req: Request, res: Response): Promise<Response> {
  const rows = applicationsRepo.list();
  return res.json({ items: rows });
}

export async function createApplication(req: Request, res: Response): Promise<Response> {
  const { company, role, location } = req.body || {};
  if (!company || !role) {
    return res.status(400).json({ error: 'company and role are required' });
  }
  const created = applicationsRepo.create({ company, role, location });
  return res.status(201).json(created);
}

export async function updateStage(req: Request, res: Response): Promise<Response> {
  const { id } = req.params;
  const { toStage, note } = req.body || {};
  if (!toStage) {
    return res.status(400).json({ error: 'toStage is required' });
  }
  applicationsRepo.updateStage(id, toStage, note);
  return res.json({ ok: true });
}

export async function addAttachment(req: Request, res: Response): Promise<Response> {
  const { id } = req.params;
  const { type, filename, mimeType, url } = req.body || {};
  if (!type) {
    return res.status(400).json({ error: 'type is required' });
  }
  applicationsRepo.addAttachment(id, type, filename, mimeType, url);
  return res.status(201).json({ ok: true });
}
