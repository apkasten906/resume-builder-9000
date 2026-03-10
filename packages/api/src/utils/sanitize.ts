/**
 * Sanitize a filename for safe storage/display.
 * - Removes directory components
 * - Restricts characters to a safe set (alphanumerics, dot, dash, underscore, space)
 * - Collapses consecutive unsafe characters to a single underscore
 * - Trims to reasonable length
 */
export function sanitizeFilename(name: string): string {
  const base = name.split(/\\|\//).pop() || 'uploaded-file';
  const cleaned = base
    .replace(/[^A-Za-z0-9._\-\s]/g, '_')
    .replace(/_{2,}/g, '_')
    .trim()
    .slice(0, 200);
  return cleaned.length > 0 ? cleaned : 'uploaded-file';
}
