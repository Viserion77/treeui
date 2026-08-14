// @vitest-environment node
//
// Drift guard for the responsive-visibility axis. `TShow`/`THide` exist because
// cannot resolve a custom property — `@media (min-width: var(--tree-breakpoint-lg))`
// is invalid, since media queries are evaluated before the cascade exists. So
// the stylesheet writes the breakpoints out as literals, and this test is the
// thing that keeps those literals equal to `treeTokens.breakpoint`. Without it,
// the library would drift from its own token exactly the way a consumer's
// hand-copied breakpoint table does.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { treeTokens } from '@treeui/tokens';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(fileURLToPath(new URL('./index.css', import.meta.url)), 'utf8');

const breakpoints = treeTokens.breakpoint;
const names = Object.keys(breakpoints) as Array<keyof typeof breakpoints>;

/** The `max-width` sibling of a `min-width` breakpoint, just below it. */
const belowOf = (px: number) => `${px - 0.02}px`;

describe('TShow / THide breakpoints match the tokens', () => {
  it.each(names)('%s hides below the token value', (name) => {
    const px = Number.parseInt(breakpoints[name], 10);
    expect(px).toBeGreaterThan(0);
    expect(stylesheet).toContain(
      `@media (max-width: ${belowOf(px)}) {\n  .t-show--at-${name},\n  .t-hide--below-${name} {\n    display: none;\n  }\n}`,
    );
  });

  it.each(names)('%s hides from the token value up', (name) => {
    const px = Number.parseInt(breakpoints[name], 10);
    expect(stylesheet).toContain(
      `@media (min-width: ${px}px) {\n  .t-show--below-${name},\n  .t-hide--at-${name} {\n    display: none;\n  }\n}`,
    );
  });

  it('covers every breakpoint the tokens declare, and no invented ones', () => {
    const declared = [...stylesheet.matchAll(/\.t-show--at-([a-z]+)/g)].map((m) => m[1]);
    expect([...new Set(declared)].sort()).toEqual([...names].sort());
  });
});
