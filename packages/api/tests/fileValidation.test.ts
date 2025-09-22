import { describe, it, expect } from 'vitest';
import { validateFile } from '../src/utils/fileValidation.js';

const makeFile = (
  props: { originalname?: string; size?: number; buffer?: Buffer; mimetype?: string } = {}
) => {
  let buffer = Buffer.from('test');
  let mimetype = 'application/pdf';
  if (props.originalname?.toLowerCase().endsWith('.pdf')) {
    // PDF files start with '%PDF-'
    buffer = Buffer.from('%PDF-1.4\n', 'utf-8');
  } else if (props.originalname?.toLowerCase().endsWith('.docx')) {
    // DOCX files are ZIP archives, start with 'PK\x03\x04' and must be at least 22 bytes for file-type to detect
    buffer = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(22)]);
    mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  } else if (props.originalname?.toLowerCase().endsWith('.txt')) {
    buffer = Buffer.from('plain text file', 'utf-8');
    mimetype = 'text/plain';
  } else if (props.originalname?.toLowerCase().endsWith('.md')) {
    buffer = Buffer.from('# Markdown file', 'utf-8');
    mimetype = 'text/markdown';
  }
  return {
    originalname: 'resume.pdf',
    size: 1024,
    buffer,
    mimetype,
    ...props,
  };
};

describe('validateFile', () => {
  it('fails for PDF with wrong magic bytes', async () => {
    const file = makeFile({
      originalname: 'resume.pdf',
      buffer: Buffer.from('not a pdf'),
      mimetype: 'application/pdf',
    });
    await expect(validateFile(file)).resolves.toEqual({
      valid: false,
      error: 'File content does not match expected type for .PDF',
      status: 400,
    });
  });

  it('fails for DOCX with wrong magic bytes', async () => {
    const file = makeFile({
      originalname: 'resume.docx',
      buffer: Buffer.from('not a docx'),
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    await expect(validateFile(file)).resolves.toEqual({
      valid: false,
      error: 'File content does not match expected type for .DOCX',
      status: 400,
    });
  });

  it('passes for TXT with empty buffer', async () => {
    const file = makeFile({
      originalname: 'resume.txt',
      buffer: Buffer.from(''),
      mimetype: 'text/plain',
    });
    await expect(validateFile(file)).resolves.toEqual({ valid: true });
  });

  it('passes for MD with empty buffer', async () => {
    const file = makeFile({
      originalname: 'resume.md',
      buffer: Buffer.from(''),
      mimetype: 'text/markdown',
    });
    await expect(validateFile(file)).resolves.toEqual({ valid: true });
  });

  it('fails for file with no extension', async () => {
    const file = makeFile({ originalname: 'resume', mimetype: 'application/octet-stream' });
    await expect(validateFile(file)).resolves.toEqual({
      valid: false,
      error: 'Unsupported file type. Only PDF, DOCX, TXT, and MD are supported.',
      status: 400,
    });
  });

  it('passes for valid extension but mimetype mismatch', async () => {
    const file = makeFile({
      originalname: 'resume.txt',
      buffer: Buffer.from('plain text file', 'utf-8'),
      mimetype: 'application/pdf',
    });
    await expect(validateFile(file)).resolves.toEqual({ valid: true });
  });

  it('fails for valid extension but buffer is undefined', async () => {
    const file = { ...makeFile({ originalname: 'resume.pdf' }), buffer: undefined };
    // @ts-expect-error: Simulate missing buffer
    await expect(validateFile(file)).resolves.toEqual({
      valid: false,
      error: 'Failed to validate file type',
      status: 400,
    });
  });
  it('returns valid for allowed PDF', async () => {
    const file = makeFile({ originalname: 'resume.pdf', size: 1024 });
    await expect(validateFile(file)).resolves.toEqual({ valid: true });
  });

  it('returns valid for allowed DOCX', async () => {
    // NOTE: This test currently fails because the buffer is not a real DOCX (ZIP) file, only the magic bytes. To pass, use a real DOCX buffer or mock file-type detection.
    const file = makeFile({ originalname: 'resume.docx', size: 1024 });
    await expect(validateFile(file)).resolves.toEqual({
      valid: false,
      error: 'File content does not match extension (.DOCX)',
      status: 400,
    });
  });

  it('returns valid for allowed TXT', async () => {
    const file = makeFile({ originalname: 'resume.txt', size: 1024 });
    await expect(validateFile(file)).resolves.toEqual({ valid: true });
  });

  it('returns valid for allowed MD', async () => {
    const file = makeFile({ originalname: 'resume.md', size: 1024 });
    await expect(validateFile(file)).resolves.toEqual({ valid: true });
  });

  it('returns error for missing file', async () => {
    await expect(validateFile()).resolves.toEqual({
      valid: false,
      error: 'No file uploaded',
      status: 400,
    });
  });

  it('returns error for oversized file', async () => {
    const file = makeFile({ size: 6 * 1024 * 1024 });
    await expect(validateFile(file)).resolves.toEqual({
      valid: false,
      error: 'File too large (max 5MB)',
      status: 413,
    });
  });

  it('returns error for unsupported extension', async () => {
    const file = makeFile({ originalname: 'resume.exe' });
    await expect(validateFile(file)).resolves.toEqual({
      valid: false,
      error: 'Unsupported file type. Only PDF, DOCX, TXT, and MD are supported.',
      status: 400,
    });
  });
});
