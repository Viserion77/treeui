import { describe, expect, it } from 'vitest';
import { contrastRatio } from './color';
import { resolveNativeTokens } from './native';

/**
 * `TIconTile`'s colour floor, measured.
 *
 * The tile exists because a bare `TIcon` on a card was unreadable: it inherits
 * the text colour, carries a flat 2px stroke and has no ground behind it, and
 * at 26px on a phone it reads as a grey scratch. Giving it a ground is only an
 * improvement if the ground and the ink are far enough apart, which is the
 * thing a review cannot eyeball — so it is measured here, the way the badge's
 * floor already is.
 *
 * The floor is **3:1**, not 4.5:1. An icon is a non-text UI component under
 * WCAG 1.4.11, and holding a glyph to the text threshold would rule out tones
 * that are perfectly legible as shapes. The badge test next door uses 4.5:1
 * because a badge carries a WORD.
 */
const AA_NON_TEXT = 3;

/** Mirrors the `--tree-icon-tile-*` pairs in `.t-icon-tile--<tone>`. */
const TILE_TONES = {
  brand: { accent: 'color-brand-primary', soft: 'color-brand-soft' },
  neutral: { accent: 'color-text-primary', soft: 'color-bg-subtle' },
  success: { accent: 'color-status-success', soft: 'color-status-success-soft' },
  warning: { accent: 'color-status-warning', soft: 'color-status-warning-soft' },
  danger: { accent: 'color-status-error', soft: 'color-status-error-soft' },
  info: { accent: 'color-status-info', soft: 'color-status-info-soft' },
} as const;

const tokens = resolveNativeTokens();

describe('every TIconTile tone reads as a glyph', () => {
  it.each(['light', 'dark'] as const)('%s: every tone clears 3:1', (theme) => {
    const palette = tokens.themes[theme];
    const failures: string[] = [];

    for (const [tone, pair] of Object.entries(TILE_TONES)) {
      const ink = palette.color[pair.accent];
      const ground = palette.color[pair.soft];
      expect(ink, `${theme}/${tone}: missing ${pair.accent}`).toBeTruthy();
      expect(ground, `${theme}/${tone}: missing ${pair.soft}`).toBeTruthy();

      const ratio = contrastRatio(ink, ground);
      if (ratio < AA_NON_TEXT) failures.push(`${tone} = ${ratio.toFixed(2)}:1`);
    }

    expect(
      failures,
      `${failures.length} icon-tile tones below ${AA_NON_TEXT}:1 in the ${theme} theme`,
    ).toEqual([]);
  });

  it('names a tint token for the ground, never a full-strength colour', () => {
    // A tone painted on its own full-strength colour is the mistake the badge
    // made; the `*-soft` tints are derived for exactly this pairing.
    for (const [tone, pair] of Object.entries(TILE_TONES)) {
      expect(pair.soft, tone).toMatch(/-soft$|^color-bg-subtle$/);
    }
  });
});
