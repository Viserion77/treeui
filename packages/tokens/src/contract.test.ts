import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';

import { contrastRatio, parseHex } from './color';
import {
  CONTRACT_VERSION,
  CONTRAST_PAIRS,
  REQUIRED_TOKENS,
  SEMANTIC_TOKENS,
} from './contract';
import { createStylesheet, createThemesStylesheet } from './css';
import { treePrimitives } from './primitives';
import { createThemePair, createValidatedThemePair } from './seed';
import { deriveStateColors } from './states';
import { treeThemes } from './tokens';
import { formatValidationResult, validateTheme } from './validate';

/**
 * The colour contract, enforced.
 *
 * `VALIDATION.yaml` has said "no raw color values; always var(--tree-*)" since
 * v0.2, and nothing checked it — there is no stylelint in the repo and ESLint
 * does not read `.css`. The layer rules below are the enforcement.
 */

const findRepoRoot = () => {
  let current = process.cwd();

  while (!readdirSync(current).includes('pnpm-workspace.yaml')) {
    const parent = dirname(current);
    if (parent === current) throw new Error(`No workspace root above ${process.cwd()}`);
    current = parent;
  }

  return current;
};

const repoRoot = findRepoRoot();

const readFiles = (dir: string, extensions: string[]): [string, string][] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        extensions.includes(extname(entry.name)) &&
        !entry.name.includes('.test.'),
    )
    .map((entry) => {
      const path = join(entry.parentPath, entry.name);
      return [relative(repoRoot, path), readFileSync(path, 'utf8')];
    });

/** Blank out comments so an illustrative `#0969da` in prose is not a violation. */
const stripComments = (source: string) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (match) => match.replace(/[^\n]/g, ' '));

describe(`@treeui/tokens colour contract v${CONTRACT_VERSION}`, () => {
  describe('layer 1 — primitives are invisible to everything downstream', () => {
    it('emits no primitive as a CSS custom property', () => {
      const css = `${createStylesheet()}\n${createThemesStylesheet()}`;

      // A primitive leaking into the emitted names would give products a
      // `--tree-blue-500` to theme against, which is the whole thing this
      // layering exists to prevent.
      for (const group of Object.keys(treePrimitives)) {
        expect(css).not.toContain(`--tree-${group}-`);
      }
    });

    it('holds every literal colour in the system', () => {
      const sources = [
        ...readFiles(join(repoRoot, 'packages/vue/src'), ['.vue', '.css', '.ts']),
        ...readFiles(join(repoRoot, 'packages/react/src'), ['.tsx', '.css', '.ts']),
        ...readFiles(join(repoRoot, 'packages/tokens/src'), ['.ts']),
      ].filter(([path]) => !path.endsWith('primitives.ts'));

      const offenders: string[] = [];

      for (const [path, source] of sources) {
        const code = stripComments(source);

        // `&#039;` and friends are HTML entities, not colours.
        const hexes = [...code.matchAll(/(^|[^&#\w])(#[0-9a-fA-F]{3,8})\b/g)].map(
          (match) => match[2],
        );
        const functions = [...code.matchAll(/\b(?:rgba?|hsla?)\([^)]*\)/g)].map(
          (match) => match[0],
        );

        for (const value of [...hexes, ...functions]) {
          // The generator legitimately composes a colour function over a token
          // or over interpolated channels; neither is a literal colour.
          if (value.includes('var(--tree-') || value.includes('${')) continue;
          offenders.push(`${path}: ${value}`);
        }
      }

      expect(offenders).toEqual([]);
    });
  });

  describe('layer 2 — the semantic list is complete and emitted', () => {
    it.each(['light', 'dark'] as const)('%s theme defines every required token', (mode) => {
      const color = treeThemes[mode].color as unknown as Record<string, unknown>;

      for (const token of REQUIRED_TOKENS) {
        const value = token.path
          .split('.')
          .reduce<unknown>(
            (node, key) =>
              typeof node === 'object' && node !== null
                ? (node as Record<string, unknown>)[key]
                : undefined,
            color,
          );

        expect(value, `${token.name} (${token.path})`).toBeTypeOf('string');
      }
    });

    it('emits every semantic token name into the stylesheet', () => {
      const css = createThemesStylesheet();

      for (const token of SEMANTIC_TOKENS) {
        // `border-interactive` is optional and derived; it is emitted by the
        // derived layer, which this same stylesheet carries.
        expect(css, token.name).toContain(`${token.name}:`);
      }
    });
  });

  describe('layer 3 — derived states are emitted and never left to the call site', () => {
    it.each(['light', 'dark'] as const)('%s emits a complete derived set', (mode) => {
      const derived = deriveStateColors(treeThemes[mode].color as never, mode);
      const css = createThemesStylesheet();

      for (const [group, entries] of Object.entries(derived)) {
        for (const [key, value] of Object.entries(entries as Record<string, string>)) {
          expect(css, `--tree-color-${group}-${key}`).toContain(
            `--tree-color-${group}-${key}: ${value};`,
          );
        }
      }
    });

    it('gives press a bigger step than hover, in both modes', () => {
      for (const mode of ['light', 'dark'] as const) {
        const color = treeThemes[mode].color;
        const derived = deriveStateColors(color as never, mode);
        const base = parseHex(color.brand.primary);

        expect(
          contrastRatio(parseHex(derived.brand.press), base),
        ).toBeGreaterThan(contrastRatio(parseHex(color.brand.hover), base));
      }
    });
  });

  describe('phase 4 — validation', () => {
    it.each(['light', 'dark'] as const)('the shipped %s theme passes its own contract', (mode) => {
      const result = validateTheme(treeThemes[mode].color as never, mode, {
        label: `treeui-${mode}`,
      });

      expect(formatValidationResult(result)).toContain('PASS');
      expect(result.errors).toEqual([]);
      expect(result.measurements.length).toBe(CONTRAST_PAIRS.length);
    });

    it('reports the failing pair, its values and the measured ratio', () => {
      const broken = structuredClone(treeThemes.light.color) as unknown as Record<
        string,
        Record<string, string>
      >;
      broken.text.muted = '#d8dde3';

      const result = validateTheme(broken as never, 'light', { label: 'broken' });

      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.message.includes('text.muted'))).toBe(true);
      expect(result.errors.some((error) => error.message.includes('#d8dde3'))).toBe(true);
      expect(result.errors.some((error) => error.message.includes('below 4.5:1'))).toBe(true);
    });

    it('fails a theme that is missing a required token', () => {
      const incomplete = structuredClone(treeThemes.light.color) as unknown as Record<
        string,
        Record<string, string>
      >;
      delete incomplete.brand.contrast;

      const result = validateTheme(incomplete as never, 'light');

      expect(result.valid).toBe(false);
      expect(result.errors[0].kind).toBe('missing-token');
      expect(result.errors[0].message).toContain('--tree-color-brand-contrast');
    });

    it('fails a state that is not distinguishable from its base', () => {
      const flat = structuredClone(treeThemes.light.color) as unknown as Record<
        string,
        Record<string, string>
      >;
      flat.brand.hover = flat.brand.primary;

      const result = validateTheme(flat as never, 'light');

      expect(result.errors.some((error) => error.kind === 'state-distinction')).toBe(true);
      expect(
        result.errors.some((error) => error.message.includes('no visible feedback')),
      ).toBe(true);
    });

    it('rejects a non-hex value in a slot that has to be measurable', () => {
      const opaque = structuredClone(treeThemes.light.color) as unknown as Record<
        string,
        Record<string, string>
      >;
      opaque.brand.primary = 'rgba(9, 105, 218, 0.8)';

      const result = validateTheme(opaque as never, 'light');

      expect(result.valid).toBe(false);
      expect(result.errors[0].kind).toBe('unreadable');
    });
  });

  describe('phase 3 — seeding', () => {
    /**
     * The seeds are chosen to cover the shapes that broke the engine while it
     * was being written: near-black and near-white (no room to step), a
     * high-luminance lime (hover ran out of headroom), and a cyan whose derived
     * ink passed before rounding and failed after.
     */
    const SEEDS = [
      '#7c3aed',
      '#e11d48',
      '#0f766e',
      '#f59e0b',
      '#111827',
      '#ffffff',
      '#000000',
      '#84cc16',
      '#06b6d4',
      '#a855f7',
      '#64748b',
      '#dc2626',
    ];

    it.each(SEEDS)('a theme seeded with %s is valid in both modes', (accent) => {
      const { results, valid } = createValidatedThemePair({ accent }, { label: accent });

      expect(results.map(formatValidationResult).join('\n')).toContain('PASS');
      expect(valid).toBe(true);
    });

    it('keeps a neutral tint from moving contrast', () => {
      // Tinting the neutrals used to darken them and drop four status colours
      // below AA. The tint is hue-only now.
      const { valid, results } = createValidatedThemePair(
        { accent: '#7c3aed', neutral: '#7c3aed' },
        { label: 'tinted' },
      );

      expect(results.map(formatValidationResult).join('\n')).not.toContain('FAIL');
      expect(valid).toBe(true);
    });

    it('computes on-accent ink per theme rather than fixing it', () => {
      const lightOnDarkSeed = createThemePair({ accent: '#111827' });

      // A near-black accent takes white ink in light mode; the dark theme
      // lightens the accent far enough that dark ink wins.
      expect(lightOnDarkSeed.light.brand.contrast).toBe('#ffffff');
      expect(lightOnDarkSeed.dark.brand.contrast).not.toBe('#ffffff');
    });

    it('leaves status colours alone unless the product seeds them', () => {
      const themes = createThemePair({ accent: '#dc2626' });

      expect(themes.light.status.success).toBe(treeThemes.light.status?.success ?? treeThemes.light.color.status.success);
      expect(createThemePair({ accent: '#dc2626', status: { success: '#00ff00' } }).light.status.success).toBe(
        '#00ff00',
      );
    });

    it('routes an override through the same validation', () => {
      const { valid, results } = createValidatedThemePair({
        accent: '#7c3aed',
        overrides: { light: { text: { muted: '#cfd6dd' } } },
      });

      expect(valid).toBe(false);
      expect(results[0].errors.some((error) => error.message.includes('text.muted'))).toBe(true);
    });
  });
});
