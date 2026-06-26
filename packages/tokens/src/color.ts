/**
 * Framework-agnostic sRGB color helpers used by the theme generator.
 *
 * These operate in plain sRGB space. Perceptual uniformity (oklch) is tracked
 * separately; when tokens migrate to oklch these derivations can be revisited
 * for more even ramps.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const clampChannel = (value: number) => Math.min(255, Math.max(0, Math.round(value)));

const expandShortHex = (hex: string) =>
  hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;

export const parseHex = (value: string): Rgb => {
  const hex = expandShortHex(value.trim());
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);

  if (!match) {
    throw new Error(`Invalid hex color: "${value}"`);
  }

  const int = Number.parseInt(match[1], 16);

  return {
    r: (int >> 16) & 0xff,
    g: (int >> 8) & 0xff,
    b: int & 0xff,
  };
};

export const formatHex = ({ r, g, b }: Rgb): string => {
  const toPart = (channel: number) => clampChannel(channel).toString(16).padStart(2, '0');
  return `#${toPart(r)}${toPart(g)}${toPart(b)}`;
};

/** Linear sRGB mix. `weight` is how much of `b` to blend into `a` (0..1). */
export const mixColors = (a: Rgb, b: Rgb, weight: number): Rgb => {
  const t = Math.min(1, Math.max(0, weight));

  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
};

const BLACK: Rgb = { r: 0, g: 0, b: 0 };
const WHITE: Rgb = { r: 255, g: 255, b: 255 };

/** Blend `amount` (0..1) of black into the color. */
export const darken = (color: Rgb, amount: number) => mixColors(color, BLACK, amount);

/** Blend `amount` (0..1) of white into the color. */
export const lighten = (color: Rgb, amount: number) => mixColors(color, WHITE, amount);

const channelLuminance = (value: number) => {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance (0..1). */
export const relativeLuminance = ({ r, g, b }: Rgb): number =>
  0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);

/** WCAG contrast ratio between two colors (1..21). */
export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const luminanceA = relativeLuminance(a);
  const luminanceB = relativeLuminance(b);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);

  return (lighter + 0.05) / (darker + 0.05);
};

/** Pick whichever candidate has the higher contrast ratio against `color`. */
export const bestContrast = (color: Rgb, candidates: [Rgb, Rgb]): Rgb =>
  contrastRatio(color, candidates[0]) >= contrastRatio(color, candidates[1])
    ? candidates[0]
    : candidates[1];

export const withAlpha = ({ r, g, b }: Rgb, alpha: number): string =>
  `rgba(${clampChannel(r)}, ${clampChannel(g)}, ${clampChannel(b)}, ${alpha})`;
