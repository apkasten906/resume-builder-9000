import { parsePdfBuffer } from '../../lib/pdf-parser.js';
import type { Request, Response } from 'express';

// Minimal route handler stub. In the real server this would be wired to Express or the API layer.
export async function handleParseRoute(req: Request, res: Response): Promise<Response | void> {
  try {
    // multer attaches file to req.file; use Express.Multer.File typing if available
    const file = (req as unknown as { file?: Express.Multer.File }).file;
    if (!file || !file.buffer) {
      return res.status(400).json({ error: 'no file uploaded' });
    }

    const regions = await parsePdfBuffer(file.buffer);
    return res.status(200).json({ resumeId: null, regions });
  } catch (err) {
    // err typed as unknown to avoid any; convert to string safely
    const msg = err instanceof Error ? err.message : 'parse error';
    return res.status(500).json({ error: msg });
  }
}

export default handleParseRoute;
