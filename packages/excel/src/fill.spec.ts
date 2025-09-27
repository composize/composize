import { describe, expect, it } from 'vitest';
import { fillSolid } from './fill';

describe('fillSolid', () => {
  it('returns a solid pattern with fgColor and no bgColor when bgColor is omitted', () => {
    const fg = 'FF112233';
    const result = fillSolid(fg);

    expect(result.type).toBe('pattern');
    expect(result.pattern).toBe('solid');
    expect(result.fgColor).toEqual({ argb: fg });
    expect(result.bgColor).toBeUndefined();
  });

  it('includes bgColor when provided', () => {
    const fg = 'FF112233';
    const bg = 'FF445566';
    const result = fillSolid(fg, bg);

    expect(result.fgColor).toEqual({ argb: fg });
    expect(result.bgColor).toEqual({ argb: bg });
  });
});
