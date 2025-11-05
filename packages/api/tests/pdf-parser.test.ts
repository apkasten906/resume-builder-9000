import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { parsePdfBuffer } from '../src/lib/pdf-parser.js';

describe('pdf parser integration', () => {
  it('parses a generated text-layer PDF and returns regions with text', async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const text = 'John Doe\nSoftware Engineer\njohn@example.com';
    page.drawText(text, { x: 50, y: 700, size: 12, font });
    const bytes = await pdfDoc.save();
    const buffer = Buffer.from(bytes);

    const regions = await parsePdfBuffer(buffer, 2);
    expect(Array.isArray(regions)).toBe(true);
    expect(regions.length).toBeGreaterThanOrEqual(1);
    const first = regions[0] as any;
    expect(typeof first.text).toBe('string');
    expect((first.text as string).includes('John Doe')).toBe(true);
  });
});
