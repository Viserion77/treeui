import { contrastRatio, parseHex, treeThemes, treeTokens } from './index';

/**
 * TREEUX-027 / TREEUX-034. The consumers asked for an accent because a raw
 * secondary brand colour failed AA on the light surface (`#A16CFF` measured
 * 3.23:1). Shipping a token instead of a hex is only an improvement if the
 * token is measured, so the pair is pinned here: the accent has to be at least
 * as legible as the brand pair the library already ships, on every background
 * and on its own soft tint.
 */
const AA_NORMAL = 4.5;

const ratio = (a: string, b: string) => contrastRatio(parseHex(a), parseHex(b));

describe.each(['light', 'dark'] as const)('%s accent pair', (themeName) => {
  const { color } = treeThemes[themeName];
  const backgrounds = [
    ['bg-primary', color.bg.primary],
    ['bg-surface', color.bg.surface],
    ['bg-subtle', color.bg.subtle],
  ] as const;

  it.each(backgrounds)('is legible on %s', (_name, background) => {
    // The brand pair is the bar: the accent may not be a step backwards from
    // the colour the library already asks products to read text in.
    expect(ratio(color.accent.primary, background)).toBeGreaterThanOrEqual(
      Math.min(AA_NORMAL, ratio(color.brand.primary, background)),
    );
  });

  it('is legible as text on its own soft tint', () => {
    expect(ratio(color.accent.primary, color.accent.soft)).toBeGreaterThanOrEqual(
      Math.min(AA_NORMAL, ratio(color.brand.primary, color.brand.soft)),
    );
  });

  it('has a contrast colour that reads on the solid accent', () => {
    expect(ratio(color.accent.contrast, color.accent.primary)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('carries the same ramp shape as the brand, so themes stay swappable', () => {
    expect(Object.keys(color.accent).sort()).toEqual(Object.keys(color.brand).sort());
  });
});

describe('marketing-scale elevation', () => {
  it('extends the shadow scale past md', () => {
    expect(Object.keys(treeTokens.shadow)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'accent']);
  });

  it('derives the accent shadow from the accent axis, not a fixed colour', () => {
    expect(treeTokens.shadow.accent).toContain('var(--tree-color-accent-primary)');
  });
});

describe('type scale (TREEUX-049)', () => {
  // `2xl` used to repeat `xl` verbatim, which made every `clamp(xl … 2xl)` a
  // constant — 12 of them in one consumer's landing pages. A scale with two
  // equal steps is a scale with a missing step; this keeps it monotonic.
  const order = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const;
  const rem = (value: string) => Number.parseFloat(value);

  it('is strictly increasing, with no duplicated step', () => {
    const sizes = order.map((name) => rem(treeTokens.font.size[name]));
    for (let index = 1; index < sizes.length; index += 1) {
      expect(sizes[index]).toBeGreaterThan(sizes[index - 1]);
    }
  });

  it('keeps `base` an alias of `md` rather than a step of its own', () => {
    expect(treeTokens.font.size.base).toBe(treeTokens.font.size.md);
  });
});
