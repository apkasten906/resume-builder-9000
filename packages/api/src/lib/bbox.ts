/**
 * Helper functions for converting PDF bbox coordinates to CSS overlay coordinates.
 *
 * PDF coordinate system (pdfjs): origin at bottom-left, y increases upward.
 * CSS overlay coordinate system: origin at top-left, y increases downward.
 *
 * bbox PDF shape: [x, y, width, height]
 * CSS shape returned: { left, top, width, height }
 */
export function pdfBBoxToCss(
  bbox: [number, number, number, number],
  pageHeight: number
): { left: number; top: number; width: number; height: number } {
  const [x, y, w, h] = bbox;
  const left = x;
  // top in CSS = pageHeight - (y + height)
  const top = pageHeight - (y + h);
  return { left, top, width: w, height: h };
}

export default pdfBBoxToCss;
