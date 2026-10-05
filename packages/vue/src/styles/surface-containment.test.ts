// @vitest-environment node
//
// Guards for the layout audit that produced this batch of fixes.
//
// Every rule here answers a measured defect in a consumer app, and none of them
// is testable through jsdom: it has no layout engine and ships no UA
// stylesheet, so a mounted component looks perfectly correct in a unit test and
// measures wrong in a browser. That is exactly how these survived. So the
// assertion is on the shipped declaration — the same approach `ua-resets.test.ts`
// takes, and for the same reason.
//
// The two families:
//
//   1. A surface must take its CONTAINER's width. A grid's implicit `auto`
//      track has the min-content of its items as its minimum, so a single
//      unbreakable descendant widened the whole surface and every sibling on
//      it was laid out past the border.
//   2. Text that can arrive without a break opportunity — a machine string, a
//      resource name, a URL — must be able to wrap. `overflow-wrap: anywhere`,
//      not `break-word`: only `anywhere` reduces the min-content, which is the
//      property that actually lets the box shrink.
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

describe('a surface is never inflated by a descendant', () => {
  it.each([
    ['.t-card {', 'card'],
    ['.t-card__body {', 'card body'],
    ['.t-modal__body {', 'modal body'],
    ['.t-confirm-dialog {', 'confirm dialog'],
    ['.t-confirm-dialog__body {', 'confirm dialog body'],
    ['.t-timeline {', 'timeline'],
    ['.t-timeline__content {', 'timeline entry'],
    ['.t-nav-menu__list {', 'nav menu list'],
    ['.t-nav-menu__copy {', 'nav menu item copy'],
  ])('%s declares an explicit floor-less track', (selector) => {
    expect(blockContaining(selector)).toContain('grid-template-columns: minmax(0, 1fr)');
  });

  it('gives the confirm dialog icon variant a floor-less content column', () => {
    expect(blockContaining('.t-confirm-dialog--with-icon {')).toContain(
      'grid-template-columns: auto minmax(0, 1fr)',
    );
  });

  it('makes the modal surface a column so only the body scrolls', () => {
    const surface = blockContaining('.t-modal__surface {');
    expect(surface).toContain('flex-direction: column');
    // The surface clips; the body is the single scroller. The whole surface
    // used to scroll, which put the footer's actions below the fold.
    expect(surface).toContain('overflow: hidden');

    const body = blockContaining('.t-modal__body {');
    expect(body).toContain('overflow: auto');
    expect(body).toContain('min-block-size: 0');
  });
});

describe('text that can lack a break opportunity wraps', () => {
  it.each([
    ['.t-modal__title {', 'modal title'],
    ['.t-modal__description {', 'modal description'],
    ['.t-card__title {', 'card title'],
    ['.t-timeline__title {', 'timeline title'],
    ['.t-timeline__description {', 'timeline description'],
    ['.t-nav-menu__label {', 'nav menu label'],
    ['.t-select__option {', 'select option'],
  ])('%s uses overflow-wrap: anywhere', (selector) => {
    expect(blockContaining(selector)).toContain('overflow-wrap: anywhere');
  });

  it('makes TCodeBlock `wrap` reduce the min-content, not merely break at layout time', () => {
    const rule = blockContaining('.t-code-block.is-wrap .t-code-block__pre');
    expect(rule).toContain('overflow-wrap: anywhere');
    // `break-word` was the defect: it breaks only once a width is settled, so
    // in a table cell or an `auto` track the URL still set the minimum width.
    expect(rule).not.toContain('break-word');
  });

  it("lets TText's wrap axis outrank preserveWhitespace", () => {
    // Both are (0,2,0); the wrap axis has to be qualified with `.t-text` to
    // reach that specificity, and comes later in the file so it wins.
    const anywhere = stylesheet.indexOf('.t-text.t-text--wrap-anywhere');
    const preWrap = stylesheet.indexOf('.t-text.is-pre-wrap');
    expect(anywhere).toBeGreaterThan(-1);
    expect(anywhere).toBeGreaterThan(preWrap);
  });
});

describe('controls stay inside the surface they belong to', () => {
  it('lets card actions shrink and wrap instead of overflowing the border', () => {
    const rule = blockContaining('.t-card__actions {');
    expect(rule).toContain('flex-wrap: wrap');
    expect(rule).toContain('min-inline-size: 0');
    expect(rule).not.toContain('flex-shrink: 0');
  });

  it('gives list-item actions their own line in a narrow container', () => {
    const rule = blockContaining('.t-list-item__actions {\n    order: 2');
    expect(rule).toContain('flex-basis: 100%');
    expect(rule).toContain('flex-wrap: wrap');
  });

  it('scrolls overflowing tabs within their own strip, not the page', () => {
    const rule = blockContaining('.t-tabs__list {');
    expect(rule).toContain('overflow-x: auto');
    expect(rule).toContain('overscroll-behavior-x: contain');
  });

  it('keeps a badge from outgrowing its container, and its second line off the border', () => {
    const rule = blockContaining('.t-badge {\n  --tree-badge-solid-bg');
    expect(rule).toContain('max-inline-size: 100%');
    // `line-height: 1` let a wrapped line's ascenders touch the pill's edge.
    expect(rule).not.toContain('line-height: 1;');
    expect(rule).toContain('line-height: var(--tree-font-lineHeight-ui)');
  });

  it('does not stretch what a consumer drops in the link tile slot', () => {
    expect(blockContaining('.t-link-tile__body {')).toContain('align-items: flex-start');
  });
});

describe('the app shell frame', () => {
  it('makes the scrolling panel a containing block', () => {
    // Without it an absolutely positioned descendant with auto insets — the
    // library's own `.t-visually-hidden` TProgress label — anchored to the
    // initial block and extended the DOCUMENT's scroll past the 100dvh shell.
    expect(blockContaining('.t-app-shell__main {')).toContain('position: relative');
    expect(blockContaining('.t-app-shell__sidebar-body {')).toContain('position: relative');
  });

  it('stops the hidden skip link from painting its shadow', () => {
    expect(blockContaining('.t-skip-link:not(:focus-visible)')).toContain('box-shadow: none');
  });
});

describe('colour on a repainted background', () => {
  it('rebinds the muted text token inside a selected toggle item', () => {
    // A `TText tone="muted"` in the `#option` slot measured 1.18:1 (light) and
    // 1.09:1 (dark) over the brand fill, where `xs` text needs 4.5:1. Only the
    // inherited colour used to change.
    expect(blockContaining('.t-toggle-group__item.is-selected {')).toContain(
      '--tree-color-text-muted: var(--tree-color-brand-contrast)',
    );
  });

  it('capitalises only the first letter of the date-picker month title', () => {
    // `capitalize` hits every word, and most locales put a particle in the
    // middle: pt-BR's "setembro de 2026" came out "Setembro De 2026".
    expect(blockContaining('.t-date-picker__month {')).toContain('text-transform: none');
    expect(blockContaining('.t-date-picker__month::first-letter')).toContain(
      'text-transform: uppercase',
    );
  });
});

describe('round two: what the first delivery left measurably open', () => {
  it('lets the first and last x labels anchor inward', () => {
    // These were written as the `text-anchor` ATTRIBUTE, which CSS always
    // beats — so `.t-chart__axis-label--x { text-anchor: middle }` won and the
    // anchoring never applied. They are modifier classes now, at (0,2,0).
    expect(blockContaining('.t-chart__axis-label--x.is-anchor-start')).toContain(
      'text-anchor: start',
    );
    expect(blockContaining('.t-chart__axis-label--x.is-anchor-end')).toContain('text-anchor: end');
  });

  it('reserves the toolbar width in a copyable code block', () => {
    // Only visible once `wrap` started breaking for real: before, the long
    // token overflowed sideways and never reached the button it now runs under.
    expect(blockContaining('.t-code-block.is-copyable .t-code-block__pre')).toContain(
      'padding-inline-end',
    );
  });

  it('makes the donut legend label the flexible column and the value the fixed one', () => {
    expect(blockContaining('.t-donut-chart__legend-label {\n  flex: 1 1 0')).toContain(
      'min-width: 0',
    );
    expect(blockContaining('.t-donut-chart__legend-value {')).toContain('flex: 0 0 auto');
  });

  it('gives TStat a density axis with a lower floor for the value', () => {
    // 1.5rem was the floor at every size, which is why a formatted negative
    // currency could not fit two-per-row on a phone.
    expect(blockContaining('.t-stat--sm {')).toContain('--tree-stat-value-min: 1.125rem');
    expect(blockContaining('.t-stat__value {')).toContain('var(--tree-stat-value-min, 1.5rem)');
  });
});

describe('round three: the indicator band', () => {
  it('strips the card from a plain stat', () => {
    const rule = blockContaining('.t-stat--plain {');
    expect(rule).toContain('border-width: 0');
    expect(rule).toContain('box-shadow: none');
    expect(rule).toContain('background: transparent');
  });

  it('draws the hairlines as pseudo-elements, not as borders on the cell', () => {
    // A border would land on the child's own `border-width`, and the contract
    // is that a cell in a band measures as frameless from the outside.
    expect(blockContaining('.t-stat-group__track > *::before,')).toContain('position: absolute');

    // Anchored on the declarations, because the grouped selector above also
    // contains the text `.t-stat-group__track > *::after {`.
    const pull = 'calc(-1 * var(--tree-border-width-subtle))';
    expect(stylesheet).toContain(`inset-inline-start: ${pull}`);
    expect(stylesheet).toContain(`inset-block-start: ${pull}`);
    // And no border on the cell itself, which is what the group's own contract
    // with TStat depends on.
    expect(stylesheet).not.toContain('.t-stat-group__track > * {\n  border-');
  });

  it('pulls the track back so the outermost lines fall outside the clip', () => {
    expect(blockContaining('.t-stat-group {')).toContain('overflow: hidden');
    const track = blockContaining('.t-stat-group__track {');
    expect(track).toContain('margin-block-start: calc(-1 * var(--tree-border-width-subtle))');
    expect(track).toContain('margin-inline-start: calc(-1 * var(--tree-border-width-subtle))');
  });

  it('drops the trend chip below the value in a narrow tile', () => {
    // At half-width on a phone the chip sat ON the value: it is `flex: 0 0 auto`,
    // so the value shrinks under it rather than pushing it down.
    expect(blockContaining('@container (max-width: 16rem)')).toContain('flex-direction: column');
  });
});
