// @vitest-environment node
//
// Drift guard for the tone axis.
//
// `tone` is declared as data in `@treeui/tokens` (`NATIVE_TONES`), because the
// Kotlin and Rust ports generate their tone accessors from that table and a
// stylesheet is not something they can read. The stylesheet below is still the
// thing the browser actually renders, so the table and the CSS are two
// statements of one decision — and this test is what keeps them equal.
//
// Without it, a tone added or repointed in the CSS would leave every other
// ecosystem painting last release's colour, which is the worst failure mode a
// design system has: it looks authoritative and it is wrong.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NATIVE_TONES, NATIVE_TONE_NAMES, NATIVE_TONE_SLOTS } from '@treeui/tokens';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(fileURLToPath(new URL('./index.css', import.meta.url)), 'utf8');

/** Read the `.t-button--tone-*` blocks back out of the shipped stylesheet. */
const toneBlocks = (): Record<string, Record<string, string>> => {
  const blocks: Record<string, Record<string, string>> = {};

  for (const block of stylesheet.matchAll(/\.t-button--tone-([a-z]+)\s*\{([^}]*)\}/g)) {
    const declarations: Record<string, string> = {};

    for (const declaration of block[2].matchAll(
      /--tree-button-(accent[a-z-]*)\s*:\s*var\(--tree-(color-[a-z0-9-]+)\)/g,
    )) {
      declarations[declaration[1]] = declaration[2];
    }

    blocks[block[1]] = declarations;
  }

  return blocks;
};

describe('the tone axis in the stylesheet matches the token contract', () => {
  const blocks = toneBlocks();

  it('declares exactly the tones the contract declares', () => {
    expect(Object.keys(blocks).sort()).toEqual([...NATIVE_TONE_NAMES].sort());
  });

  it.each(NATIVE_TONE_NAMES)('%s fills every slot with the contracted colour', (tone) => {
    const declared = blocks[tone];
    expect(declared, `the stylesheet has no .t-button--tone-${tone} block`).toBeDefined();

    // Compared as whole objects rather than slot by slot so a slot the CSS
    // assigns but the contract does not know about also fails, not just a
    // missing one.
    expect(declared).toEqual(
      Object.fromEntries(NATIVE_TONE_SLOTS.map((slot) => [slot, NATIVE_TONES[tone][slot]])),
    );
  });

  it('leaves no slot unassigned in any tone', () => {
    for (const tone of NATIVE_TONE_NAMES) {
      for (const slot of NATIVE_TONE_SLOTS) {
        expect(
          NATIVE_TONES[tone][slot],
          `tone "${tone}" has no colour for slot "${slot}"`,
        ).toMatch(/^color-/);
      }
    }
  });
});
