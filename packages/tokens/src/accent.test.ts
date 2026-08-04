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
