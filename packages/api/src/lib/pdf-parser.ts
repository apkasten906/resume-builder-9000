// We'll dynamically import `pdf-parse` only when needed so this module works
// in ESM environments and when `pdfjs-dist` is available.

/**
 * PAGE-PARSER: Prefer `pdfjs-dist` for page-level extraction (text + bbox when available).
 * If `pdfjs-dist` is not installed, fall back to `pdf-parse` that returns full-document text.
 * Returns: Array of regions: { page, text, bbox?, category, confidence }
 */
export async function parsePdfBuffer(buffer: Buffer, maxPages = 3): Promise<unknown[]> {
  try {
    // dynamic import so the repo can work without pdfjs-dist installed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js');
    const { getDocument } = pdfjs;
    const uint8 = new Uint8Array(buffer);
    const doc = await getDocument({ data: uint8 }).promise;
    try {
      const pageCount = Math.min(doc.numPages, maxPages);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const regions: Array<Record<string, any>> = [];

      for (let p = 1; p <= pageCount; p++) {
        const page = await doc.getPage(p);
        const textContent = await page.getTextContent();

        // Aggregate text items into a single string and attempt to compute a simple bbox
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = textContent.items as Array<any>;
        const texts: string[] = [];
        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        for (const it of items) {
          const str = it && it.str ? String(it.str) : '';
          if (str) texts.push(str);

          // Attempt to derive position/size from transform and width/height if present
          if (it && it.transform && typeof it.width === 'number' && typeof it.height === 'number') {
            // transform is a 6-element matrix; x = transform[4], y = transform[5]
            const x = Number(it.transform[4] ?? 0);
            const y = Number(it.transform[5] ?? 0);
            const w = Number(it.width);
            const h = Number(it.height);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y - h);
            maxX = Math.max(maxX, x + w);
            maxY = Math.max(maxY, y);
          }
        }

        const text = texts.join('\n').trim();
        const bbox =
          minX !== Number.POSITIVE_INFINITY && maxX !== Number.NEGATIVE_INFINITY
            ? [minX, minY, maxX - minX, maxY - minY]
            : undefined;

        if (text.length > 0) {
          regions.push({ page: p - 1, text, bbox, category: 'unclassified', confidence: 1.0 });
        }
      }

      return regions;
    } finally {
      try {
        await doc.destroy();
      } catch {
        // ignore
      }
    }
  } catch {
    // pdfjs-dist not available or failed; fall back to pdf-parse
    // Dynamically import `pdf-parse` so we don't rely on CommonJS `require` at top-level.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseMod: any = await import('pdf-parse');
    const pdfParse = pdfParseMod.default ?? pdfParseMod;
    const data = await pdfParse(buffer as any);
    const text = data && data.text ? String(data.text).trim() : '';
    if (!text) return [];

    // try to split into pages by form-feed, otherwise return single region
    const pages = text
      .split('\f')
      .map(s => s.trim())
      .filter(Boolean);
    if (pages.length > 1) {
      return pages
        .slice(0, maxPages)
        .map((t, idx) => ({ page: idx, text: t, category: 'unclassified', confidence: 1.0 }));
    }

    return [{ page: 0, text, category: 'unclassified', confidence: 1.0 }];
  }

  // Fallback guard
  return [];
}

export default parsePdfBuffer;
