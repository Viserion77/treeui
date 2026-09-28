// @vitest-environment node
//
// Drift guard for the shared stylesheet.
//
// `packages/react/src/style.css` is a deliberate subset of
// `packages/vue/src/styles/index.css` — only the `t-*` blocks the React package
// actually ships — and its own header names the Vue file as the source of truth
// for every one of them. That arrangement is fine; what was missing was anything
// that checked it. The badge's tint ink was fixed in the Vue stylesheet and the
// React copy kept the old, failing value, and nothing failed.
//
// So: every rule this file declares must be byte-identical to the Vue original,
// and a rule that exists here and nowhere in Vue is either a typo or a genuine
// React-only rule that has to say so out loud.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

const reactCss = read('./style.css');
const vueCss = read('../../vue/src/styles/index.css');

/**
 * Rules kept deliberately different, each with the reason.
 *
 * An entry here is a claim that has to be argued, not a place to park a
 * divergence — which is why the test names the map in its failure message. The
 * one entry is a selector that CANNOT be ported: see the reason on it, and the
 * test below that checks the part the exemption would otherwise stop checking.
 */
const DELIBERATE_DIVERGENCE: Readonly<Record<string, string>> = Object.freeze({
  '.t-button, .t-input, .t-card, .t-badge':
    'The typography floor is one grouped rule whose SELECTOR is the package\'s ' +
    'component list — Vue groups sixteen selectors, React ships four. Declaring ' +
    'Vue\'s selector verbatim would mean shipping rules for twelve components ' +
    'this package does not have, which is the one thing the file header forbids. ' +
    'The divergence is the subsetting itself, so it cannot be fixed by porting; ' +
    'the body is a single font-family declaration, and the test below asserts ' +
    'that it is identical and that React\'s members are a subset of Vue\'s.',
});

/**
 * Split a stylesheet into top-level `selector { body }` rules.
 *
 * Brace-counted rather than regex-matched, because a declaration value can
 * contain braces-free parentheses but a nested at-rule cannot be matched by a
 * non-greedy `[^}]*`. At-rules are skipped: the React subset has only `@import`
 * and one `@keyframes`, neither of which is a shared `t-*` block.
 */
const rules = (css: string): Map<string, string> => {
  const found = new Map<string, string>();
  let index = 0;

  while (index < css.length) {
    const open = css.indexOf('{', index);
    if (open === -1) break;

    // Walk to the matching close brace.
    let depth = 1;
    let cursor = open + 1;
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === '{') depth += 1;
      if (css[cursor] === '}') depth -= 1;
      cursor += 1;
    }

    const rawSelector = css.slice(index, open);
    // Strip comments, then normalise whitespace so formatting is not the subject.
    const selector = rawSelector.replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ');
    const body = css
      .slice(open + 1, cursor - 1)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim()
      .replace(/\s+/g, ' ');

    if (selector && !selector.startsWith('@')) {
      // A repeated selector is legal CSS and order matters; join so the
      // comparison sees everything the browser would apply.
      found.set(selector, found.has(selector) ? `${found.get(selector)} ${body}` : body);
    }

    index = cursor;
  }

  return found;
};

const reactRules = rules(reactCss);
const vueRules = rules(vueCss);

describe('the React stylesheet subset matches its source of truth', () => {
  it('parses both stylesheets into rules', () => {
    expect(reactRules.size).toBeGreaterThan(20);
    expect(vueRules.size).toBeGreaterThan(200);
  });

  // What the one DELIBERATE_DIVERGENCE entry gives up, checked directly: an
  // exemption stops the body from being compared at all, and this rule's body is
  // still shared. Narrowing a grouped selector is allowed; drifting inside it is
  // not.
  it('narrows the shared typography rule without changing what it declares', () => {
    const selector = '.t-button, .t-input, .t-card, .t-badge';
    const members = (value: string) => value.split(',').map((part) => part.trim());
    const reactMembers = members(selector);

    const vueGroup = [...vueRules.entries()].find(([vueSelector]) =>
      reactMembers.every((member) => members(vueSelector).includes(member)),
    );

    expect(vueGroup, `no Vue rule groups every selector in "${selector}"`).toBeDefined();
    expect(members(vueGroup![0]).length).toBeGreaterThan(reactMembers.length);
    expect(reactRules.get(selector)).toBe(vueGroup![1]);
    expect(reactRules.get(selector)).toBe('font-family: var(--tree-font-family-sans);');
  });

  it('declares no rule the Vue stylesheet does not have', () => {
    const orphans = [...reactRules.keys()].filter(
      (selector) => !vueRules.has(selector) && !(selector in DELIBERATE_DIVERGENCE),
    );

    expect(
      orphans,
      'these selectors exist only in the React subset — either a typo, or a React-only rule that needs an entry in DELIBERATE_DIVERGENCE with its reason',
    ).toEqual([]);
  });

  it.each([...reactRules.keys()])('%s is identical to the Vue original', (selector) => {
    if (selector in DELIBERATE_DIVERGENCE) return;

    const vueBody = vueRules.get(selector);
    if (vueBody === undefined) return; // reported by the test above

    expect(
      reactRules.get(selector),
      `"${selector}" has drifted from packages/vue/src/styles/index.css — fix it there, then port it here`,
    ).toBe(vueBody);
  });
});
