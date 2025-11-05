import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit tests for the API pdf parser. These tests mock the two runtime
 * branches the parser uses:
 *  - `pdfjs-dist/legacy/build/pdf.js` (page-level parsing)
 *  - `pdf-parse` (document-level fallback)
 *
 * The goal: keep API unit tests focused and fast by mocking I/O and heavy
 * dependencies. E2E/UI flows should be covered by Playwright tests in
 * `apps/web` that exercise the full stack.
 */

beforeEach(() => {
  // Ensure fresh module cache between tests so our vi.mock factories are applied
  vi.resetModules();
});

describe('pdf parser (unit, mocked)', () => {
  it('uses pdfjs-dist branch when available and extracts text items', async () => {
    // Mock a minimal pdfjs-dist module that getDocument() resolves to a doc
    // with one page that returns textContent.items
    const mockItems = [
      { str: 'John Doe', transform: [1, 0, 0, 1, 50, 700], width: 100, height: 12 },
      { str: 'Software Engineer', transform: [1, 0, 0, 1, 50, 680], width: 120, height: 12 },
    ];

    const mockPage = {
      getTextContent: async () => ({ items: mockItems }),
    };

    const mockDoc = {
      numPages: 1,
      getPage: async () => mockPage,
      destroy: async () => undefined,
    } as const;

    vi.mock('pdfjs-dist/legacy/build/pdf.js', () => ({
      getDocument: (_opts: unknown) => ({ promise: Promise.resolve(mockDoc) }),
    }));

    // Import the parser after mocking so the dynamic import resolves to our mock
    // @ts-ignore - import a project source file for testing; runtime loader resolves it
    const { parsePdfBuffer } = await import('../src/lib/pdf-parser');

    const regions = await parsePdfBuffer(Buffer.from([]), 2);
    expect(Array.isArray(regions)).toBe(true);
    expect(regions.length).toBeGreaterThanOrEqual(1);
    const first = regions[0] as any;
    expect(typeof first.text).toBe('string');
    expect(first.text).toContain('John Doe');
  });

  it('falls back to pdf-parse when pdfjs-dist is not available', async () => {
    // Mock pdf-parse which the parser requires at module load time
    vi.mock('pdf-parse', () => {
      return async (_buffer: unknown) => ({
        text: 'John Doe\nSoftware Engineer\njohn@example.com',
      });
    });

    // @ts-ignore - import a project source file for testing; runtime loader resolves it
    const { parsePdfBuffer } = await import('../src/lib/pdf-parser');

    const regions = await parsePdfBuffer(Buffer.from([]), 2);
    expect(Array.isArray(regions)).toBe(true);
    expect(regions.length).toBeGreaterThanOrEqual(1);
    const first = regions[0] as any;
    expect(typeof first.text).toBe('string');
    expect(first.text).toContain('John Doe');
  });
});
