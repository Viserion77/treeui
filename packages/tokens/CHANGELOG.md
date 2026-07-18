# @treeui/tokens

## 0.14.0

### Minor Changes

- 2bf772b: feat: TPage + TPageHeader, a brand button variant, and deterministic TNavMenu active state

  Addresses base-component gaps surfaced in a cross-product UI/UX review.

  - **`TPageHeader`** — canonical page title block: heading (`level` 1–6), optional
    subtitle, a right-aligned `actions` area, plus `breadcrumb` and default slots. Fixes
    title hierarchy and "title + actions" alignment drifting per screen.
  - **`TPage`** — semantic page region under the app shell. Composes `TContainer` for a
    centered max-width column (`width`) and adds page-level block padding (`padded`) and
    vertical rhythm between sections (`gap`). Standardizes content width and breathing room.
  - **`TButton` `brand` variant** — a high-emphasis gradient CTA driven by a new
    `--tree-gradient-brand` token (`@treeui/tokens`). The token references the theme brand
    vars so it follows light/dark automatically; override it to match a product's marketing
    gradient. `brand` is button-only, layered on top of the shared action variants.
  - **`TNavMenu` deterministic active state** — router-link items no longer inherit Vue
    Router's inclusive `router-link-active` class, which could mark several items active at
    once (e.g. a parent and its nested route). The menu now owns a single highlight: controlled
    menus (`modelValue`) neutralize the router's classes, and uncontrolled menus let the current
    route drive selection with **exact matching by default**. New `exact` prop (menu-level) and
    `TNavMenuItem.exact` (per-item) opt back into inclusive matching for section roots.

  `@treeui/mcp`: catalog regenerated for the new component surface.

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

## 0.11.0

### Minor Changes

- 54afe01: Refresh both built-in themes with GitHub Primer-inspired palettes. The dark theme moves from a saturated navy to the softer gray-blue "Dark Dimmed" palette (`bg.primary #1c2128`, brand `#539bf5`), and the light theme adopts GitHub Light (`bg.primary #f6f8fa`, brand `#0969da`). Every color pair passes WCAG contrast checks (primary text ≥ 7:1 on surfaces, muted text/status/buttons ≥ 4.5:1). The `deriveBrandRamp` dark-mode soft/contrast bases were re-anchored to the new dark neutrals.

## 0.8.0

### Minor Changes

- 50ac321: Add a theme generator. `createBrandTheme(name, primary)` derives a full brand ramp (hover, soft tint, readable contrast, focus ring) from a single primary color and emits a `[data-tree-theme="…"]` overlay; `createCustomThemeCss(name, overrides)` builds a full custom theme by deep-merging color overrides onto a base theme. Ships with framework-agnostic sRGB color helpers (`parseHex`, `mixColors`, `darken`, `lighten`, `relativeLuminance`, `contrastRatio`, `bestContrast`, `withAlpha`) and `deriveBrandRamp`.

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

## 0.2.0

### Minor Changes

- ### @treeui/vue
  - **fix:** Generate TypeScript declaration files (`index.d.ts`) in build output via `vite-plugin-dts`
  - **fix:** Remove `:root` global overrides for `background`, `color`, and `font-family` that broke consumer apps
  - **feat:** Add `sideEffects` field to `package.json` to enable proper tree-shaking
  - **docs:** Add README with install instructions, component list, and theming docs

  ### @treeui/tokens
  - **feat:** Auto dark theme via `@media (prefers-color-scheme: dark)` fallback in `themes.css`
    - Applies dark tokens automatically when OS is in dark mode
    - Explicit `data-tree-theme="light"` still forces light theme
