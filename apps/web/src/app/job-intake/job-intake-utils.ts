// Utility helpers for job description intake

/**
 * Validate file type and size for job description upload.
 * @param file File to validate
 * @returns Error message string if invalid, otherwise null
 */
export function validateFile(file: File): string | null {
  const allowedTypes = ['pdf', 'docx', 'txt', 'md'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!allowedTypes.includes(ext)) {
    return 'Unsupported file type. Please upload a PDF, DOCX, TXT, or MD file.';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'File is too large. Maximum size is 5MB.';
  }
  return null;
}

/**
 * Log debug info to console if running in Playwright E2E environment.
 * @param debugInfo Debug string to log
 */
export function logPlaywrightDebug(debugInfo: string): void {
  if (
    typeof window !== 'undefined' &&
    window.navigator.userAgent.toLowerCase().includes('playwright')
  ) {
    // Use structured logging in test environment
    // eslint-disable-next-line no-console
    console.log('JOB INTAKE DEBUG:', debugInfo);
  }
}
