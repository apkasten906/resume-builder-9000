export type BBox = [number, number, number, number];

/**
 * Convert a PDF bbox ([x, y, width, height] in PDF units) into CSS percentages
 * relative to the rendered page size. PDF origin is assumed to be bottom-left.
 *
 * Returns values in percent suitable for inline CSS style (left, top, width, height).
 */
export function bboxToCssPercent(
  pageWidth: number,
  pageHeight: number,
  bbox: BBox
): { left: string; top: string; width: string; height: string } {
  const [x, y, w, h] = bbox;
  if (!pageWidth || !pageHeight) {
    return { left: '0%', top: '0%', width: '0%', height: '0%' };
  }

  // Convert PDF coords (origin bottom-left) to CSS (origin top-left)
  const left = (x / pageWidth) * 100;
  const width = (w / pageWidth) * 100;
  const bottom = (y / pageHeight) * 100;
  const height = (h / pageHeight) * 100;
  const top = 100 - bottom - height;

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
  };
}

export default bboxToCssPercent;
