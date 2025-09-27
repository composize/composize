/**
 * Standard colors used in Excel.
 *
 * These colors are represented in ARGB format.
 * The first two characters represent the alpha channel (opacity).
 */
export const Color = {
  /** #c00000 */
  DarkRed: 'ffc00000',
  /** #ff0000 */
  Red: 'ffff0000',
  /** #ffc000 */
  Orange: 'ffffc000',
  /** #ffff00 */
  Yellow: 'ffffff00',
  /** #92d050 */
  LightGreen: 'ff92d050',
  /** #00b050 */
  Green: 'ff00b050',
  /** #00b0f0 */
  LightBlue: 'ff00b0f0',
  /** #0070c0 */
  Blue: 'ff0070c0',
  /** #002060 */
  DarkBlue: 'ff002060',
  /** #7030a0 */
  Purple: 'ff7030a0'
} as const;

/**
 * A collection of standardized font sizes for various text elements.
 *
 * The `FontSize` object provides numeric values for font sizes, organized by usage context:
 * - Caption, Footnote: Small text for captions, footnotes.
 * - BodySmall, Body, BodyLarge: Small body text, default and large body text.
 * - Subheading: For subheadings.
 * - TitleSmall, Title, TitleLarge: For different levels of titles.
 * - HeadingSmall, Heading, HeadingLarge: For section headings.
 * - DisplaySmall, Display, DisplayLarge, DisplayXL: For display text, including extra-large sizes.
 */
export const FontSize = {
  Caption: 8,
  Footnote: 9,

  BodySmall: 10,
  Body: 11,
  BodyLarge: 12,

  Subheading: 14,

  TitleSmall: 16,
  Title: 18,
  TitleLarge: 20,

  HeadingSmall: 22,
  Heading: 24,
  HeadingLarge: 26,

  DisplaySmall: 28,
  Display: 36,
  DisplayLarge: 48,
  DisplayXL: 72,
} as const;

export const DEFAULT_FONT_SIZE = FontSize.Body;

export const DEFAULT_COLUMN_WIDTH = 8.43;
