import { describe, test, expect, beforeAll } from 'vitest';
import express from 'express';
import multer from 'multer';
import supertest from 'supertest';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { parseOnlyHandler } from '../src/controllers/resume.js';
import ParsedRegionSchema from '@rb9k/core/src/dtos/parsed-region.dto.js';

// This contract test mounts the parse route handler on a transient Express app
// and POSTs a generated text-layer PDF to validate the JSON shape returned.

let app: express.Express;

beforeAll(() => {
  app = express();
  const upload = multer({ storage: multer.memoryStorage() });
  // mount handler under /parse with field name 'resume'
  app.post('/parse', upload.single('resume'), parseOnlyHandler as any);
});

async function makeTestPdf(text = 'API Test Resume PDF'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 24;
  page.drawText(text, {
    x: 100,
    y: 700,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  const bytes = await pdfDoc.save();
  return bytes;
}

describe('Parse route contract', () => {
  test('POST /parse accepts a PDF and returns regions JSON shape', async () => {
    const pdf = await makeTestPdf();

    const res = await supertest(app)
      .post('/parse')
      .attach('resume', Buffer.from(pdf), { filename: 'test.pdf', contentType: 'application/pdf' });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('resumeId');
    expect(res.body).toHaveProperty('regions');
    expect(Array.isArray(res.body.regions)).toBe(true);

    // If there are regions, validate the first one against the DTO
    if (res.body.regions.length > 0) {
      const first = res.body.regions[0];
      // ParsedRegionSchema.parse will throw if invalid
      const parsed = ParsedRegionSchema.parse(first);
      expect(parsed).toHaveProperty('text');
      expect(typeof parsed.text).toBe('string');
    }
  });
});
