import { describe, it, expect } from 'vitest';
import { bboxToCssPercent } from '../src/lib/bbox';

describe('bboxToCssPercent', () => {
  it('maps PDF bbox to CSS percent correctly', () => {
    const pageW = 600;
    const pageH = 800;
    // x=60 (10%), y=80 (10% from bottom), w=120 (20%), h=160 (20%)
    const bbox: [number, number, number, number] = [60, 80, 120, 160];
    const css = bboxToCssPercent(pageW, pageH, bbox);
    expect(css.left).toBe('10%');
    expect(css.width).toBe('20%');
    // top = 100 - bottom - height = 100 - (10%) - 20% = 70%
    expect(css.top).toBe('70%');
    expect(css.height).toBe('20%');
  });
});
