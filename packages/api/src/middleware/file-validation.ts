import type { Request, Response, NextFunction } from 'express';

export function validatePdfFile(file: { mimetype?: string; size?: number } | undefined): boolean {
  if (!file) {
    throw new Error('no file');
  }
  const mimetype = file.mimetype || '';
  if (!mimetype.toLowerCase().includes('pdf')) {
    throw new Error('invalid file type');
  }
  const size = file.size || 0;
  const max = 10 * 1024 * 1024; // 10MB
  if (size > max) {
    throw new Error('file too large');
  }
  return true;
}

/**
 * Express middleware factory to validate uploaded PDF files.
 * Checks for presence, MIME type including 'pdf', and max size (10MB).
 * Works with multer-style `req.file` or `req.files[fieldName]`.
 */
export function fileValidationMiddleware(
  fieldName = 'resume'
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // multer attaches files to req.file or req.files
      type MaybeFiles = {
        file?: Express.Multer.File;
        files?: Record<string, Express.Multer.File | Express.Multer.File[]>;
      };
      const filesHolder = req as unknown as MaybeFiles;

      const candidate =
        filesHolder.file ?? (filesHolder.files ? filesHolder.files[fieldName] : undefined);

      if (!candidate) {
        res.status(400).json({ error: 'invalid_file', reason: 'no file uploaded' });
        return;
      }

      const file = Array.isArray(candidate) ? candidate[0] : candidate;

      validatePdfFile({ mimetype: file.mimetype, size: file.size });
      next();
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : String(err);
      res.status(400).json({ error: 'invalid_file', reason });
    }
  };
}

export default validatePdfFile;
