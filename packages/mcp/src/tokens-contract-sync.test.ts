import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { parse } from 'yaml';

import { deriveStateColors, treeThemes } from '@treeui/tokens';

/**
 * `docs/ai/TOKENS.yaml` is the contract agents and consuming apps read. It says
 * of itself: "If a name is not in this list, it does not exist."
 *
 * That claim was maintained by hand, and it had already drifted — the file
 * described 115 emitted variables while the package emitted more, and every
 * value in `theme_values` was a copy that nothing compared against the source.
 * A stale contract is worse than no contract: it is confidently wrong.
 *
 * These tests make the file's claim true by checking it.
 *
 * They live here rather than in `@treeui/tokens` because that package is
 * deliberately dependency-free and this needs a YAML parser — and because the
 * contract layer under `docs/ai` is what this package already exists to serve.
 */

const findRepoRoot = () => {
  let current = process.cwd();

  while (!existsSync(join(current, 'pnpm-workspace.yaml'))) {
    const parent = dirname(current);
    if (parent === current) throw new Error(`No workspace root above ${process.cwd()}`);
    current = parent;
  }

  return current;
};

const repoRoot = findRepoRoot();
const contract = parse(readFileSync(join(repoRoot, 'docs/ai/TOKENS.yaml'), 'utf8')) as {
  layers: { semantic: { count: number }; derived: { count: number } };
  derived_variables: { count: number };
  theme_values: Record<string, { color: Record<string, unknown>; derived: Record<string, unknown> }>;
};

/** `{ bg: { primary: '#fff' } }` -> `{ 'bg.primary': '#fff' }`. */
const flatten = (record: Record<string, unknown>, prefix = ''): Record<string, string> => {
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string' || typeof value === 'number') flat[path] = String(value);
    else if (value && typeof value === 'object') {
      Object.assign(flat, flatten(value as Record<string, unknown>, path));
    }
  }

  return flat;
};

describe('docs/ai/TOKENS.yaml stays in sync with @treeui/tokens', () => {
  it.each(['light', 'dark'] as const)('documents every %s semantic value verbatim', (mode) => {
    const actual = flatten(treeThemes[mode].color as unknown as Record<string, unknown>);
    const documented = flatten(contract.theme_values[mode].color);

    expect(documented).toEqual(actual);
  });

  it.each(['light', 'dark'] as const)('documents every %s derived value verbatim', (mode) => {
    const actual = flatten(
      deriveStateColors(treeThemes[mode].color as never, mode) as unknown as Record<
        string,
        unknown
      >,
    );
    const documented = flatten(contract.theme_values[mode].derived);

    expect(documented).toEqual(actual);
  });

  it('states the right layer sizes', () => {
    const semantic = Object.keys(
      flatten(treeThemes.light.color as unknown as Record<string, unknown>),
    ).length;
    const derived = Object.keys(
      flatten(deriveStateColors(treeThemes.light.color as never, 'light') as never),
    ).length;

    expect(contract.layers.semantic.count).toBe(semantic);
    expect(contract.layers.derived.count).toBe(derived);
    expect(contract.derived_variables.count).toBe(derived);
  });

  it('never lets a derived name appear in the semantic list', () => {
    // The contract's whole job is telling a product which names it may set.
    const derivedNames = new Set(
      Object.keys(flatten(deriveStateColors(treeThemes.light.color as never, 'light') as never)),
    );

    for (const name of Object.keys(flatten(contract.theme_values.light.color))) {
      expect(derivedNames.has(name), `${name} is derived but documented as semantic`).toBe(false);
    }
  });
});
