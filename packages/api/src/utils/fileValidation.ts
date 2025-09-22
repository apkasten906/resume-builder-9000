// File validation utility with proper error handling and HTTP status codes
// Addresses review comments about file size limits and HTTP 413 responses

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  status?: number;
}

// Basic file interface to avoid dependency on multer types
interface UploadedFile {
  originalname: string;
  size: number;
  buffer: Buffer;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];

export function validateFile(file?: UploadedFile): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file uploaded', status: 400 };
  }

  // Check file size - return 413 for oversized files per SPEC
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 5MB)', status: 413 };
  }

  // Check file extension
  const fileName = file.originalname.toLowerCase();
  const isValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

  if (!isValidExtension) {
    return {
      valid: false,
      error: 'Unsupported file type. Only PDF, DOCX, TXT, and MD are supported.',
      status: 400,
    };
  }

  return { valid: true };
}

// Configuration constants for multer setup
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
};
=======
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
