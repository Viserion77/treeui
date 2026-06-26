import {
  bestContrast,
  darken,
  formatHex,
  lighten,
  mixColors,
  parseHex,
  withAlpha,
  type Rgb,
} from './color';
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

export const createThemeCss = (
  themeName: TreeThemeName,
  selector = `[data-tree-theme="${themeName}"]`,
) => {
  const declarations = renderDeclarationBlock(
    flattenTokens(treeThemes[themeName] as TokenRecord),
  );
  const colorScheme = themeName === 'dark' ? 'dark' : 'light';

  return `${selector} {\n  color-scheme: ${colorScheme};\n${declarations}\n}`;
};

export const createDefaultThemeCss = (themeName: TreeThemeName) => {
  const declarations = renderDeclarationBlock(
    flattenTokens(treeThemes[themeName] as TokenRecord),
  );
  const colorScheme = themeName === 'dark' ? 'dark' : 'light';

  return `:root {\n  color-scheme: ${colorScheme};\n${declarations}\n}`;
};

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
const SOFT_DARK_BASE: Rgb = { r: 11, g: 18, b: 32 };
/** Near-black contrast candidate (matches the dark theme `text.inverse`). */
const CONTRAST_DARK: Rgb = { r: 7, g: 16, b: 31 };
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

/**
 * Derive a full brand ramp (hover, soft tint, readable contrast, focus ring)
 * from a single primary color. Operates in sRGB; contrast uses WCAG luminance.
 */
export const deriveBrandRamp = (
  primary: string,
  mode: 'light' | 'dark' = 'light',
): BrandRamp => {
  const base = parseHex(primary);
  const hover = mode === 'light' ? darken(base, 0.18) : lighten(base, 0.16);
  const soft =
    mode === 'light'
      ? mixColors(base, CONTRAST_LIGHT, 0.88)
      : mixColors(base, SOFT_DARK_BASE, 0.76);

  return {
    primary: formatHex(base),
    hover: formatHex(hover),
    soft: formatHex(soft),
    contrast: formatHex(bestContrast(base, [CONTRAST_LIGHT, CONTRAST_DARK])),
    focusRing: withAlpha(base, 0.32),
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
  const declarations = renderDeclarationBlock(flattenTokens(merged));
  const colorScheme = base === 'dark' ? 'dark' : 'light';

  return `${selector} {\n  color-scheme: ${colorScheme};\n${declarations}\n}`;
};
