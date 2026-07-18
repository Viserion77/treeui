import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

import { createStylesheet, createThemesStylesheet } from './css';

/**
 * Contract guard: every `var(--tree-*)` a shipped stylesheet consumes must
 * resolve to a name something actually defines.
 *
 * Nothing else in the quality gates covers this — ESLint only sees
 * `.ts/.tsx/.vue`, there is no stylelint, and `index.test.ts` asserts that the
 * generator *emits* names, never that consumers *reference* real ones. A dead
 * reference fails silently at runtime: the declaration is simply dropped and
 * the element renders with the inherited or initial value.
 */

/** Walk up from the runner's cwd so the test works from the root or a package. */
const findRepoRoot = () => {
  let current = process.cwd();

  while (!existsSync(join(current, 'pnpm-workspace.yaml'))) {
    const parent = dirname(current);

    if (parent === current) {
      throw new Error('Could not locate the workspace root from ' + process.cwd());
    }

    current = parent;
  }

  return current;
};

const repoRoot = findRepoRoot();

/** A `--tree-*` name being declared: `--tree-space-4: 1rem;`. */
const DECLARATION_PATTERN = /(--tree-[a-zA-Z0-9-]*)\s*:/g;
/**
 * A `--tree-*` name being consumed: `var(--tree-space-4)` / `var(--tree-x, y)`.
 * Case-insensitive because CSS function names are.
 */
const REFERENCE_PATTERN = /var\(\s*(--tree-[a-zA-Z0-9-]*)\s*(,?)/gi;
/** An inline style key in component source: `'--tree-split-gap': props.gap`. */
const INLINE_STYLE_KEY_PATTERN = /['"`](--tree-[a-zA-Z0-9-]*)['"`]\s*:/g;
/** An imperative write: `el.style.setProperty('--tree-color-brand-primary', v)`. */
const SET_PROPERTY_PATTERN = /setProperty\(\s*['"`](--tree-[a-zA-Z0-9-]*)['"`]/g;

/**
 * CSS comments can contain illustrative `var(--tree-…)` snippets — blank them
 * out. Blanked rather than removed so a multi-line comment keeps its newlines
 * and the reported line numbers still match the file.
 */
const stripCssComments = (css: string) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));

const matchAll = (source: string, pattern: RegExp) =>
  [...source.matchAll(pattern)].map((match) => match[1]);

/**
 * Component sources, as `[repo-relative path, contents]`. Test files are
 * excluded: a `'--tree-typo': …` fixture inside one would otherwise vouch for
 * the same typo in a stylesheet.
 */
const readSourceFiles = (dir: string, extensions: string[]): [string, string][] =>
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

/** Levenshtein distance, used only to suggest a near-miss name in the failure. */
const distance = (a: string, b: string) => {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];

    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }

    previous = current;
  }

  return previous[b.length];
};

/** `--tree-icon-size-md` -> `icon|md|size|tree`, so word order stops mattering. */
const segmentKey = (name: string) => name.replace(/^--/, '').split('-').sort().join('|');

/**
 * Nearest defined name, if one is close enough to be worth printing.
 *
 * A name whose segments are a permutation of the dead one wins outright:
 * plain edit distance rates `--tree-size-icon-md` as a *worse* match for
 * `--tree-icon-size-md` than the unrelated `--tree-font-size-md`, and a
 * transposition is exactly the mistake that shipped.
 */
const suggest = (name: string, candidates: Iterable<string>) => {
  const key = segmentKey(name);
  const threshold = Math.max(3, Math.floor(name.length / 4));
  let best: { name: string; score: number } | undefined;

  for (const candidate of candidates) {
    if (segmentKey(candidate) === key) {
      return candidate;
    }

    const score = distance(name, candidate);

    if (score <= threshold && (!best || score < best.score)) {
      best = { name: candidate, score };
    }
  }

  return best?.name;
};

interface DeadReference {
  stylesheet: string;
  line: number;
  name: string;
  hasFallback: boolean;
}

/**
 * Every `--tree-*` reference in `css` that `defined` does not cover.
 *
 * A reference written as `var(--tree-x, fallback)` is reported too, in the same
 * list rather than a softer separate assertion: the fallback only hides the
 * symptom, the name is still dead, and the "temporary" fallback silently
 * becomes the permanent value. The legitimate uses of that form — a variable a
 * component writes inline at runtime, like `--tree-split-gap` — are covered by
 * feeding the component sources into `defined`, so they never reach this list.
 * `hasFallback` is kept on the result purely to annotate the failure message.
 */
/**
 * A component may build a name by interpolation —
 * `` `var(--tree-color-chart-${n})` ``. The static prefix is not a real name,
 * so the reference is unresolvable here and belongs to the component's own
 * tests. Only the interpolated suffix is skipped; a fully static name on the
 * same line is still checked.
 */
const isDynamic = (line: string, match: RegExpMatchArray) =>
  line.slice((match.index ?? 0) + match[0].length).startsWith('${');

const findDeadReferences = (
  stylesheet: string,
  css: string,
  defined: ReadonlySet<string>,
): DeadReference[] => {
  return stripCssComments(css)
    .split('\n')
    .flatMap((line, index) =>
      [...line.matchAll(REFERENCE_PATTERN)]
        .filter((match) => !isDynamic(line, match) && !defined.has(match[1]))
        .map((match) => ({
          stylesheet,
          line: index + 1,
          name: match[1],
          hasFallback: match[2] === ',',
        })),
    );
};

const formatFailure = (dead: DeadReference[], defined: ReadonlySet<string>) => {
  const lines = dead.map((reference) => {
    const suggestion = suggest(reference.name, defined);
    const hint = suggestion ? ` — did you mean ${suggestion}?` : '';
    const fallback = reference.hasFallback ? ' (has a fallback, still dead)' : '';

    return `  ${reference.stylesheet}:${reference.line}  var(${reference.name})${fallback}${hint}`;
  });

  return [
    `${dead.length} undefined --tree-* reference(s):`,
    ...lines,
    '',
    'Each one resolves to nothing at runtime and the declaration is dropped.',
    'Fix the name, add the token to packages/tokens/src/tokens.ts, or declare it',
    'locally in the same stylesheet if it is a component-scoped variable.',
  ].join('\n');
};

/** Names the token generators emit — the shared, published contract. */
const generatedTokens = new Set(
  matchAll(
    [createStylesheet(), createThemesStylesheet()].join('\n'),
    DECLARATION_PATTERN,
  ),
);

/**
 * The stylesheets that ship to consumers, each paired with the source tree
 * whose components may write extra `--tree-*` values inline (`:style`
 * bindings). Those inline names are real definitions even though no stylesheet
 * declares them, so they belong in the defined set — scoped per framework so a
 * Vue-only variable cannot vouch for a React reference.
 */
const stylesheets = [
  {
    name: 'packages/vue/src/styles/index.css',
    sourceDir: 'packages/vue/src',
  },
  {
    name: 'packages/react/src/style.css',
    sourceDir: 'packages/react/src',
  },
];

/** Everything a reference in `stylesheet` is allowed to resolve to. */
const sourcesFor = ({ sourceDir }: (typeof stylesheets)[number]) =>
  readSourceFiles(resolve(repoRoot, sourceDir), ['.vue', '.ts', '.tsx']);

const definedFor = ({ sourceDir }: (typeof stylesheets)[number], css: string) => {
  const componentSources = sourcesFor({ sourceDir } as (typeof stylesheets)[number])
    .map(([, contents]) => contents)
    .join('\n');

  return new Set([
    ...generatedTokens,
    // Component-scoped variables the stylesheet declares itself.
    ...matchAll(stripCssComments(css), DECLARATION_PATTERN),
    // Variables a component writes inline at runtime.
    ...matchAll(componentSources, INLINE_STYLE_KEY_PATTERN),
    ...matchAll(componentSources, SET_PROPERTY_PATTERN),
  ]);
};

describe('@treeui/tokens CSS contract', () => {
  it('emits a non-trivial set of token names', () => {
    // Guards the guard: an empty `defined` set would make everything look dead,
    // an over-broad parse would make nothing look dead.
    expect(generatedTokens.size).toBeGreaterThan(50);
    expect(generatedTokens.has('--tree-size-icon-md')).toBe(true);
    expect(generatedTokens.has('--tree-icon-size-md')).toBe(false);
  });

  it.each(stylesheets)('$name references only defined tokens', (stylesheet) => {
    const css = readFileSync(resolve(repoRoot, stylesheet.name), 'utf8');
    const defined = definedFor(stylesheet, css);
    const dead = findDeadReferences(stylesheet.name, css, defined);

    expect(dead.length === 0 || formatFailure(dead, defined)).toBe(true);
  });

  it.each(stylesheets)(
    '$sourceDir components reference only defined tokens',
    (stylesheet) => {
      // Components inline `var(--tree-*)` in `:style` bindings and computed
      // class/style strings. A transposition there fails exactly as silently as
      // the stylesheet bug this guard was built for, so it gets the same check.
      const css = readFileSync(resolve(repoRoot, stylesheet.name), 'utf8');
      const defined = definedFor(stylesheet, css);
      const dead = sourcesFor(stylesheet).flatMap(([path, contents]) =>
        findDeadReferences(path, contents, defined),
      );

      expect(dead.length === 0 || formatFailure(dead, defined)).toBe(true);
    },
  );

  it('detects a transposed token name, with a suggestion', () => {
    // The failure this guard exists for, reproduced in miniature: the real bug
    // shipped `var(--tree-icon-size-md)` against the defined `--tree-size-icon-md`.
    const css = ['.t-icon {', '  width: var(--tree-icon-size-md);', '}'].join('\n');
    const dead = findDeadReferences('sample.css', css, generatedTokens);

    expect(dead).toEqual([
      { stylesheet: 'sample.css', line: 2, name: '--tree-icon-size-md', hasFallback: false },
    ]);
    expect(formatFailure(dead, generatedTokens)).toContain(
      'did you mean --tree-size-icon-md?',
    );
  });

  it('flags a dead reference even when it carries a fallback', () => {
    const css = '.t-x { gap: var(--tree-nope-nope, 1rem); }';
    const dead = findDeadReferences('sample.css', css, generatedTokens);

    expect(dead).toHaveLength(1);
    expect(dead[0].hasFallback).toBe(true);
  });

  it('ignores references inside comments and locally declared variables', () => {
    const css = [
      '/* legacy: var(--tree-removed-token) */',
      '.t-y { --tree-y-bg: red; background: var(--tree-y-bg); }',
    ].join('\n');
    const defined = new Set([
      ...generatedTokens,
      ...matchAll(stripCssComments(css), DECLARATION_PATTERN),
    ]);

    expect(findDeadReferences('sample.css', css, defined)).toEqual([]);
  });

  it('reports the line a dead reference sits on, past a multi-line comment', () => {
    const css = [
      '/* one',
      '   two: var(--tree-also-gone)',
      '   three */',
      '.t-z { gap: var(--tree-gone); }',
    ].join('\n');

    expect(findDeadReferences('sample.css', css, generatedTokens)).toEqual([
      { stylesheet: 'sample.css', line: 4, name: '--tree-gone', hasFallback: false },
    ]);
  });
});
