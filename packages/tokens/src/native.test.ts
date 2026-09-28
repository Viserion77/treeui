import { describe, expect, it } from 'vitest';
import { SEMANTIC_TOKENS } from './contract';
import {
  NATIVE_TOKEN_GROUPS,
  NATIVE_TONE_NAMES,
  NATIVE_TONE_SLOTS,
  ROOT_FONT_SIZE_PX,
  nativeFoundationKeys,
  nativeParityReport,
  resolveNativeTokens,
  resolveTone,
} from './native';

const tokens = resolveNativeTokens();

describe('the native model covers the stylesheet', () => {
  // The gate that makes a second and third ecosystem safe to ship. Adding a
  // token to `tokens.ts` without teaching `native.ts` how to resolve it turns
  // the Compose and egui packages into stale copies of the design system, and a
  // stale copy is worse than no copy: it still looks authoritative.
  it('resolves every token the stylesheet emits', () => {
    const report = nativeParityReport();
    expect(report.missing).toEqual([]);
    expect(report.emitted.length).toBeGreaterThan(0);
  });

  it('carries every REQUIRED semantic colour in both themes', () => {
    const required = SEMANTIC_TOKENS.filter((spec) => spec.requirement === 'required').map(
      (spec) => spec.name.replace(/^--tree-/, ''),
    );

    for (const theme of ['light', 'dark'] as const) {
      const present = Object.keys(tokens.themes[theme].color);
      expect(required.filter((name) => !present.includes(name))).toEqual([]);
    }
  });

  it('gives both themes the same shape, so one palette type fits both', () => {
    const shape = (theme: 'light' | 'dark') => ({
      color: Object.keys(tokens.themes[theme].color).sort(),
      shadow: Object.keys(tokens.themes[theme].shadow).sort(),
      gradient: Object.keys(tokens.themes[theme].gradient).sort(),
    });

    expect(shape('light')).toEqual(shape('dark'));
  });

  it('claims every foundation token in exactly one emitter group', () => {
    // Both emitters throw on an unclaimed token, but they only run at codegen
    // time. This says the same thing in the unit suite, where it is cheap.
    for (const token of nativeFoundationKeys(tokens)) {
      const owners = NATIVE_TOKEN_GROUPS.filter((group) => token.startsWith(group.prefix));
      expect(owners.length, `"${token}" is claimed by ${owners.length} groups`).toBe(1);
    }
  });
});

describe('resolution', () => {
  it('converts rem against the root size the model declares', () => {
    // 1rem of spacing is `space-4` in this scale.
    expect(tokens.lengthPx['space-4']).toBe(ROOT_FONT_SIZE_PX);
    expect(tokens.rootFontSizePx).toBe(ROOT_FONT_SIZE_PX);
  });

  it('resolves a colour-mix into a real alpha rather than leaving it as CSS', () => {
    const accent = tokens.themes.light.shadow['shadow-accent'];
    expect(accent).toHaveLength(1);
    expect(accent[0].color.a).toBeCloseTo(0.6, 4);
    // The accent shadow is tinted by the accent, so it is not the umbra.
    expect(accent[0].color).not.toEqual(tokens.themes.light.color['color-shadow-rgb']);
  });

  it('tints the elevation scale per theme', () => {
    // A slate umbra is invisible on a dark surface; the dark theme's is
    // near-black. One shadow for both themes is the bug this catches.
    const light = tokens.themes.light.shadow['shadow-xs'][0].color;
    const dark = tokens.themes.dark.shadow['shadow-xs'][0].color;
    expect({ r: dark.r, g: dark.g, b: dark.b }).toEqual({ r: 0, g: 0, b: 0 });
    expect(light).not.toEqual(dark);
  });

  it('keeps a gradient as geometry, not as a string', () => {
    const brand = tokens.themes.light.gradient['gradient-brand'];
    expect(brand.angleDeg).toBe(135);
    expect(brand.stops).toHaveLength(2);
    expect(brand.stops[0].color).toEqual(tokens.themes.light.color['color-brand-primary']);
  });
});

describe('tones', () => {
  it.each(NATIVE_TONE_NAMES)('resolves every slot of %s in both themes', (tone) => {
    for (const theme of ['light', 'dark'] as const) {
      const resolved = resolveTone(tokens.themes[theme], tone);
      expect(Object.keys(resolved).sort()).toEqual([...NATIVE_TONE_SLOTS].sort());
      for (const slot of NATIVE_TONE_SLOTS) {
        expect(resolved[slot], `${theme}/${tone}/${slot}`).toBeDefined();
      }
    }
  });

  it('gives the brand tone the brand colours, not a copy of them', () => {
    const palette = tokens.themes.light;
    expect(resolveTone(palette, 'brand').accent).toEqual(palette.color['color-brand-primary']);
    expect(resolveTone(palette, 'danger').accent).toEqual(palette.color['color-status-error']);
    // The neutral tone is deliberately ink, not a hue.
    expect(resolveTone(palette, 'neutral').accent).toEqual(palette.color['color-text-primary']);
  });
});
