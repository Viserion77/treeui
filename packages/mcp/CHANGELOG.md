# @treeui/mcp

## 0.3.0

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

## 0.2.0

### Minor Changes

- a6561c0: **Breaking:** adopt a single `T`-prefixed public surface and drop the `Tree<Name>` compatibility layer.
  - The `Tree<Name>` component aliases and their global plugin registrations are removed; use `T<Name>` exports only (the `TNavbar` / `TAppBar` and `TSteps` / `TStepper` pairs remain).
  - Exported types are renamed: `TreeSize` → `TSize`, `TreeVariant` → `TVariant`, `TreeBadgeTone` → `TBadgeTone`, `TreeIconName` → `TIconName`, and so on.
  - Source SFCs are renamed `T<Name>.vue`, and component BEM classes are renamed `tree-*` → `t-*` (for example `tree-button` → `t-button`).
  - Design-token CSS variables keep the `--tree-*` prefix and the `[data-tree-theme]` attribute is unchanged, so theming is not affected.

  Migrate by replacing any `Tree<Name>` imports/usages with `T<Name>`, updating the renamed type names, and renaming `tree-*` class selectors to `t-*` in custom CSS.

## 0.1.1

### Patch Changes

- Improve TreeUI consumer ergonomics and release safety by adding semantic badge tones, numeric select values, breadcrumb router targets, built-in stat loading, clearer recipes/docs, and release tarball verification for published packages.
