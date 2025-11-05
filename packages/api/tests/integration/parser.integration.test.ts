import { describe, it, expect } from 'vitest';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { parseResumeFile } from '../../src/services/resumeParseService.js';

async function makeSimpleTextPdf(text: string) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  page.drawText(text, {
    x: 50,
    y: 700,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  const bytes = await pdfDoc.save();
  return bytes;
}

describe('resume parser integration (unmocked)', () => {
  it('parses a small text-layer pdf and returns regions with bbox and text', async () => {
    const sampleText = 'Name: Test User\nEmail: test@example.com\nPhone: +1 555 1234';
    const pdfBytes = await makeSimpleTextPdf(sampleText);

    const fileLike = {
      buffer: Buffer.from(pdfBytes),
      originalname: 'sample-text.pdf',
      mimetype: 'application/pdf',
      size: pdfBytes.length,
    } as unknown as Express.Multer.File;

    const regions = await parseResumeFile(fileLike, 2);

    expect(Array.isArray(regions)).toBe(true);
    expect(regions.length).toBeGreaterThan(0);

    const r = regions[0];
  // id is optional in the schema; bbox is a tuple [x,y,width,height]
  expect(r).toHaveProperty('page');
  expect(r).toHaveProperty('bbox');
  expect(r).toHaveProperty('text');
  expect(Array.isArray(r.bbox)).toBe(true);
  expect(r.bbox.length).toBe(4);
  for (const v of r.bbox) expect(typeof v).toBe('number');
  }, 20_000);
});
