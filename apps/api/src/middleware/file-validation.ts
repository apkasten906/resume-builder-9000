export function validatePdfFile(file: { mimetype?: string; size?: number } | undefined): boolean {
  if (!file) {
    throw new Error('no file');
  }
  const mimetype = file.mimetype || '';
  if (!mimetype.includes('pdf')) {
    throw new Error('invalid file type');
  }
  const size = file.size || 0;
  const max = 10 * 1024 * 1024; // 10MB
  if (size > max) {
    throw new Error('file too large');
  }
  return true;
}

export default validatePdfFile;
