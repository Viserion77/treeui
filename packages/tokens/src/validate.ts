/**
 * Phase 4 — validation as code.
 *
 * A theme contract is only a contract if something fails when it is broken.
 * This is the check products run in CI: it takes a theme, derives its states,
 * and proves three things.
 *
 *   1. Every required semantic token is present.
 *   2. Every text-on-background pair the library renders clears WCAG AA for its
 *      tier — 4.5:1 for normal text, 3:1 for large text and UI elements.
 *   3. Every interactive state is visibly different from the state it replaces.
 *
 * Failures name the pair, the two values, the measured ratio and the threshold,
 * so a red build says what to change rather than that something is wrong.
 *
 * @example
 * // theme.check.ts, run by `node --experimental-strip-types theme.check.ts`
 * import { assertThemeValid } from '@treeui/tokens';
 * assertThemeValid(myTheme, 'light', { label: 'acme-light' });
 */

import { contrastRatio, parseHex } from './color';
import {
  CONTRACT_VERSION,
  CONTRAST_PAIRS,
  REQUIRED_TOKENS,
  SEMANTIC_TOKENS,
  STATE_DISTINCTIONS,
  type ContrastTier,
} from './contract';
import { deriveStateColors, type ColorMode, type SemanticColorInput } from './states';

const TIER_MINIMUM: Record<ContrastTier, number> = {
  text: 4.5,
  'large-text': 3,
  ui: 3,
  none: 0,
};

export type ThemeIssueKind = 'missing-token' | 'contrast' | 'state-distinction' | 'unreadable';

export interface ThemeIssue {
  kind: ThemeIssueKind;
  /** Dotted paths involved, for programmatic handling. */
  tokens: string[];
  /** Human-readable, single line, safe to print in CI. */
  message: string;
  /** Present for contrast and distinction issues. */
  ratio?: number;
  required?: number;
}

export interface ThemeValidationResult {
  contractVersion: string;
  label: string;
  mode: ColorMode;
  valid: boolean;
  errors: ThemeIssue[];
  warnings: ThemeIssue[];
  /** Every pair that was measured, passing or not — useful for a report page. */
  measurements: Array<{
    foreground: string;
    background: string;
    ratio: number;
    required: number;
    where: string;
    passes: boolean;
  }>;
}

export interface ValidateThemeOptions {
  /** Name used in messages. Defaults to the mode. */
  label?: string;
  /**
   * Treat derived-token failures as warnings instead of errors. Off by default:
   * if the library derived an unreadable state from a product's seed, that is
   * the library's bug and it should be loud.
   */
  derivedAsWarnings?: boolean;
}

/** Read a dotted path out of a nested colour record. */
const at = (source: Record<string, unknown>, path: string): string | undefined => {
  let current: unknown = source;

  for (const segment of path.split('.')) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  return typeof current === 'string' ? current : undefined;
};

const isHex = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());

/**
 * Two decimals, unless that rounds a failing ratio up onto its own threshold —
 * a near miss then reads `4.50:1 is below 4.5:1`, which looks like a bug in the
 * validator to whoever has to fix it in CI. Add digits until the number shown
 * is visibly under the number required.
 */
const formatRatio = (ratio: number, required: number) => {
  for (let digits = 2; digits < 6; digits += 1) {
    const text = ratio.toFixed(digits);
    if (Number.parseFloat(text) < required) return text;
  }

  return ratio.toFixed(6);
};

/**
 * Merge the semantic layer with its derived states into one lookup, so a pair
 * spec can name `brand.primary` and `state.disabled-fg` the same way.
 */
const resolveAll = (color: SemanticColorInput, mode: ColorMode) => {
  const derived = deriveStateColors(color, mode);
  const source = color as unknown as Record<string, Record<string, string>>;

  return {
    ...source,
    border: { ...source.border, ...derived.border },
    brand: { ...source.brand, ...derived.brand },
    accent: { ...source.accent, ...derived.accent },
    status: { ...source.status, ...derived.status },
    state: derived.state,
  } as Record<string, unknown>;
};

/**
 * Validate one theme in one mode. Returns a result; never throws on a bad
 * theme, only on input that is not a theme at all.
 */
export const validateTheme = (
  color: SemanticColorInput,
  mode: ColorMode,
  options: ValidateThemeOptions = {},
): ThemeValidationResult => {
  const { label = mode, derivedAsWarnings = false } = options;
  const errors: ThemeIssue[] = [];
  const warnings: ThemeIssue[] = [];
  const measurements: ThemeValidationResult['measurements'] = [];

  const semantic = color as unknown as Record<string, unknown>;

  // 1. Required tokens ------------------------------------------------------
  for (const token of REQUIRED_TOKENS) {
    const value = at(semantic, token.path);

    if (value === undefined || value === '') {
      errors.push({
        kind: 'missing-token',
        tokens: [token.path],
        message:
          `[${label}] missing required token ${token.name} (${token.path}) — ${token.role} ` +
          `See @treeui/tokens contract v${CONTRACT_VERSION}.`,
      });
    }
  }

  // A hex-shaped token that is not a hex breaks every downstream derivation.
  for (const token of SEMANTIC_TOKENS) {
    if (token.nonHex) continue;

    const value = at(semantic, token.path);
    if (value === undefined) continue;

    if (!isHex(value)) {
      errors.push({
        kind: 'unreadable',
        tokens: [token.path],
        message:
          `[${label}] ${token.name} must be a 3- or 6-digit hex colour, got "${value}". ` +
          `Alpha and colour functions cannot be measured for contrast or stepped into states.`,
      });
    }
  }

  // Nothing further is measurable if the shape is wrong.
  if (errors.length > 0) {
    return {
      contractVersion: CONTRACT_VERSION,
      label,
      mode,
      valid: false,
      errors,
      warnings,
      measurements,
    };
  }

  const resolved = resolveAll(color, mode);

  // 2. Contrast pairs -------------------------------------------------------
  for (const pair of CONTRAST_PAIRS) {
    const foreground = at(resolved, pair.foreground);
    const background = at(resolved, pair.background);

    if (!foreground || !background || !isHex(foreground) || !isHex(background)) continue;

    const ratio = contrastRatio(parseHex(foreground), parseHex(background));
    const required = TIER_MINIMUM[pair.tier];
    const passes = ratio >= required;

    measurements.push({
      foreground: pair.foreground,
      background: pair.background,
      ratio,
      required,
      where: pair.where,
      passes,
    });

    if (passes) continue;

    const issue: ThemeIssue = {
      kind: 'contrast',
      tokens: [pair.foreground, pair.background],
      ratio,
      required,
      message:
        `[${label}] contrast ${formatRatio(ratio, required)}:1 is below ${required}:1 — ` +
        `${pair.foreground} (${foreground}) on ${pair.background} (${background}). ` +
        `${pair.where}.` +
        (pair.derived
          ? ' This pair is derived by the library from your seed; adjust the seed or override the semantic token it came from.'
          : ''),
    };

    if (pair.derived && derivedAsWarnings) warnings.push(issue);
    else errors.push(issue);
  }

  // 3. State distinction ----------------------------------------------------
  for (const distinction of STATE_DISTINCTIONS) {
    const state = at(resolved, distinction.state);
    const base = at(resolved, distinction.base);

    if (!state || !base || !isHex(state) || !isHex(base)) continue;

    const ratio = contrastRatio(parseHex(state), parseHex(base));

    if (ratio >= distinction.minRatio) continue;

    errors.push({
      kind: 'state-distinction',
      tokens: [distinction.state, distinction.base],
      ratio,
      required: distinction.minRatio,
      message:
        `[${label}] state is not distinguishable: ${distinction.state} (${state}) vs ` +
        `${distinction.base} (${base}) measures ${ratio.toFixed(3)}:1, below ` +
        `${distinction.minRatio}:1. ${distinction.where} would give no visible feedback.`,
    });
  }

  return {
    contractVersion: CONTRACT_VERSION,
    label,
    mode,
    valid: errors.length === 0,
    errors,
    warnings,
    measurements,
  };
};

/** Format a result the way it should appear in a CI log. */
export const formatValidationResult = (result: ThemeValidationResult): string => {
  const lines: string[] = [];
  const status = result.valid ? 'PASS' : 'FAIL';

  lines.push(
    `${status} @treeui/tokens colour contract v${result.contractVersion} — ` +
      `${result.label} (${result.mode}): ` +
      `${result.measurements.filter((m) => m.passes).length}/${result.measurements.length} pairs pass`,
  );

  for (const error of result.errors) lines.push(`  error  ${error.message}`);
  for (const warning of result.warnings) lines.push(`  warn   ${warning.message}`);

  return lines.join('\n');
};

/**
 * Validate and throw on failure. This is the CI entry point — a broken theme
 * should break the build, not print and continue.
 */
export const assertThemeValid = (
  color: SemanticColorInput,
  mode: ColorMode,
  options: ValidateThemeOptions = {},
): ThemeValidationResult => {
  const result = validateTheme(color, mode, options);

  if (!result.valid) {
    throw new Error(formatValidationResult(result));
  }

  return result;
};

/**
 * Validate both modes of a paired theme in one call, the common case for a
 * product that ships light and dark.
 */
export const validateThemePair = (
  themes: { light: SemanticColorInput; dark: SemanticColorInput },
  options: { label?: string } = {},
): ThemeValidationResult[] => {
  const label = options.label ? `${options.label}` : '';

  return [
    validateTheme(themes.light, 'light', { label: label ? `${label}-light` : 'light' }),
    validateTheme(themes.dark, 'dark', { label: label ? `${label}-dark` : 'dark' }),
  ];
};
