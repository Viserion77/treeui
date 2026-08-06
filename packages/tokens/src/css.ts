import {
  bestContrast,
  contrastRatio,
  darken,
  formatHex,
  lighten,
  mixColors,
  parseHex,
  withAlpha,
  type Rgb,
} from './color';
import { deriveStateColors, type ColorMode, type SemanticColorInput } from './states';
import { treeThemes, treeTokens, type TreeThemeName } from './tokens';

type TokenValue = string | number;

interface TokenRecord {
  [key: string]: TokenValue | TokenRecord;
}

const toCssVariable = (path: string[]) => `--tree-${path.join('-')}`;

const flattenTokens = (
  record: TokenRecord,
  path: string[] = [],
): Array<[string, TokenValue]> => {
  return Object.entries(record).flatMap(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return [[toCssVariable([...path, key]), value]];
    }

    return flattenTokens(value, [...path, key]);
  });
};

const renderDeclarationBlock = (entries: Array<[string, TokenValue]>) => {
  return entries.map(([name, value]) => `  ${name}: ${value};`).join('\n');
};

export const createFoundationCss = () => {
  const declarations = renderDeclarationBlock(flattenTokens(treeTokens as TokenRecord));

  return `:root {\n${declarations}\n}`;
};

/**
 * A theme's full variable set: the semantic layer a product fills in, plus the
 * interaction states the library derives from it.
 *
 * Both are emitted, because the stylesheet consumes both. Only the semantic
 * half is public — see `contract.ts`.
 */
export const themeDeclarations = (
  color: SemanticColorInput,
  mode: ColorMode,
): Array<[string, TokenValue]> => [
  ...flattenTokens({ color } as unknown as TokenRecord),
  ...flattenTokens({ color: deriveStateColors(color, mode) } as unknown as TokenRecord),
];

const renderThemeBlock = (
  selector: string,
  color: SemanticColorInput,
  mode: ColorMode,
) =>
  `${selector} {\n  color-scheme: ${mode};\n${renderDeclarationBlock(
    themeDeclarations(color, mode),
  )}\n}`;

export const createThemeCss = (
  themeName: TreeThemeName,
  selector = `[data-tree-theme="${themeName}"]`,
) =>
  renderThemeBlock(
    selector,
    treeThemes[themeName].color as unknown as SemanticColorInput,
    themeName === 'dark' ? 'dark' : 'light',
  );

export const createDefaultThemeCss = (themeName: TreeThemeName) =>
  renderThemeBlock(
    ':root',
    treeThemes[themeName].color as unknown as SemanticColorInput,
    themeName === 'dark' ? 'dark' : 'light',
  );

/**
 * A complete, self-contained theme block from a semantic colour set — the
 * output a product ships when it themes by seed.
 *
 * @example
 * const { light, dark } = createThemePair({ accent: '#7c3aed' });
 * createSemanticThemeCss('acme', light, 'light');
 * // [data-tree-theme="acme"] { color-scheme: light; --tree-color-bg-primary: …
 */
export const createSemanticThemeCss = (
  name: string,
  color: SemanticColorInput,
  mode: ColorMode,
  selector = `[data-tree-theme="${name}"]`,
) => renderThemeBlock(selector, color, mode);

export const createStylesheet = () =>
  [createFoundationCss(), createDefaultThemeCss('light')].join('\n\n');

export const createThemesStylesheet = () =>
  [
    createThemeCss('light'),
    createThemeCss('dark'),
    `@media (prefers-color-scheme: dark) {\n${createThemeCss('dark', ':root:not([data-tree-theme="light"])')}\n}`,
  ].join('\n\n');

// --- Theme generator -------------------------------------------------------

/** Soft tint base for dark-mode brand `soft`. */
const SOFT_DARK_BASE: Rgb = { r: 13, g: 17, b: 23 };
/** Near-black contrast candidate (matches the dark theme `text.inverse`). */
const CONTRAST_DARK: Rgb = { r: 28, g: 33, b: 40 };
const CONTRAST_LIGHT: Rgb = { r: 255, g: 255, b: 255 };

export interface BrandRamp {
  primary: string;
  hover: string;
  soft: string;
  contrast: string;
  focusRing: string;
}

export interface BrandThemeOptions {
  /**
   * `'light'` (default) derives a darker hover and a light soft tint.
   * `'dark'` derives a lighter hover and a dark soft tint.
   */
  mode?: 'light' | 'dark';
  /** CSS selector for the generated block. Defaults to `[data-tree-theme="<name>"]`. */
  selector?: string;
  /** Explicit ramp values that win over the derived ones. */
  overrides?: Partial<BrandRamp>;
}

/** WCAG AA contrast for normal-size text. */
const AA_NORMAL = 4.5;
/** Mirrors `MIN_STATE_DELTA` in contract.ts — the floor a state must clear. */
const MIN_STATE_DELTA = 1.12;
/** Step used while walking a brand color toward legibility. */
const LEGIBILITY_STEP = 0.04;
/**
 * 20 was not enough for the extremes: a near-black seed in dark mode needs to
 * travel most of the ramp, and stopping early returned a value that failed the
 * very check the walk exists to satisfy. `validateTheme` is still the backstop
 * if a seed cannot be made legible at all.
 */
const LEGIBILITY_MAX_STEPS = 32;

/**
 * Derive a full brand ramp (hover, soft tint, readable contrast, focus ring)
 * from a single primary color. Operates in sRGB; contrast uses WCAG luminance.
 *
 * The brand color doubles as *text* on its own soft tint (soft buttons, badges,
 * selected nav items) and as link text on the quietest page surface. A raw
 * accent frequently fails AA in one or both places — a mid-tone blue that reads
 * fine on a light tint drops to ~2.7:1 on the dark one, and a mid-tone rose
 * lands at 4.37:1 on the dark subtle band — so by default the primary is walked
 * darker (light mode) or lighter (dark mode) until it clears both.
 * Pass `ensureLegible: false` to keep the color verbatim.
 */
export const deriveBrandRamp = (
  primary: string,
  mode: 'light' | 'dark' = 'light',
  options: { ensureLegible?: boolean } = {},
): BrandRamp => {
  const { ensureLegible = true } = options;

  const softFor = (color: Rgb) =>
    mode === 'light'
      ? mixColors(color, CONTRAST_LIGHT, 0.88)
      : mixColors(color, SOFT_DARK_BASE, 0.76);

  /** The quietest surface the brand is used as ink on — the hardest of the three. */
  const subtleBg = parseHex(treeThemes[mode].color.bg.subtle);

  const legible = (color: Rgb) =>
    contrastRatio(color, softFor(color)) >= AA_NORMAL &&
    contrastRatio(color, subtleBg) >= AA_NORMAL;

  let base = parseHex(primary);

  if (ensureLegible) {
    for (let step = 0; step < LEGIBILITY_MAX_STEPS && !legible(base); step += 1) {
      base = mode === 'light' ? darken(base, LEGIBILITY_STEP) : lighten(base, LEGIBILITY_STEP);
    }
  }

  // Same degeneracy guard, and the same threshold, as the derived state layer:
  // a near-black or near-white accent has no room in the preferred direction,
  // and a hover that equals its rest state is not a hover. `MIN_STATE_DELTA` in
  // contract.ts is what the validator asks for, so the ramp aims at it too.
  const hoverAmount = mode === 'light' ? 0.18 : 0.16;
  const preferredHover =
    mode === 'light' ? darken(base, hoverAmount) : lighten(base, hoverAmount);
  const flippedHover =
    mode === 'light' ? lighten(base, hoverAmount) : darken(base, hoverAmount);
  const hover =
    contrastRatio(preferredHover, base) >= MIN_STATE_DELTA ||
    contrastRatio(preferredHover, base) >= contrastRatio(flippedHover, base)
      ? preferredHover
      : flippedHover;
  const soft = softFor(base);

  return {
    primary: formatHex(base),
    hover: formatHex(hover),
    soft: formatHex(soft),
    contrast: formatHex(bestContrast(base, [CONTRAST_LIGHT, CONTRAST_DARK])),
    focusRing: withAlpha(base, 0.32),
  };
};

/**
 * The brand ramp as the CSS custom properties it maps to, ready to apply at
 * runtime (e.g. `el.style.setProperty(name, value)`) when an app lets users
 * pick their own accent color. Re-derive whenever the active theme flips.
 */
export const accentCssVariables = (
  accent: string,
  mode: 'light' | 'dark' = 'light',
): Record<string, string> => {
  const ramp = deriveBrandRamp(accent, mode);
  const base = treeThemes[mode].color;

  // The derived states have to move with the accent too. Setting only the five
  // brand variables used to leave `--tree-color-brand-press` and the selection
  // surface pointing at the previous accent, so a runtime accent switch changed
  // a button's rest colour but not its pressed colour.
  const derived = deriveStateColors(
    { ...base, brand: { ...ramp } } as unknown as SemanticColorInput,
    mode,
  );

  return {
    '--tree-color-brand-primary': ramp.primary,
    '--tree-color-brand-hover': ramp.hover,
    '--tree-color-brand-soft': ramp.soft,
    '--tree-color-brand-contrast': ramp.contrast,
    '--tree-color-focus-ring': ramp.focusRing,
    // Everything the brand ramp feeds. Listing only the five above left the
    // press fill, the tint states and the selection surface pointing at the
    // previous accent.
    ...Object.fromEntries(
      Object.entries(derived.brand).map(([key, value]) => [`--tree-color-brand-${key}`, value]),
    ),
    ...Object.fromEntries(
      Object.entries(derived.state)
        .filter(([key]) => key.startsWith('selected-'))
        .map(([key, value]) => [`--tree-color-state-${key}`, value]),
    ),
  };
};

/**
 * Generate a brand overlay theme from a single primary color. The result only
 * overrides the brand-related variables, so it layers on top of the active
 * light/dark neutrals already provided by the base stylesheet.
 *
 * @example
 * createBrandTheme('acme', '#7c3aed');
 * // [data-tree-theme="acme"] { --tree-color-brand-primary: #7c3aed; ... }
 */
export const createBrandTheme = (
  name: string,
  primary: string,
  options: BrandThemeOptions = {},
): string => {
  const { mode = 'light', overrides, selector = `[data-tree-theme="${name}"]` } = options;
  const ramp = { ...deriveBrandRamp(primary, mode), ...overrides };

  const declarations = renderDeclarationBlock([
    ['--tree-color-brand-primary', ramp.primary],
    ['--tree-color-brand-hover', ramp.hover],
    ['--tree-color-brand-soft', ramp.soft],
    ['--tree-color-brand-contrast', ramp.contrast],
    ['--tree-color-focus-ring', ramp.focusRing],
  ]);

  return `${selector} {\n${declarations}\n}`;
};

type NestedColorOverrides = {
  [key: string]: string | NestedColorOverrides;
};

export interface ThemeColorOverrides {
  color?: NestedColorOverrides;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepMergeTokens = (base: TokenRecord, overrides: TokenRecord): TokenRecord => {
  const result: TokenRecord = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    const current = result[key];

    if (isPlainObject(value) && isPlainObject(current)) {
      result[key] = deepMergeTokens(current as TokenRecord, value as TokenRecord);
    } else if (value !== undefined) {
      result[key] = value as TokenValue | TokenRecord;
    }
  }

  return result;
};

/**
 * Generate a full custom theme by deep-merging explicit color overrides onto a
 * base theme (`light` or `dark`). Emits every `--tree-color-*` variable, so the
 * generated block is self-contained rather than an overlay.
 */
export const createCustomThemeCss = (
  name: string,
  overrides: ThemeColorOverrides,
  options: { base?: TreeThemeName; selector?: string } = {},
): string => {
  const { base = 'light', selector = `[data-tree-theme="${name}"]` } = options;
  const merged = deepMergeTokens(
    treeThemes[base] as TokenRecord,
    overrides as unknown as TokenRecord,
  );

  // Derived states are recomputed from the *merged* semantics, so an override
  // carries its own hover, press, selected and disabled with it.
  return renderThemeBlock(
    selector,
    (merged as { color: unknown }).color as SemanticColorInput,
    base === 'dark' ? 'dark' : 'light',
  );
};
