/**
 * Layer 3 — derived state colours.
 *
 * Hover, press, selected and disabled are NOT part of the public contract. The
 * library computes them from the semantic layer so that a product which sets
 * one accent gets a complete, consistent, validated set of interaction states
 * without naming a single one of them.
 *
 * Why this file exists: before it, interaction states were written by hand at
 * the call site — 85 `color-mix()` expressions across the Vue stylesheet using
 * ~40 distinct magic percentages, `opacity` in eight different values for
 * disabled, and no press state at all. None of that was nameable, so none of it
 * was checkable. Every value below is derived by one of five rules, and the
 * validator can read all of them.
 *
 * These names ARE emitted as CSS custom properties, because the stylesheet has
 * to consume them. Emitting is not the same as supporting: overriding a derived
 * token is unsupported and `contract.ts` marks every one of them `private`.
 */

import {
  bestContrast,
  contrastRatio,
  darken,
  formatHex,
  lighten,
  mixColors,
  parseHex,
  relativeLuminance,
  type Rgb,
} from './color';

export type ColorMode = 'light' | 'dark';

/** Minimum contrast for a non-text UI element or an inactive control (WCAG 1.4.11). */
const AA_UI = 3;
/** Minimum contrast for normal-size text (WCAG 1.4.3). */
const AA_TEXT = 4.5;

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

/**
 * How far a state moves its base colour. One place, so "press is a visibly
 * bigger step than hover" is a property of the system rather than of whichever
 * component was written last.
 */
const STEP = {
  hover: 0.18,
  press: 0.32,
  /** Tint states move toward the solid colour instead of toward black/white. */
  softHover: 0.14,
  softPress: 0.26,
  /** Neutral row/menu surfaces, as a fraction of the ink mixed into the surface. */
  neutralHover: 0.06,
  neutralPress: 0.12,
} as const;

/**
 * Below this, a fill change is not a state change — it is the same colour.
 * Matches `MIN_STATE_DELTA` in `contract.ts`, so the engine never emits a state
 * the validator would then reject.
 */
const DEGENERATE = 1.12;

/**
 * Move a colour in the direction that reads as "deeper" for the given mode —
 * darker in light mode, lighter in dark mode.
 *
 * Falls back to the opposite direction when the preferred one has no room:
 * darkening a near-black brand produces a hover state identical to its rest
 * state, which is how a product seeding `#111827` got a button with no visible
 * press. Only degenerate cases flip, so ordinary mid-tones keep the expected
 * direction.
 */
const step = (color: Rgb, amount: number, mode: ColorMode) => {
  const preferred = mode === 'light' ? darken(color, amount) : lighten(color, amount);

  if (contrastRatio(preferred, color) >= DEGENERATE) return preferred;

  const flipped = mode === 'light' ? lighten(color, amount) : darken(color, amount);

  // Neither direction may have room (a mid gray at a small amount); take the
  // more visible of the two rather than silently preferring one.
  return contrastRatio(flipped, color) > contrastRatio(preferred, color) ? flipped : preferred;
};

/**
 * Mix `from` toward `to` as far as possible while staying at or above
 * `minRatio` against `against`. Used for disabled ink: it should be visibly
 * weaker than muted text, but never so weak that the control becomes
 * unreadable — which is exactly what `opacity: 0.5` on muted text produced.
 */
const fadeToward = (from: Rgb, to: Rgb, against: Rgb, minRatio: number): Rgb => {
  let best = from;

  for (let amount = 0.05; amount <= 0.9; amount += 0.05) {
    const candidate = mixColors(from, to, amount);

    if (contrastRatio(candidate, against) < minRatio) break;

    best = candidate;
  }

  return best;
};

/**
 * Snap a colour to the 8-bit value it will actually be emitted as.
 *
 * `mixColors` returns fractional channels. Deriving an ink against the
 * unrounded mix and then emitting the rounded hex means the pair that ships is
 * not the pair that was checked — a cyan seed passed derivation at 4.50:1 and
 * shipped at 4.47:1. Every intermediate that is both emitted and used as a
 * contrast reference goes through here first.
 */
const quantize = (color: Rgb): Rgb => parseHex(formatHex(color));

/**
 * Push a colour away from `against` until it clears `minRatio`. Returns the
 * first passing step, so a value that already passes is returned untouched.
 *
 * The direction comes from which side of the background the colour already sits
 * on, not from the theme mode. Mode was wrong at the extremes: in dark mode it
 * lightened, and lightening white is a no-op, so a white seed produced a
 * pressed-tint label stuck at 4.36:1. When even the extreme cannot reach the
 * target, the better of black/white is returned rather than a value that
 * quietly fails.
 */
const untilLegible = (color: Rgb, against: Rgb, minRatio: number): Rgb => {
  if (contrastRatio(color, against) >= minRatio) return color;

  const goLighter = relativeLuminance(color) >= relativeLuminance(against);
  let candidate = color;

  for (let i = 0; i < 24; i += 1) {
    candidate = goLighter ? lighten(candidate, 0.05) : darken(candidate, 0.05);

    if (contrastRatio(candidate, against) >= minRatio) return candidate;
  }

  return bestContrast(against, [WHITE, BLACK]);
};

/** The shape `deriveStateColors` reads. Loose, so an overridden theme fits it. */
export interface SemanticColorInput {
  bg: { primary: string; surface: string; subtle: string };
  border: { default: string; strong: string; interactive?: string };
  text: { primary: string; muted: string; inverse: string };
  brand: { primary: string; hover: string; soft: string; contrast: string };
  accent: { primary: string; hover: string; soft: string; contrast: string };
  status: { success: string; warning: string; error: string; info: string };
}

const STATUS_KEYS = ['success', 'warning', 'error', 'info'] as const;
const FAMILY_KEYS = ['brand', 'accent'] as const;

/**
 * Derive every interaction state from the semantic layer.
 *
 * The return value is a nested record shaped for the CSS flattener, so
 * `{ brand: { press } }` becomes `--tree-color-brand-press`.
 */
export const deriveStateColors = (color: SemanticColorInput, mode: ColorMode) => {
  const surface = parseHex(color.bg.surface);
  const subtle = parseHex(color.bg.subtle);
  const ink = parseHex(color.text.primary);
  const muted = parseHex(color.text.muted);
  const inverse = parseHex(color.text.inverse);

  /**
   * Solid + tint interaction ramp for one colour family.
   *
   * A tint deepens on hover and deepens further on press — and the ink on it
   * moves with it. That second half matters: a soft button's tint has only so
   * much headroom before the label stops passing AA on it, and the library's
   * own light brand tint sat at 4.56:1 at rest. Deepening the tint alone put
   * the hover state at 3.80:1. So each tint state ships with the ink that is
   * guaranteed to read on it, and components pair them.
   */
  const familyStates = (primary: string, soft: string) => {
    const base = parseHex(primary);
    const tint = parseHex(soft);
    const softHover = quantize(mixColors(tint, base, STEP.softHover));
    const softPress = quantize(mixColors(tint, base, STEP.softPress));

    return {
      press: formatHex(step(base, STEP.press, mode)),
      'soft-hover': formatHex(softHover),
      'soft-press': formatHex(softPress),
      'on-soft': formatHex(untilLegible(base, tint, AA_TEXT)),
      'on-soft-hover': formatHex(untilLegible(base, softHover, AA_TEXT)),
      'on-soft-press': formatHex(untilLegible(base, softPress, AA_TEXT)),
    };
  };

  const brand = familyStates(color.brand.primary, color.brand.soft);
  const accent = familyStates(color.accent.primary, color.accent.soft);

  /**
   * Statuses get the same ramp as a brand family, plus the tint and the border
   * the components used to build inline. `contrast` is COMPUTED per status per
   * theme rather than reusing `text.inverse`: white on the light warning
   * measures 4.87:1 today, and a product that shifts warning even slightly
   * lighter would break that silently.
   */
  const status = Object.fromEntries(
    STATUS_KEYS.flatMap((key) => {
      const base = parseHex(color.status[key]);
      const tint = quantize(mixColors(surface, base, 0.14));

      const softHover = quantize(mixColors(tint, base, STEP.softHover));

      return [
        [`${key}-hover`, formatHex(step(base, STEP.hover, mode))],
        [`${key}-press`, formatHex(step(base, STEP.press, mode))],
        [`${key}-soft`, formatHex(tint)],
        [`${key}-soft-hover`, formatHex(softHover)],
        /**
         * The alert's edge. Mixing the neutral border toward the status by a
         * fixed 36% — the recipe the stylesheet used inline — produced a
         * 1.8:1 edge on the tint, i.e. an edge nobody could see. Derived from
         * the status colour instead, softened as far as 3:1 allows.
         */
        [`${key}-border`, formatHex(quantize(fadeToward(base, tint, tint, AA_UI)))],
        [`${key}-contrast`, formatHex(bestContrast(base, [WHITE, inverse]))],
        // The status colour as ink on its own tint — soft alerts and badges.
        [`${key}-on-soft`, formatHex(untilLegible(base, tint, AA_TEXT))],
        [`${key}-on-soft-hover`, formatHex(untilLegible(base, softHover, AA_TEXT))],
      ];
    }),
  ) as Record<string, string>;

  /**
   * Disabled. Replaces `opacity`, which dropped muted text to roughly 2.2:1
   * effective and was invisible to any contrast check because opacity is not a
   * colour. The ink is faded as far toward the surface as it can go while still
   * clearing the 3:1 UI floor.
   */
  const disabledBg = subtle;
  const disabledFg = quantize(fadeToward(muted, disabledBg, disabledBg, AA_UI));
  const disabledBorder = mixColors(parseHex(color.border.default), disabledBg, 0.45);

  return {
    border: {
      /**
       * Control boundaries. Explicit in the semantic layer when a product sets
       * one; derived here from `border.strong` otherwise, pushed until it
       * clears 3:1 on the *subtle* surface — the worst of the three, and the
       * one inputs actually sit on inside a card.
       */
      interactive:
        color.border.interactive ??
        formatHex(untilLegible(parseHex(color.border.strong), subtle, AA_UI)),
    },
    brand,
    accent,
    status,
    state: {
      /** Neutral interactive surfaces: menu items, table rows, ghost buttons. */
      'hover-bg': formatHex(quantize(mixColors(surface, ink, STEP.neutralHover))),
      'press-bg': formatHex(quantize(mixColors(surface, ink, STEP.neutralPress))),
      /**
       * Selection reads as the brand tint. The ink is the brand's derived
       * on-tint ink, not `brand.primary` — on the shipped dark tint those
       * differ, and the raw brand measured 4.44:1 there.
       */
      'selected-bg': color.brand.soft,
      'selected-fg': brand['on-soft'],
      'selected-border': color.brand.primary,
      'disabled-bg': formatHex(disabledBg),
      'disabled-fg': formatHex(disabledFg),
      'disabled-border': formatHex(disabledBorder),
    },
  };
};

export type DerivedStateColors = ReturnType<typeof deriveStateColors>;

/** Every derived CSS variable name, for the contract and the validator. */
export const derivedVariableNames = (derived: DerivedStateColors): string[] => {
  const names: string[] = [];

  for (const [group, entries] of Object.entries(derived)) {
    for (const key of Object.keys(entries as Record<string, string>)) {
      names.push(`--tree-color-${group}-${key}`);
    }
  }

  return names.sort();
};

export { FAMILY_KEYS, STATUS_KEYS, STEP };
