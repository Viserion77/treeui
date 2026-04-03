import { treeThemes, treeTokens, type TreeThemeName } from './tokens';

type TokenValue = string | number;

interface TokenRecord {
  [key: string]: TokenValue | TokenRecord;
}

const toCssVariable = (path: string[]) => `--tree-${path.join('-')}`;

const flattenTokens = (
  record: TokenRecord,
  path: string[] = [],
): Array<[string, TokenValue]> => {
  return Object.entries(record).flatMap(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return [[toCssVariable([...path, key]), value]];
    }

    return flattenTokens(value, [...path, key]);
  });
};

const renderDeclarationBlock = (entries: Array<[string, TokenValue]>) => {
  return entries.map(([name, value]) => `  ${name}: ${value};`).join('\n');
};

export const createFoundationCss = () => {
  const declarations = renderDeclarationBlock(flattenTokens(treeTokens as TokenRecord));

  return `:root {\n${declarations}\n}`;
};

export const createThemeCss = (
  themeName: TreeThemeName,
  selector = `[data-tree-theme="${themeName}"]`,
) => {
  const declarations = renderDeclarationBlock(
    flattenTokens(treeThemes[themeName] as TokenRecord),
  );
  const colorScheme = themeName === 'dark' ? 'dark' : 'light';

  return `${selector} {\n  color-scheme: ${colorScheme};\n${declarations}\n}`;
};

export const createDefaultThemeCss = (themeName: TreeThemeName) => {
  const declarations = renderDeclarationBlock(
    flattenTokens(treeThemes[themeName] as TokenRecord),
  );
  const colorScheme = themeName === 'dark' ? 'dark' : 'light';

  return `:root {\n  color-scheme: ${colorScheme};\n${declarations}\n}`;
};

export const createStylesheet = () =>
  [createFoundationCss(), createDefaultThemeCss('light')].join('\n\n');

export const createThemesStylesheet = () =>
  [createThemeCss('light'), createThemeCss('dark')].join('\n\n');
