import { describe, it, expect, vi } from 'vitest';
import { parseFileText } from '../../src/services/fileParser.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Mock pdf-parse and mammoth
vi.mock('pdf-parse', () => ({
  default: vi.fn().mockResolvedValue({ text: 'PDF content' }),
}));

vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn().mockResolvedValue({ value: 'DOCX content' }),
  },
}));

describe('fileParser', () => {
  describe('parseFileText', () => {
    it('should parse PDF files correctly', async () => {
      // Arrange
      const mockPdfFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('fake pdf content'),
      } as Express.Multer.File;

      // Act
      const result = await parseFileText(mockPdfFile);

      // Assert
      expect(pdfParse).toHaveBeenCalledWith(mockPdfFile.buffer);
      expect(result).toBe('PDF content');
    });

    it('should parse DOCX files correctly', async () => {
      // Arrange
      const mockDocxFile = {
        originalname: 'test.docx',
        buffer: Buffer.from('fake docx content'),
      } as Express.Multer.File;

      // Act
      const result = await parseFileText(mockDocxFile);

      // Assert
      expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer: mockDocxFile.buffer });
      expect(result).toBe('DOCX content');
    });

    it('should parse TXT files correctly', async () => {
      // Arrange
      const expectedContent = 'Plain text content';
      const mockTxtFile = {
        originalname: 'test.txt',
        buffer: Buffer.from(expectedContent),
      } as Express.Multer.File;

      // Act
      const result = await parseFileText(mockTxtFile);

      // Assert
      expect(result).toBe(expectedContent);
    });

    it('should parse MD files correctly', async () => {
      // Arrange
      const expectedContent = '# Markdown content';
      const mockMdFile = {
        originalname: 'test.md',
        buffer: Buffer.from(expectedContent),
      } as Express.Multer.File;

      // Act
      const result = await parseFileText(mockMdFile);

      // Assert
      expect(result).toBe(expectedContent);
    });

    it('should return empty string for unsupported file types', async () => {
      // Arrange
      const mockUnsupportedFile = {
        originalname: 'test.xyz',
        buffer: Buffer.from('unsupported content'),
      } as Express.Multer.File;

      // Act
      const result = await parseFileText(mockUnsupportedFile);

      // Assert
      expect(result).toBe('');
    });

    it('should handle errors in PDF parsing', async () => {
      // Arrange
      const mockPdfFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('bad pdf content'),
      } as Express.Multer.File;

      // Override the mock for this test
      vi.mocked(pdfParse).mockRejectedValueOnce(new Error('PDF parsing error'));

      // Act & Assert
      await expect(parseFileText(mockPdfFile)).rejects.toThrow('PDF parsing error');
    });

    it('should handle errors in DOCX parsing', async () => {
      // Arrange
      const mockDocxFile = {
        originalname: 'test.docx',
        buffer: Buffer.from('bad docx content'),
      } as Express.Multer.File;

      // Override the mock for this test
      vi.mocked(mammoth.extractRawText).mockRejectedValueOnce(new Error('DOCX parsing error'));

      // Act & Assert
      await expect(parseFileText(mockDocxFile)).rejects.toThrow('DOCX parsing error');
    });
  });
});
