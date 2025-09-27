import { FillPattern } from 'exceljs';

/**
 * Creates a solid fill pattern object for use with Excel cell styling.
 *
 * @param fgColor - Foreground color as an 8-character ARGB hex string (required).
 * @param bgColor - Optional background color as an 8-character ARGB hex string. If omitted, no background color is set.
 * @returns A FillPattern object configured with type "pattern", pattern "solid",
 *          fgColor set to the given foreground color, and bgColor set if provided.
 */
export function fillSolid(fgColor: string, bgColor?: string): FillPattern {
  return {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: fgColor },
    bgColor: bgColor ? { argb: bgColor } : undefined,
  };
}
