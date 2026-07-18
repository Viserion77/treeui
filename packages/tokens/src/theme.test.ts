import {
  accentCssVariables,
  bestContrast,
  contrastRatio,
  createBrandTheme,
  createCustomThemeCss,
  darken,
  deriveBrandRamp,
  formatHex,
  lighten,
  mixColors,
  parseHex,
  relativeLuminance,
  withAlpha,
} from './index';

describe('@treeui/tokens color helpers', () => {
  it('parses and formats hex colors, expanding shorthand', () => {
    expect(parseHex('#2057d4')).toEqual({ r: 32, g: 87, b: 212 });
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(formatHex({ r: 32, g: 87, b: 212 })).toBe('#2057d4');
  });

  it('throws on invalid hex input', () => {
    expect(() => parseHex('blue')).toThrow(/Invalid hex color/);
    expect(() => parseHex('#12')).toThrow(/Invalid hex color/);
  });

  it('mixes, darkens, and lightens colors', () => {
    expect(mixColors({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 0.5)).toEqual({
      r: 127.5,
      g: 127.5,
      b: 127.5,
    });

    const base = parseHex('#2057d4');
    expect(relativeLuminance(darken(base, 0.3))).toBeLessThan(relativeLuminance(base));
    expect(relativeLuminance(lighten(base, 0.3))).toBeGreaterThan(relativeLuminance(base));
  });

  it('computes WCAG contrast and picks the most readable candidate', () => {
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };
    expect(contrastRatio(white, black)).toBeCloseTo(21, 0);

    // A dark brand reads best on white; a light brand reads best on near-black.
    expect(bestContrast(parseHex('#2057d4'), [white, black])).toEqual(white);
    expect(bestContrast(parseHex('#fde68a'), [white, black])).toEqual(black);
  });

  it('formats rgba with alpha', () => {
    expect(withAlpha({ r: 32, g: 87, b: 212 }, 0.32)).toBe('rgba(32, 87, 212, 0.32)');
  });
});

describe('@treeui/tokens theme generator', () => {
  it('derives a brand ramp from a single primary (light mode)', () => {
    const ramp = deriveBrandRamp('#2057d4');
    const primary = parseHex(ramp.primary);

    expect(ramp.primary).toBe('#2057d4');
    // hover is darker, soft is a near-white tint
    expect(relativeLuminance(parseHex(ramp.hover))).toBeLessThan(relativeLuminance(primary));
    expect(relativeLuminance(parseHex(ramp.soft))).toBeGreaterThan(0.7);
    expect(ramp.contrast).toBe('#ffffff');
    expect(ramp.focusRing).toBe('rgba(32, 87, 212, 0.32)');
  });

  it('flips hover and soft direction in dark mode', () => {
    const ramp = deriveBrandRamp('#74a2ff', 'dark');
    const primary = parseHex(ramp.primary);

    expect(relativeLuminance(parseHex(ramp.hover))).toBeGreaterThan(relativeLuminance(primary));
    expect(relativeLuminance(parseHex(ramp.soft))).toBeLessThan(relativeLuminance(primary));
  });

  it('lightens a mid-tone accent in dark mode until it is readable on its own tint', () => {
    // Regression: #0969da reads fine on a light tint but lands at ~2.7:1 on the
    // dark one, so soft buttons/badges/selected nav became unreadable.
    const raw = parseHex('#0969da');
    const ramp = deriveBrandRamp('#0969da', 'dark');
    const primary = parseHex(ramp.primary);

    expect(relativeLuminance(primary)).toBeGreaterThan(relativeLuminance(raw));
    expect(contrastRatio(primary, parseHex(ramp.soft))).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps an already-legible accent verbatim, and can be opted out of', () => {
    expect(deriveBrandRamp('#2057d4', 'light').primary).toBe('#2057d4');
    expect(deriveBrandRamp('#0969da', 'dark', { ensureLegible: false }).primary).toBe('#0969da');
  });

  it('flips the on-brand text color with the derived brand color', () => {
    // Dark mode lightens the brand, so text on top of it must go dark.
    expect(deriveBrandRamp('#0969da', 'light').contrast).toBe('#ffffff');
    expect(deriveBrandRamp('#0969da', 'dark').contrast).toBe('#1c2128');
  });

  it('maps the ramp onto runtime-applicable css variables', () => {
    const vars = accentCssVariables('#0969da', 'dark');

    expect(Object.keys(vars)).toEqual([
      '--tree-color-brand-primary',
      '--tree-color-brand-hover',
      '--tree-color-brand-soft',
      '--tree-color-brand-contrast',
      '--tree-color-focus-ring',
    ]);
    expect(vars['--tree-color-brand-primary']).toBe(deriveBrandRamp('#0969da', 'dark').primary);
  });

  it('emits a brand overlay scoped to the theme attribute', () => {
    const css = createBrandTheme('acme', '#7c3aed');

    expect(css).toContain('[data-tree-theme="acme"]');
    expect(css).toContain('--tree-color-brand-primary: #7c3aed;');
    expect(css).toContain('--tree-color-brand-hover:');
    expect(css).toContain('--tree-color-brand-soft:');
    expect(css).toContain('--tree-color-brand-contrast:');
    expect(css).toContain('--tree-color-focus-ring: rgba(124, 58, 237, 0.32);');
    // overlay only touches brand-related vars
    expect(css).not.toContain('--tree-color-bg-primary');
  });

  it('lets explicit overrides win and accepts a custom selector', () => {
    const css = createBrandTheme('acme', '#7c3aed', {
      selector: '.brand-acme',
      overrides: { hover: '#5b21b6' },
    });

    expect(css).toContain('.brand-acme {');
    expect(css).toContain('--tree-color-brand-hover: #5b21b6;');
  });

  it('builds a full custom theme by merging overrides onto a base theme', () => {
    const css = createCustomThemeCss(
      'acme',
      { color: { brand: { primary: '#7c3aed' } } },
      { base: 'dark' },
    );

    expect(css).toContain('[data-tree-theme="acme"]');
    expect(css).toContain('color-scheme: dark');
    // overridden value
    expect(css).toContain('--tree-color-brand-primary: #7c3aed;');
    // untouched neutrals inherited from the dark base
    expect(css).toContain('--tree-color-bg-surface: #22272e;');
  });
});
