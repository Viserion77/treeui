import { treeThemes, treeTokens } from '@treeui/tokens';
import type { TreeuiTokenEntry } from './types';

type TokenValue = string | number;

interface TokenRecord {
  [key: string]: TokenValue | TokenRecord;
}

/**
 * Mirrors `toCssVariable` in `packages/tokens/src/css.ts` so every catalog entry
 * carries the exact custom property the generated stylesheet ships. The catalog
 * is derived from `treeTokens`/`treeThemes` rather than hand-maintained; see
 * `token-source.test.ts`, which diffs these names against the real stylesheet.
 */
const toCssVariable = (path: string[]) => `--tree-${path.join('-')}`;

const flattenTokens = (
  record: TokenRecord,
  path: string[] = [],
): Array<[string[], TokenValue]> =>
  Object.entries(record).flatMap(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return [[[...path, key], value] as [string[], TokenValue]];
    }

    return flattenTokens(value, [...path, key]);
  });

/** `createStylesheet()` inlines this theme at `:root`, so it supplies the default value. */
const DEFAULT_THEME_NAME = 'light';

const categoryDescriptions: Record<string, string> = {
  font: 'Typography token: font family, size, weight, or line height.',
  space: 'Spacing scale step for padding, margin, and gap.',
  radius: 'Corner radius scale step.',
  shadow: 'Elevation shadow.',
  gradient: 'Gradient composed from the themed brand variables.',
  border: 'Border width step.',
  motion: 'Motion duration or easing curve.',
  size: 'Control and icon sizing scale step.',
  layout: 'Layout grid, gutter, or margin measurement.',
  z: 'Stacking layer (z-index).',
  breakpoint: 'Responsive breakpoint width.',
  color: 'Themed semantic color, resolved per [data-tree-theme].',
};

const describeToken = (category: string) =>
  categoryDescriptions[category] ?? 'TreeUI design token.';

/**
 * Flatten the design tokens into catalog entries. Foundation tokens carry a
 * single value; themed tokens carry one value per theme plus the default-theme
 * value on `value`.
 */
export const buildTokenEntries = (): TreeuiTokenEntry[] => {
  const foundation: TreeuiTokenEntry[] = flattenTokens(treeTokens as TokenRecord).map(
    ([path, value]) => ({
      cssVar: toCssVariable(path),
      path: path.join('.'),
      value: String(value),
      category: path[0],
      description: describeToken(path[0]),
    }),
  );

  const themed = new Map<string, TreeuiTokenEntry>();

  for (const [themeName, theme] of Object.entries(treeThemes)) {
    for (const [path, value] of flattenTokens(theme as TokenRecord)) {
      const cssVar = toCssVariable(path);
      const existing = themed.get(cssVar);

      if (existing) {
        existing.themeValues = { ...existing.themeValues, [themeName]: String(value) };
        continue;
      }

      themed.set(cssVar, {
        cssVar,
        path: path.join('.'),
        value: String(value),
        category: path[0],
        description: describeToken(path[0]),
        themeValues: { [themeName]: String(value) },
      });
    }
  }

  for (const entry of themed.values()) {
    entry.value = entry.themeValues?.[DEFAULT_THEME_NAME] ?? entry.value;
  }

  return [...foundation, ...themed.values()];
};
