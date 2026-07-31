# @treeui/utils

## 0.26.0

### Minor Changes

- 184914c: Calendar math fixes from real adoption (TREEUX-016 etapa a):

  - `placeInDay` no longer lets `minHeight` push a block past the day's end. A
    short event near midnight (e.g. 3 minutes at 23:55) was floored to the minimum
    and spilled below the column; the floored height now shrinks so `top + height`
    stays within the day.
  - `weekStartForLocale` takes an optional `fallback` argument (default `1`,
    Monday) used only when the engine can't report week info. The library no
    longer silently hard-wires Monday — a Sunday-first product passes `0` so an
    unknown tag or old runtime never flips its source locale to Monday.

## 0.24.0

### Minor Changes

- 2a5c192: Add framework-agnostic calendar math for the upcoming `TCalendar` (TREEUX-016, step a).

  New pure functions in `@treeui/utils` (no DOM, no Vue, no bundled locale data): `getMonthMatrix(anchor, weekStartsOn)` (complete-week month grid, padded from adjacent months), `placeInDay(item, day, { hourHeight, minHeight })` (time-grid top/height with midnight clamp + min height), `layoutDayColumns(items)` (interval-graph greedy column placement for overlapping events, returning `{ columnIndex, columnCount }` per id — index and cluster count, not a width, so the consumer owns the measurement), and `weekStartForLocale(locale)` (via native `Intl.Locale` week info, falling back to Monday). This is the portable core the Vue `TCalendarMonthGrid` / `TCalendarTimeGrid` will compose.

## 0.13.0

### Minor Changes

- b90e9ac: feat: add native charts — TChart, TSparkline, and TDonutChart

  A lightweight, dependency-free data-viz set that follows the TreeUI patterns
  (BEM `t-*` classes, `--tree-*` tokens, `tv()`), with no external charting library.

  - **@treeui/utils**: a framework-agnostic chart geometry engine (`niceScale`,
    `linearScale`, `buildLinePath`, `buildAreaPath`, `donutSegments`) — reusable from React.
  - **@treeui/tokens**: a categorical chart palette `--tree-color-chart-1..8`, validated
    for CVD separation and contrast on both the light and dark surfaces.
  - **@treeui/vue**:
    - `TChart` — line / area / bar, multi-series, stacked bars, axes, gridlines, legend,
      hover crosshair + tooltip, and a visually-hidden data table for assistive tech.
    - `TSparkline` — inline, axis-less micro-trend (line / area / bar) for stat tiles,
      table cells, and text.
    - `TDonutChart` — proportional donut / pie with legend, percentages, and an
      interactive center readout.
  - **@treeui/mcp**: catalog regenerated to include the new components.

## 0.8.0

### Minor Changes

- 50ac321: Add `tv()`, a tiny class-variants helper. It maps a declarative variant config (`base` / `variants` / `defaultVariants` / `compoundVariants`) to a class string the way CVA does, but it only joins values — no Tailwind merge — so it fits TreeUI's BEM class convention. Exposes `ClassValue`, `TvConfig`, and `TvProps` types.

## 0.7.0

### Minor Changes

- 5e9b553: Add `TIcon` (alias `TreeIcon`) component: render any registered TreeUI icon by `name` with consistent sizing and a11y defaults. Icons are decorative (`aria-hidden`) by default, becoming `role="img"` with `aria-label` when a `label` prop is provided.

## 0.6.2

### Patch Changes

- c5fb383: Define the missing `--tree-z-popover` design token (`1050`, between
  `--tree-z-dropdown` and `--tree-z-sticky`).

  `.tree-navbar.is-sticky` already referenced `var(--tree-z-popover)` but the
  variable was never declared, so the rule resolved to `z-index: auto`. Combined
  with the navbar's `backdrop-filter` (which creates a stacking context),
  sibling page elements with any positive `z-index` could paint over a sticky
  `TNavbar` and any overlay rendered inside it (e.g. a `TSelect` dropdown panel
  in the `#end` slot).

  Declaring the token restores the intended layering without changing any
  component CSS.
