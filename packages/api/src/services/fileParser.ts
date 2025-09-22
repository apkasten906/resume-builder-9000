import { Express } from 'express';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function parseFileText(file: Express.Multer.File): Promise<string> {
  const fileName = file.originalname.toLowerCase();
  const fileBuffer = file.buffer;
  if (fileName.endsWith('.pdf')) {
    const pdfData = await pdfParse(fileBuffer);
    return pdfData.text;
  } else if (fileName.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return fileBuffer.toString('utf-8');
  }
  return '';
}
