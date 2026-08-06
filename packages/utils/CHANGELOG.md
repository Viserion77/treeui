# @treeui/utils

## 0.29.0

### Minor Changes

- 1a9d136: Clears the entire accepted backlog from both consumer files in one release.

  **Calendar (TREEUX-016 b/c/d)** — `TCalendarMonthGrid`, `TCalendarTimeGrid` and
  the `TCalendar` wrapper with `view`. The month grid CONSUMES `getMonthMatrix`
  and draws exactly the matrix it returns rather than recomputing the grid, which
  is the contract that keeps a consumer's fetch window and the days on screen from
  diverging silently. Vertical placement and the overlap algorithm stay in
  `@treeui/utils`, so a React time grid reuses them. The "now" marker is drawn
  only in the current day's column; every `Intl` call is memoised per locale at
  render time, never at module scope.

  **Media (TREEUX-019)** — `TAudioPlayer` (play/pause, duration, seek; `src` is
  agnostic and waveform is deliberately out of scope) and `TVoiceRecorder` (the
  record/recording/preview states, mm:ss timer, duration cap). The pulse is frozen
  under `prefers-reduced-motion` by default: a recording indicator runs for as
  long as someone is talking. Capture and upload stay with the product.

  **File and drop (TREEUX-021, 022, 040)**

  - `TFileUpload` gains `variant="trigger"` — the slot becomes the only control,
    with no dashed box, no `role="button"` wrapper and no second tab stop — and
    `rejectionLabels`, so the rejection copy is no longer English prose baked into
    the component.
  - `useDrop({ accepts, scope })` plus `TDropVeil`: one mechanism for a page-wide
    and a region-wide target, with the depth counter, the `preventDefault`
    conditioned on the payload, and cleanup. `accepts` takes `DataTransfer` types,
    so a file drag (`'Files'`) and a card drag (a custom MIME type) are the same
    predicate rather than two APIs.
  - The arithmetic is pure and framework-agnostic in `@treeui/utils`:
    `dragCarriesTypes`, `nextDragDepth`, `filesFromTransfer`, `payloadFromTransfer`.

  **Canvas (TREEUX-039 a+b)** — `useDecorativeCanvas()` owns the lifecycle that
  two ornaments had each discovered by measuring: no frame while reduced-motion,
  coarse pointer, background tab or off-screen; backing store that follows the
  element with a pixel-ratio ceiling; never steals a pointer event; clean unmount.
  The field maths (`fieldGrid`, `waveAt`, `springStep`, `containPoint`,
  `canvasBackingSize`) is in `@treeui/utils` and is deterministic, so a
  pre-rendered decoration survives hydration unchanged.

  **Layout and data (TREEUX-041, 003, 004, 002 phase 2)**

  - `TPane` — fill the parent, scroll only the middle, anchor header and footer.
    The `min-block-size: 0` nobody gets right the first time now lives here.
  - `TChart`/`TSparkline` gain `interpolation` (`linear | smooth | step`).
    Interpolating between buckets draws concurrency that never existed; `step`
    holds each value until the next sample. `smooth` still works.
  - `TSpanLanes` — lanes on a shared time axis, with a `marker` slot because
    failure encoded by colour alone is unreadable at ΔE 4.4 under deuteranopia.
  - `TTable` gains `rowHref`/`rowTo` (a real stretched link, so ctrl/middle-click
    and the URL survive), `rowActivatable` + `@row-activate` (a `role="button"`
    row, for an activation that is not navigation), and a `detail` slot rendered
    as a `<tr>` adjacent to its own row. The two activation modes are mutually
    exclusive and dev builds say so.
  - `TKeyValueEditor` gains the write-only `mode="secret"`: the value never
    reaches the client, so the row is the key plus set/not-set with replace and
    clear, and `set-value` on an existing key deliberately does not emit
    `update:secrets` — replacing a value changes neither which keys exist nor
    whether they are set.

  **Follow-ups from the 0.28 validation**

  - `TEmptyState frame="narrow"` — a width cap for the FRAME. 28 of one consumer's
    37 wrappers were the same `max-width: 420px`; `fill`/`inline` answered a
    different question because the original evidence said "geometry".
  - A soft `TTag` WITH a `tone` now draws that tone's ring. `--tree-tag-border` was
    computed and then discarded in the one variant a label badge uses. Changed now,
    with two consumers and both asking for it — a border on an existing look is not
    a change that can be made later.

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
