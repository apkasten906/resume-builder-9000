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

import { fileTypeFromBuffer } from 'file-type';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

/**
 * Securely validates uploaded file by extension and magic bytes/MIME type.
 * - PDF/DOCX: Must match both extension and magic bytes (using file-type)
 * - TXT/MD: Allowed by extension only (no reliable magic bytes)
 * Returns FileValidationResult with error and status if invalid.
 */
export async function validateFile(file?: UploadedFile): Promise<FileValidationResult> {
  if (!file) {
    return { valid: false, error: 'No file uploaded', status: 400 };
  }

  // Check file size - return 413 for oversized files per SPEC
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 5MB)', status: 413 };
  }

  const fileName = file.originalname.toLowerCase();
  const ext = ALLOWED_EXTENSIONS.find(e => fileName.endsWith(e));
  if (!ext) {
    return {
      valid: false,
      error: 'Unsupported file type. Only PDF, DOCX, TXT, and MD are supported.',
      status: 400,
    };
  }

  // For .pdf and .docx, require magic bytes match
  if (ext === '.pdf' || ext === '.docx') {
    try {
      const type = await fileTypeFromBuffer(file.buffer);
      if (!type) {
        return {
          valid: false,
          error: `File content does not match expected type for ${ext.toUpperCase()}`,
          status: 400,
        };
      }
      // PDF: application/pdf, DOCX: application/vnd.openxmlformats-officedocument.wordprocessingml.document
      if (
        (ext === '.pdf' && type.mime !== 'application/pdf') ||
        (ext === '.docx' &&
          type.mime !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      ) {
        return {
          valid: false,
          error: `File content does not match extension (${ext.toUpperCase()})`,
          status: 400,
        };
      }
    } catch {
      // Return generic error if file-type throws (e.g., corrupt or unreadable buffer)
      return {
        valid: false,
        error: 'Failed to validate file type',
        status: 400,
      };
    }
  }
  // For .txt and .md, allow by extension only (no reliable magic bytes)
  return { valid: true };
}

// Configuration constants for multer setup
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
};
