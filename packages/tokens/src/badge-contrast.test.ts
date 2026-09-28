import { describe, expect, it } from 'vitest';
import { contrastRatio, type Rgb } from './color';
import {
  NATIVE_BADGE_TONES,
  NATIVE_BADGE_TONE_NAMES,
  NATIVE_BADGE_VARIANTS,
  resolveBadgeTone,
  resolveNativeTokens,
  type NativeRgba,
} from './native';

/**
 * The badge's colour floor, measured.
 *
 * This test exists because the web did not have it. The tint ink used to be the
 * tone's full-strength colour painted on the tone's own tint, which measured
 * 4.19:1 to 4.49:1 across the ten tone/theme pairs — eight of them below AA,
 * including `variant="soft" tone="neutral"`, which is both defaults. Nothing
 * caught it: `CONTRAST_PAIRS` in `contract.ts` checks the semantic layer against
 * the three surfaces, and a component's own pairing of two semantic colours is
 * not in that list.
 *
 * It was found by rendering. The Compose and egui ports each measure this
 * matrix in their own suites, and both failed here independently before the web
 * did. That is the argument for a port paying its way: a second and third
 * implementation of one contract is a second and third chance to measure it.
 */

/** WCAG 1.4.3 — normal-size text. */
const AA_TEXT = 4.5;

const tokens = resolveNativeTokens();

/** A badge's fill may be absent or translucent; the surface is what the ink sits on. */
const over = (top: NativeRgba | null, backdrop: NativeRgba): Rgb => {
  if (!top) return backdrop;

  const a = Math.min(1, Math.max(0, top.a));
  const mix = (x: number, y: number) => Math.round(x * a + y * (1 - a));

  return { r: mix(top.r, backdrop.r), g: mix(top.g, backdrop.g), b: mix(top.b, backdrop.b) };
};

describe('every badge the API can express has a legible label', () => {
  it.each(['light', 'dark'] as const)('%s: every variant x tone clears AA', (theme) => {
    const palette = tokens.themes[theme];
    const surface = palette.color['color-bg-surface'];
    const failures: string[] = [];

    for (const tone of NATIVE_BADGE_TONE_NAMES) {
      for (const variant of NATIVE_BADGE_VARIANTS) {
        const { bg, text } = resolveBadgeTone(palette, tone, variant);
        const ratio = contrastRatio(text, over(bg, surface));

        if (ratio < AA_TEXT) {
          failures.push(`${variant}/${tone} = ${ratio.toFixed(2)}:1`);
        }
      }
    }

    expect(
      failures,
      `${failures.length} badge combinations below ${AA_TEXT}:1 in the ${theme} theme`,
    ).toEqual([]);
  });

  it('paints the tint with the ink derived for a tint, not with the full-strength tone', () => {
    // The specific regression the test above would catch, named so the reason
    // survives: `*-on-soft` deepens as the tint deepens, and the tone's own
    // colour does not.
    for (const tone of NATIVE_BADGE_TONE_NAMES) {
      expect(NATIVE_BADGE_TONES[tone].soft.text, `soft/${tone}`).toMatch(/-on-soft$/);
      expect(NATIVE_BADGE_TONES[tone].danger.text, `danger/${tone}`).toMatch(/-on-soft$/);
    }
  });

  it('measures the default badge with headroom, not on the line', () => {
    // `variant="soft" tone="neutral"` is what `<TBadge>` renders with no props.
    // It measured 4.49:1 in the dark theme before this was fixed — a rounding
    // step away from passing, which is how it survived review.
    for (const theme of ['light', 'dark'] as const) {
      const palette = tokens.themes[theme];
      const { bg, text } = resolveBadgeTone(palette, 'neutral', 'soft');
      const ratio = contrastRatio(text, over(bg, palette.color['color-bg-surface']));

      expect(ratio, `the default badge in the ${theme} theme`).toBeGreaterThanOrEqual(AA_TEXT);
    }
  });
});
