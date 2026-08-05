// @vitest-environment node
//
// Guards for the two user-agent boxes that leak through a polymorphic `as`
// (TREEUX-044 / TREEUX-045). Neither is testable through jsdom — it has no
// layout and ships no UA stylesheet, which is precisely why both defects
// survived: a mounted component looks correct in a unit test and measures wrong
// in a browser. So assert on the shipped rule instead.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync(fileURLToPath(new URL('./index.css', import.meta.url)), 'utf8');

/** The declaration block of the first rule whose selector list contains `needle`. */
const blockContaining = (needle: string) => {
  const index = stylesheet.indexOf(needle);
  expect(index, `no rule mentions ${needle}`).toBeGreaterThan(-1);
  const open = stylesheet.indexOf('{', index);
  const close = stylesheet.indexOf('}', open);
  return stylesheet.slice(open + 1, close);
};

describe('list box on a layout primitive (TREEUX-044)', () => {
  const rule = ':where(ul, ol, menu):is(.t-stack, .t-grid, .t-split, .t-section__inner, .t-container)';

  it.each(['margin-block: 0', 'padding-inline-start: 0', 'list-style: none'])(
    'cancels %s',
    (declaration) => {
      expect(blockContaining(rule)).toContain(declaration);
    },
  );

  it('is scoped to the primitives, so a hand-written prose list is untouched', () => {
    expect(rule).toContain('.t-stack');
    expect(rule).not.toContain('ul,\n');
  });
});

describe('button box on a card (TREEUX-045)', () => {
  const block = () => blockContaining('button.t-card');

  it.each([
    // Chrome's button font is 13.33px and does NOT inherit.
    'font: inherit',
    // A button shrink-to-fits; the same card measured 134.75px against 900px.
    'inline-size: 100%',
    // A button centres its content; a card's text starts at the inline start.
    'text-align: inherit',
    'appearance: none',
  ])('resets %s', (declaration) => {
    expect(block()).toContain(declaration);
  });

  it('is scoped to the element, so a card as <a> or <div> is untouched', () => {
    expect(stylesheet).toContain('button.t-card {');
  });
});

describe('icon slot scale (TREEUX-010)', () => {
  // A TIcon renders `size` as width/height ATTRIBUTES; CSS outranks those, so a
  // slotted icon with no `size` follows the component instead of entering at the
  // 20px default and standing taller than the line it sits on.
  it.each(['.t-tag__icon > :where(svg)', '.t-badge__icon > :where(svg)'])(
    '%s takes its size from the component',
    (selector) => {
      expect(stylesheet).toContain(selector);
    },
  );

  it.each(['.t-tag--sm .t-tag__icon', '.t-tag--lg .t-tag__icon'])(
    '%s steps with the size scale',
    (selector) => {
      expect(stylesheet).toContain(selector);
    },
  );
});

describe('follow-ups from the 0.28 validation', () => {
  it('soft tags carry the tone ring (TREEUX-048 b)', () => {
    expect(stylesheet).toContain(".t-tag--soft[class*='t-tag--tone-']");
  });

  it('the empty-state frame has a width cap of its own (TREEUX-046)', () => {
    expect(stylesheet).toContain('.t-empty-state--frame-narrow');
  });
});
