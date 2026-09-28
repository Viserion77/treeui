// @vitest-environment node
//
// Drift guard for the badge tone axis, the sibling of `tone-contract.test.ts`.
//
// The badge's tone table is declared as data in `@treeui/tokens`
// (`NATIVE_BADGE_TONES`) because the Kotlin and Rust ports need it and a
// stylesheet is not something they can read. The stylesheet below is still what
// the browser renders, so the two are one decision stated twice — and this test
// is what keeps them equal.
//
// It also resolves the inheritance the CSS relies on: there is no
// `.t-badge--tone-neutral` block, because the base block IS neutral and the four
// status blocks override a subset of it. A test that compared the tone blocks
// alone would miss every slot a tone inherits rather than sets, which is most
// of them.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  NATIVE_BADGE_TONES,
  NATIVE_BADGE_TONE_NAMES,
  NATIVE_BADGE_VARIANTS,
} from '@treeui/tokens';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(fileURLToPath(new URL('./index.css', import.meta.url)), 'utf8');

/** `--tree-badge-solid-bg: var(--tree-color-brand-primary)` → `{ 'solid-bg': 'color-brand-primary' }`. */
const readBadgeVars = (body: string): Record<string, string | null> => {
  const slots: Record<string, string | null> = {};

  for (const declaration of body.matchAll(
    /--tree-badge-([a-z-]+)\s*:\s*(?:var\(--tree-(color-[a-z0-9-]+)\)|(transparent))/g,
  )) {
    slots[declaration[1]] = declaration[2] ?? null;
  }

  return slots;
};

const baseBlock = /\.t-badge\s*\{([^}]*)\}/.exec(stylesheet);

/** Every tone, with the base block's defaults resolved into it. */
const resolvedFromCss = () => {
  expect(baseBlock, 'the stylesheet has no .t-badge base block').not.toBeNull();

  const defaults = readBadgeVars(baseBlock![1]);
  const tones: Record<string, Record<string, string | null>> = { neutral: { ...defaults } };

  for (const block of stylesheet.matchAll(/\.t-badge--tone-([a-z]+)\s*\{([^}]*)\}/g)) {
    tones[block[1]] = { ...defaults, ...readBadgeVars(block[2]) };
  }

  return tones;
};

describe('the badge tone axis in the stylesheet matches the token contract', () => {
  const fromCss = resolvedFromCss();

  it('covers every tone the contract declares', () => {
    expect(Object.keys(fromCss).sort()).toEqual([...NATIVE_BADGE_TONE_NAMES].sort());
  });

  it('has no explicit neutral block, because the base block is neutral', () => {
    // If one is ever added, this test's inheritance resolution is wrong and the
    // table it checks against would silently stop describing the CSS.
    expect(stylesheet).not.toMatch(/\.t-badge--tone-neutral\s*\{/);
  });

  it.each(NATIVE_BADGE_TONE_NAMES)('%s resolves every variant to the contracted colours', (tone) => {
    const declared = fromCss[tone];
    expect(declared, `the stylesheet resolves no slots for tone "${tone}"`).toBeDefined();

    for (const variant of NATIVE_BADGE_VARIANTS) {
      expect({ variant, ...NATIVE_BADGE_TONES[tone][variant] }).toEqual({
        variant,
        bg: declared[`${variant}-bg`] ?? null,
        text: declared[`${variant}-text`] ?? null,
        border: declared[`${variant}-border`] ?? null,
      });
    }
  });

  it('gives every variant of every tone a real ink', () => {
    // A fill and an edge may be absent; a label may not.
    for (const tone of NATIVE_BADGE_TONE_NAMES) {
      for (const variant of NATIVE_BADGE_VARIANTS) {
        expect(
          NATIVE_BADGE_TONES[tone][variant].text,
          `badge tone "${tone}" variant "${variant}" has no ink`,
        ).toMatch(/^color-/);
      }
    }
  });

  it('only draws an edge on the outline variant', () => {
    for (const tone of NATIVE_BADGE_TONE_NAMES) {
      for (const variant of NATIVE_BADGE_VARIANTS) {
        const { border } = NATIVE_BADGE_TONES[tone][variant];
        if (variant === 'outline') {
          expect(border, `outline/${tone} should draw an edge`).toMatch(/^color-/);
        } else {
          expect(border, `${variant}/${tone} should not draw an edge`).toBeNull();
        }
      }
    }
  });
});
