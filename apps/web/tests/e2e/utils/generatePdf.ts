import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function generateSamplePdf(filePath: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const text = `Summary: Experienced software engineer with 5+ years in web development.\nExperience: Software Engineer at Acme Corp, 2018-2023\nSkills: JavaScript, TypeScript, React, Node.js`;
  page.drawText(text, {
    x: 50,
    y: 700,
    size: 12,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  const bytes = await pdfDoc.save();
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, bytes);
}
