/**
 * Deliverable 1 of the colour-contract migration: this product's theme.
 *
 * The prompt that produced this file is `docs/ai/PROMPTS/adopt-colour-contract.md`
 * in the TreeUI repo. It is the seed and nothing else — no `--tree-color-*` is
 * written by hand anywhere in this app, and no interaction state (hover, press,
 * selected, disabled) is computed here. Those are the library's, derived from
 * what is below.
 *
 * This dashboard is the awkward case on purpose: it does not have ONE brand
 * colour, it has an accent PICKER, presets plus a free custom value. So there is
 * no single theme to validate — there is a range a user can reach, and the
 * product's job is to know where that range stops passing. `checkAccent` is what
 * the settings drawer asks at pick time and what `scripts/check-theme.ts` asks
 * in CI, so the two can never disagree.
 */
import { createValidatedThemePair, formatValidationResult } from '@treeui/tokens';

/** Also the `defaultAccent` given to `useTheme` — declared once, read twice. */
export const DEFAULT_ACCENT = '#0969da';

export interface AccentPreset {
  label: string;
  value: string;
}

/**
 * The accents this product offers. Every one is validated by `check:theme`, so
 * a preset that fails contrast cannot reach a build — which is the whole reason
 * they live here instead of inline in the settings drawer.
 */
export const accentPresets: AccentPreset[] = [
  { label: 'Ocean blue', value: DEFAULT_ACCENT },
  { label: 'Forest green', value: '#1a7f37' },
  { label: 'Grape violet', value: '#6d28d9' },
  { label: 'Clay orange', value: '#c2410c' },
  { label: 'Rosewood', value: '#be185d' },
];

export interface AccentCheck {
  accent: string;
  valid: boolean;
  /** One line per failing pair, already human-readable. Empty when valid. */
  problems: string[];
  /** Full validator output, for the CI reporter. */
  report: string;
}

/**
 * Run one candidate accent through the library's contract, both modes.
 *
 * A malformed value is a failure rather than a throw: this is called with
 * whatever a colour input produced, and a half-typed `#12` must not take the
 * settings drawer down.
 */
export const checkAccent = (accent: string): AccentCheck => {
  try {
    const { results, valid } = createValidatedThemePair({ accent });

    return {
      accent,
      valid,
      problems: results.flatMap((result) => result.errors.map((issue) => issue.message)),
      report: results.map(formatValidationResult).join('\n'),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      accent,
      valid: false,
      problems: [`${accent} is not a colour the contract can measure: ${message}`],
      report: message,
    };
  }
};
