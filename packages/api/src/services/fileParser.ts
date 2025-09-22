import { Express } from 'express';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '../utils/logger.js';

export async function parseFileText(file: Express.Multer.File): Promise<string> {
  const fileName = file.originalname.toLowerCase();
  const fileBuffer = file.buffer;
  try {
    if (fileName.endsWith('.pdf')) {
      const pdfData = await pdfParse(fileBuffer);
      logger.debug('Extracted PDF text', { textPreview: pdfData.text?.slice(0, 200) });
      return pdfData.text;
    } else if (fileName.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      logger.debug('Extracted DOCX text', { textPreview: result.value?.slice(0, 200) });
      return result.value;
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const text = fileBuffer.toString('utf-8');
      logger.debug('Extracted TXT/MD text', { textPreview: text.slice(0, 200) });
      return text;
    }
    logger.warn('Unsupported file type for parsing', { fileName });
    return '';
  } catch (err) {
    logger.error('Error extracting file text', { fileName, error: err });
    throw err;
  }
}
