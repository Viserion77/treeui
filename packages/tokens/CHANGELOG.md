# @treeui/tokens

## 0.15.0

### Minor Changes

- 87c7081: Add layout, typography and theming primitives so app-level chrome no longer needs hand-written CSS.

  **Layout & typography (`@treeui/vue`)**

  - **TText** — typography primitive (`size`, `tone`, `weight`, `truncate`, polymorphic `as`).
  - **TSpacer** — flexible spacer that absorbs free space / pins content to the end.
  - **TKbd** — keyboard-key hint chip.
  - **TSplit** — responsive main + aside two-pane layout that stacks when narrow (no media query).
  - **TStackItem** — per-child flex control (`grow`, `shrink`, `basis`, `minWidth`, `align`) for a `TStack`.
  - **TButton** — new `block` (full-width) and `align` (`start`/`center`/`end`) props.
  - **TStack** — new `grow` prop to fill the parent's main axis.

  **Form control sizing**

  - **`width` prop on TInput / TSelect / TTextarea** — a shared `TFieldWidth` scale (`xs` 8rem → `xl` 32rem, `full` default) that caps a control's inline size via `max-inline-size`, so it still shrinks on narrow containers. Replaces inline `width` / `max-width` styles at call sites.

  **App shell & drawer fixes**

  - **TAppShell** — new `sidebar-header` and `sidebar-footer` slots. The footer pins to the bottom of the rail, and both are inset to match `TNavMenu`'s item padding so a brand mark and a user row line up with the nav icons instead of the rail edge.
  - **TAppShell** — built-in collapse toggle in the sidebar footer (`showCollapseButton`, `collapseLabel`, `expandLabel`, `collapse-icon` slot), mirroring the existing mobile menu button. Apps no longer have to place a collapse control in the global header.
  - **TDrawer** — the scrolling body no longer clips focus and selection rings painted outside an edge-flush control (e.g. a selected colour swatch).
  - **TStack** — no longer forces `width: 100%`. A flex container already fills its container as a block-level box, while the forced width made nested stacks claim a whole row and starve sibling `TSpacer`s, so header clusters could not be pushed to the edges.
  - **TChart** — the visually-hidden data table is now wrapped in a hidden `<div>`. A `<table>` ignores a width below its min-content, so hiding it directly left a full-width box that added horizontal page scroll.
  - **TAppShell** — resets the default body margin (scoped with `:has()` to pages that mount a shell) so the viewport-sized frame sits flush instead of leaking an 8px offset and a stray page scrollbar.

  **Theming**

  - **`useTheme()` (`@treeui/vue`)** — theme-mode + accent controller: resolves `system` against the OS, writes `data-tree-theme`, persists the choice, and re-derives a custom accent whenever the theme flips.
  - **TColorSwatch (`@treeui/vue`)** — preset colour swatches with an optional native colour input, built for accent pickers.
  - **`accentCssVariables()` (`@treeui/tokens`)** — the brand ramp as runtime-applicable CSS custom properties.
  - **`deriveBrandRamp()` (`@treeui/tokens`)** now keeps the brand colour legible: the primary doubles as text on its own soft tint, and a raw accent often failed WCAG AA there (a mid-tone blue lands at ~4.25:1 on the light tint and ~2.7:1 on the dark one). It is now walked darker/lighter until it clears, and the on-brand text colour flips with it. Pass `ensureLegible: false` to keep the previous verbatim behaviour.

  **Layout regressions fixed**

  - **TDrawer / TModal** — the wrapper that hosts an optional trigger no longer occupies layout when there is no trigger. As empty `inline-flex` boxes they still generated a line box (~18px), silently adding page height — enough to push a viewport-sized shell past `100vh` and render a second scrollbar next to the shell's own.
  - **TAppShell** — new `header-start` slot. With it the header mirrors the shell's grid columns, so content in the `header` slot lines up with the content panel below instead of floating over the rail boundary.

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
