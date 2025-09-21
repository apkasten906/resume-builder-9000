import { describe, it, expect, vi, afterEach } from 'vitest';
import { validateFile, logPlaywrightDebug } from '../../src/app/resume-upload/resume-upload-utils';

describe('validateFile', () => {
  it('accepts valid PDF file', () => {
    const file = new File(['dummy'], 'resume.pdf', {
      type: 'application/pdf',
      lastModified: Date.now(),
    });
    expect(validateFile(file)).toBeNull();
  });
  it('accepts valid DOCX file', () => {
    const file = new File(['dummy'], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(validateFile(file)).toBeNull();
  });
  it('rejects unsupported file type', () => {
    const file = new File(['dummy'], 'resume.exe', {
      type: 'application/x-msdownload',
    });
    expect(validateFile(file)).toMatch(/Unsupported file type/i);
  });
  it('rejects file over 5MB', () => {
    // 5MB + 1 byte
    const file = new File(['a'.repeat(5 * 1024 * 1024 + 1)], 'resume.pdf', {
      type: 'application/pdf',
    });
    expect(validateFile(file)).toMatch(/File is too large/i);
  });
});

describe('logPlaywrightDebug', () => {
  const originalWindow = globalThis.window;
  afterEach(() => {
    globalThis.window = originalWindow;
    vi.restoreAllMocks();
  });
  it('logs debug info if userAgent includes playwright', () => {
    Object.assign(globalThis, {
      window: {
        ...globalThis.window,
        navigator: { userAgent: 'something playwright something' } as Navigator,
      },
    });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logPlaywrightDebug('debug!');
    expect(spy).toHaveBeenCalledWith('RESUME UPLOAD DEBUG:', 'debug!');
  });
  it('does not log if userAgent does not include playwright', () => {
    Object.assign(globalThis, {
      window: {
        ...globalThis.window,
        navigator: { userAgent: 'Mozilla/5.0' } as Navigator,
      },
    });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logPlaywrightDebug('debug!');
    expect(spy).not.toHaveBeenCalled();
  });
  it('does not throw if window is undefined', () => {
    // @ts-expect-error: test deletes window for negative case
    delete globalThis.window;
    expect(() => logPlaywrightDebug('debug!')).not.toThrow();
  });
});
