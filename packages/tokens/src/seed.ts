/**
 * Phase 3 — theming by seeds.
 *
 * The smallest thing a product has to supply is one colour:
 *
 *     createThemePair({ accent: '#7c3aed' })
 *
 * Everything else — the hover and press ramps, the tints, the ink that goes on
 * top of the accent, the focus ring, both light and dark — is computed. A
 * product that wants more control adds `accentSecondary`, `neutral`, or
 * pointwise `overrides`, and every one of those paths lands in the same
 * validator.
 *
 * What is NOT derived from the accent: the status colours. Success staying
 * green when a product's brand is red is the point of a status colour. Seed
 * `status` explicitly to change them.
 */

import { formatHex, mixColors, parseHex, relativeLuminance, withLuminance } from './color';
import { deriveBrandRamp } from './css';
import { treeThemes, type TreeThemeName } from './tokens';
import type { ColorMode, SemanticColorInput } from './states';
import { validateTheme, type ThemeValidationResult } from './validate';

export interface ThemeSeed {
  /**
   * The product's brand colour. The only required input.
   *
   * It is used as given when it is already legible as ink on its own tint,
   * and stepped toward the surface until it is when it is not — see
   * `deriveBrandRamp`. So a mid-tone brand still yields a readable soft button.
   */
  accent: string;
  /** Optional second voice. Falls back to the library's secondary accent. */
  accentSecondary?: string;
  /**
   * Optional neutral hue. The grays are tinted toward it, keeping the shipped
   * luminance steps — this warms or cools the whole UI without inventing a new
   * neutral ramp and without moving any text contrast far.
   */
  neutral?: string;
  /** Optional status overrides. Anything omitted keeps the library's value. */
  status?: Partial<Record<'success' | 'warning' | 'error' | 'info', string>>;
  /**
   * Pointwise overrides of any semantic token, per mode. Applied last, and
   * validated exactly like a derived value — an override is not an escape
   * hatch from the contrast contract.
   */
  overrides?: Partial<Record<TreeThemeName, DeepPartial<SemanticColorInput>>>;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** How far a neutral is pulled toward the seed hue. Small on ink, larger on fills. */
const NEUTRAL_TINT = {
  surface: 0.06,
  border: 0.1,
  text: 0.04,
} as const;

/**
 * Pull a neutral toward the seed hue, then put its original luminance back.
 *
 * A plain mix moves both hue and lightness. Tinting the light `#eff2f5` band
 * toward a violet dropped its luminance enough that success, warning and error
 * all fell under 4.5:1 on it — the seed changed the palette's temperature and
 * silently broke its contrast. Re-lighting the result keeps the ramp's steps
 * exactly where the theme put them.
 */
const tint = (value: string, toward: string | undefined, amount: number) => {
  if (toward === undefined) return value;

  const original = parseHex(value);
  const mixed = mixColors(original, parseHex(toward), amount);

  return formatHex(withLuminance(mixed, relativeLuminance(original)));
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMerge = <T>(base: T, patch: unknown): T => {
  if (!isPlainObject(patch)) return base;

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };

  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    result[key] = isPlainObject(value) ? deepMerge(result[key], value) : value;
  }

  return result as T;
};

/**
 * Build the semantic colour block for one mode from a seed.
 *
 * The result is a plain theme object of exactly the shape `treeThemes.light`
 * has, so anything that accepts a built-in theme accepts a seeded one.
 */
export const createTheme = (seed: ThemeSeed, mode: ColorMode): SemanticColorInput => {
  const base = treeThemes[mode].color;
  const brand = deriveBrandRamp(seed.accent, mode);
  const accent = deriveBrandRamp(seed.accentSecondary ?? base.accent.primary, mode);
  const neutral = seed.neutral;

  const seeded = {
    bg: {
      primary: tint(base.bg.primary, neutral, NEUTRAL_TINT.surface),
      surface: tint(base.bg.surface, neutral, NEUTRAL_TINT.surface),
      subtle: tint(base.bg.subtle, neutral, NEUTRAL_TINT.surface),
    },
    // `interactive` is intentionally not set — the library derives it from
    // `strong` and guarantees 3:1. A product that wants a specific control edge
    // sets it through `overrides`, and it is validated like any other value.
    border: {
      default: tint(base.border.default, neutral, NEUTRAL_TINT.border),
      strong: tint(base.border.strong, neutral, NEUTRAL_TINT.border),
    },
    text: {
      primary: tint(base.text.primary, neutral, NEUTRAL_TINT.text),
      muted: tint(base.text.muted, neutral, NEUTRAL_TINT.text),
      inverse: base.text.inverse,
    },
    'shadow-rgb': base['shadow-rgb'],
    brand: {
      primary: brand.primary,
      hover: brand.hover,
      soft: brand.soft,
      contrast: brand.contrast,
    },
    accent: {
      primary: accent.primary,
      hover: accent.hover,
      soft: accent.soft,
      contrast: accent.contrast,
    },
    status: {
      success: seed.status?.success ?? base.status.success,
      warning: seed.status?.warning ?? base.status.warning,
      error: seed.status?.error ?? base.status.error,
      // A product whose accent is not blue should say so, or `info` and the
      // brand stay the same colour. Seeding the accent alone cannot know that,
      // so `info` follows the brand only when the product did not set it.
      info: seed.status?.info ?? brand.primary,
    },
    chart: { ...base.chart },
    overlay: base.overlay,
    'focus-ring': brand.focusRing,
  } as unknown as SemanticColorInput;

  return deepMerge(seeded, seed.overrides?.[mode]);
};

/** Both modes at once — the common case. */
export const createThemePair = (seed: ThemeSeed) => ({
  light: createTheme(seed, 'light'),
  dark: createTheme(seed, 'dark'),
});

/**
 * Seed, then validate. Use this in a product's build step: it returns the
 * themes and the two validation results together, so a caller can fail the
 * build on `results.some((r) => !r.valid)` without re-deriving anything.
 */
export const createValidatedThemePair = (
  seed: ThemeSeed,
  options: { label?: string } = {},
): {
  themes: { light: SemanticColorInput; dark: SemanticColorInput };
  results: ThemeValidationResult[];
  valid: boolean;
} => {
  const themes = createThemePair(seed);
  const label = options.label;
  const results = [
    validateTheme(themes.light, 'light', { label: label ? `${label}-light` : 'light' }),
    validateTheme(themes.dark, 'dark', { label: label ? `${label}-dark` : 'dark' }),
  ];

  return { themes, results, valid: results.every((result) => result.valid) };
};
