import { contrastRatio, parseHex, treeThemes } from './index';

/**
 * The colour contract already holds every status hue at 4.5:1 on all three
 * surfaces — the validator fails the build below that. This file holds the
 * *margin* instead, and it exists because a pass by 0.0008 is a coincidence,
 * not a margin.
 *
 * A status line is the one piece of text a product is most likely to re-measure
 * itself, on the surface it most often lands on: `bg.subtle`, inside a card or
 * under a field. When the shipped value sits exactly on the floor, two correct
 * implementations of WCAG 2.x disagree about whether it passes, and the answer
 * depends on rounding. So the floor is the contract's job and the headroom is
 * this file's: enough that an independent measurement lands on the same verdict.
 */
const AA_NORMAL = 4.5;
const HEADROOM = 4.6;

const ratio = (a: string, b: string) => contrastRatio(parseHex(a), parseHex(b));

describe.each(['light', 'dark'] as const)('%s status hues', (themeName) => {
  const { color } = treeThemes[themeName];
  const statuses = Object.entries(color.status) as [string, string][];
  const surfaces = Object.entries(color.bg) as [string, string][];

  it.each(statuses)('%s clears the AA floor on every surface', (_name, value) => {
    for (const [, background] of surfaces) {
      expect(ratio(value, background)).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it.each(statuses)('%s clears it with margin on bg-subtle, the tightest band', (_name, value) => {
    expect(ratio(value, color.bg.subtle)).toBeGreaterThanOrEqual(HEADROOM);
  });

  it('is tightest on bg-subtle, which is why that band is the one pinned', () => {
    for (const [, value] of statuses) {
      expect(ratio(value, color.bg.subtle)).toBeLessThanOrEqual(ratio(value, color.bg.surface));
    }
  });
});
