// packages/api/src/controllers/resumeDownload.ts
import { Request, Response } from 'express';

export async function downloadResume(req: Request, res: Response): Promise<void> {
  const { content = '# Resume\n\nNo content provided.' } = req.body || {};
  // For now, return Markdown as text/plain; later integrate PDF generation
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="resume.md"');
  res.send(content);
}
