import { Express } from 'express';

export function validateFile(file: Express.Multer.File | undefined): string | undefined {
  if (!file) return 'No file uploaded';
  const allowedTypes = ['pdf', 'docx', 'txt', 'md'];
  const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
  if (!allowedTypes.includes(ext)) {
    return 'Unsupported file type';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'File too large (max 5MB)';
  }
  return undefined;
}
