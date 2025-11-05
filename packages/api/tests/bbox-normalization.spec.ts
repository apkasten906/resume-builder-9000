import { describe, it, expect } from 'vitest';

describe('bbox normalization', () => {
  it('converts PDF bbox to CSS coords for a typical page', async () => {
    // Use dynamic import to match project module resolution for source files
    // @ts-ignore
    const { pdfBBoxToCss } = await import('../src/lib/bbox');

    const pdfBbox: [number, number, number, number] = [50, 700, 100, 12];
    const pageHeight = 800;

    const css = pdfBBoxToCss(pdfBbox, pageHeight) as any;
    expect(css.left).toBe(50);
    // top = pageHeight - (y + height) = 800 - (700 + 12) = 88
    expect(css.top).toBe(88);
    expect(css.width).toBe(100);
    expect(css.height).toBe(12);
  });

  it('handles zero origin correctly', async () => {
    // @ts-ignore
    const { pdfBBoxToCss } = await import('../src/lib/bbox');
    const pdfBbox: [number, number, number, number] = [0, 0, 200, 50];
    const pageHeight = 1000;
    const css = pdfBBoxToCss(pdfBbox, pageHeight) as any;
    // top = 1000 - (0 + 50) = 950
    expect(css.top).toBe(950);
    expect(css.left).toBe(0);
  });
});
