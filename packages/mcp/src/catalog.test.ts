// @vitest-environment node

import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createFoundationCss, createThemeCss } from '@treeui/tokens';
import { buildCatalogFromRepo } from './catalog-source';
import { recommendComponents, searchComponents, searchRecipes, searchTokens } from './catalog';

const repoRoot = path.resolve(import.meta.dirname, '../../..');

const parseDeclarations = (css: string) => {
  const declarations = new Map<string, string>();
  // `css.ts` joins the raw token keys, so camelCase names such as
  // `--tree-font-lineHeight-base` reach the stylesheet verbatim.
  const pattern = /(--tree-[A-Za-z0-9-]+):\s*([^;]+);/g;

  for (let match = pattern.exec(css); match; match = pattern.exec(css)) {
    declarations.set(match[1], match[2].trim());
  }

  return declarations;
};

describe('@treeui/mcp catalog', () => {
  it('builds a catalog that covers Storybook component entries', () => {
    const catalog = buildCatalogFromRepo(repoRoot);
    const names = new Set(catalog.components.map((component) => component.name));

    expect(names.has('TSelect')).toBe(true);
    expect(names.has('TCombobox')).toBe(true);
    expect(names.has('TMultiSelect')).toBe(true);
    expect(names.has('TSidebar')).toBe(true);
    expect(names.has('TDateTimePicker')).toBe(true);
  });

  it('recommends searchable choice components correctly', () => {
    const results = recommendComponents('searchable single-choice field for many options');

    expect(results[0]?.component.name).toBe('TCombobox');
  });

  it('finds recipes for shell layout', () => {
    const results = searchRecipes('sidebar app shell');
    const ids = results.map((result) => result.recipe.id);

    // Both shell recipes should surface for a shell-layout query.
    expect(ids).toContain('app-shell');
    expect(ids).toContain('sidebar-shell');
    // The top hit is one of the shell recipes.
    expect(['app-shell', 'sidebar-shell']).toContain(results[0]?.recipe.id);
  });

  it('searches components by semantic keywords', () => {
    const results = searchComponents('snackbar notification');

    expect(results[0]?.component.name).toBe('TToast');
  });

  it('emits every design token exactly as the stylesheet ships it', () => {
    const tokens = new Map(
      buildCatalogFromRepo(repoRoot).tokens.map((token) => [token.cssVar, token]),
    );
    const foundation = parseDeclarations(createFoundationCss());
    const light = parseDeclarations(createThemeCss('light'));
    const dark = parseDeclarations(createThemeCss('dark'));

    // The catalog must cover the stylesheet exactly — no missing and no invented variables.
    expect(new Set(tokens.keys())).toEqual(
      new Set([...foundation.keys(), ...light.keys(), ...dark.keys()]),
    );

    for (const [cssVar, value] of foundation) {
      expect(tokens.get(cssVar)?.value).toBe(value);
    }

    for (const [cssVar, value] of light) {
      expect(tokens.get(cssVar)?.value).toBe(value);
      expect(tokens.get(cssVar)?.themeValues?.light).toBe(value);
    }

    for (const [cssVar, value] of dark) {
      expect(tokens.get(cssVar)?.themeValues?.dark).toBe(value);
    }
  });

  it('finds tokens by css variable, category, and path', () => {
    const byVariable = searchTokens('--tree-gradient-brand');
    const byCategory = searchTokens('space');
    const byPath = searchTokens('status');

    expect(byVariable[0]?.token.cssVar).toBe('--tree-gradient-brand');
    expect(byCategory[0]?.token.category).toBe('space');
    expect(byPath.map((result) => result.token.cssVar)).toEqual(
      expect.arrayContaining([
        '--tree-color-status-success',
        '--tree-color-status-warning',
        '--tree-color-status-error',
        '--tree-color-status-info',
      ]),
    );
  });

  it('finds tokens by the value they ship, so literals resolve back to a token', () => {
    const byLength = searchTokens('1024px');
    const byRem = searchTokens('0.875rem');
    const byLightColor = searchTokens('#0969da');
    const byDarkColor = searchTokens('#539bf5');

    expect(byLength.map((result) => result.token.cssVar)).toContain('--tree-breakpoint-lg');
    expect(byRem.map((result) => result.token.cssVar)).toContain('--tree-radius-lg');
    expect(byLightColor.map((result) => result.token.cssVar)).toContain('--tree-color-brand-primary');
    // Per-theme values are searchable too, not just the default-theme value.
    expect(byDarkColor.map((result) => result.token.cssVar)).toContain('--tree-color-brand-primary');
  });

  it('resolves a length literal written in the other unit', () => {
    // 64rem is 1024px: a consumer hardcoding either form should land on the token.
    expect(searchTokens('64rem')[0]?.token.cssVar).toBe('--tree-breakpoint-lg');
    expect(searchTokens('40rem')[0]?.token.cssVar).toBe('--tree-breakpoint-sm');
  });

  it('returns no token results for an unrelated query', () => {
    expect(searchTokens('zzzunmatchable')).toEqual([]);
  });
});
