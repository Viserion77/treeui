// @vitest-environment node

import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildCatalogFromRepo } from './catalog-source';
import { recommendComponents, searchComponents, searchRecipes } from './catalog';

const repoRoot = path.resolve(import.meta.dirname, '../../..');

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

    expect(results[0]?.recipe.id).toBe('sidebar-shell');
  });

  it('searches components by semantic keywords', () => {
    const results = searchComponents('snackbar notification');

    expect(results[0]?.component.name).toBe('TToast');
  });
});
