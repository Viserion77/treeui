import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Regression guard for the TButton `iconOnly` accessible-name warning
// (TREEUX-001). The warning must ship as a BARE, inlined `process.env.NODE_ENV`
// compare so the consumer's bundler statically replaces it: it then runs in a
// development build and is dead-code-eliminated — block and string literal —
// from a production build.
//
// The two ways this regressed before are asserted against directly:
//   1. a `typeof process` guard → false in the browser (no `process` global),
//      silently disabling the warning in real dev.
//   2. a function wrapper (`isDevEnv()`) → opaque to tree-shaking, so the block
//      and its strings survive into production bundles.
//
// The dead-code-elimination itself is proven with a real bundler outside the
// test DOM environment; reproduce it against the published package with:
//   echo 'if(process.env.NODE_ENV!=="production"){console.warn("x")}' \
//     | npx esbuild --minify --define:process.env.NODE_ENV='"production"'
// (prints nothing) versus '"development"' (keeps the warn).

const SOURCE = resolve(process.cwd(), 'packages/vue/src/components/TButton.vue');

function guardCode(): string {
  // Drop line comments so the rationale (which names the rejected patterns)
  // does not trip the code assertions.
  return readFileSync(SOURCE, 'utf8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
}

describe('TButton iconOnly warning — consumer-bundle mechanism (TREEUX-001)', () => {
  it('ships a bare, inlined process.env.NODE_ENV compare', () => {
    expect(guardCode()).toContain("if (process.env.NODE_ENV !== 'production')");
  });

  it('does not re-introduce the browser-breaking typeof guard', () => {
    expect(guardCode()).not.toContain('typeof process');
  });

  it('does not wrap the check in a function (which would defeat tree-shaking)', () => {
    expect(guardCode()).not.toContain('isDevEnv');
  });
});
