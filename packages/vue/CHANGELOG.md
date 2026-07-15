# @treeui/vue

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

### Patch Changes

- Updated dependencies [b90e9ac]
  - @treeui/tokens@0.13.0
  - @treeui/utils@0.13.0

## 0.12.0

### Minor Changes

- Add `TAppShell`, a full-viewport application layout that pairs a top header with a persistent side navigation and a fluid content area.

  - Fills the entire viewport (`100dvh`, full width) so the content stretches across large monitors instead of sitting in a centered column, while the content region scrolls independently.
  - Switches the sidebar into an off-canvas drawer when `mobile` is set, or automatically below `breakpoint` (default `768px`) when `mobile` is left undefined. The mobile drawer ships with a header menu button, backdrop, body-scroll lock, focus trap, and Escape-to-close.
  - Supports a `left`/`right` sidebar, an optional collapsible desktop rail via `v-model:collapsed`, and a controllable mobile drawer via `v-model:sidebarOpen`.
  - Provides collapsed state to descendants, so a `TNavMenu` placed in the `sidebar` slot adapts automatically, matching `TSidebar`.

## 0.11.0

### Patch Changes

- Updated dependencies [54afe01]
  - @treeui/tokens@0.11.0

## 0.10.0

### Minor Changes

- 7303791: Tree-shakable build: the package is now emitted with `preserveModules` (one output file per source module, ESM + CJS) instead of a single monolithic bundle, and `sideEffects` covers only CSS. Consumer bundlers can now drop unused components — an app importing only `TButton` bundles ~4 kB of TreeUI code instead of ~150 kB. Entry points (`.`, `./style.css`) and the public API are unchanged.

### Patch Changes

- 7303791: Visual fixes:

  - `TAvatar`: the status dot is no longer clipped into a sliver by the avatar's circular mask (`overflow: hidden` moved off the root); its ring now matches the surface behind it (`--tree-color-bg-surface`).
  - `TCard`: inside the `solid` variant, re-scoped background tokens are now mixed over the captured surface color instead of transparency, so floating layers (dropdown menus, select listboxes) are opaque and readable again.

## 0.9.0

### Minor Changes

- 3b98dce: Component polish surfaced while building the example dashboards:

  - `TCard`: the `solid` variant now re-scopes the core color tokens for nested content, so titles, tables, timelines, and dividers stay legible on the inverted surface in both light and dark themes.
  - `TDropdown`: new `align` prop (`start` | `end`) aligns the menu to the trigger's end edge for triggers near the right side of clipping containers (e.g. table action columns); the menu also grows to fit its items instead of wrapping or truncating labels.
  - `TSelect`: the listbox flips above the trigger when there is not enough space below it (e.g. near the bottom of a modal or the viewport).
  - `TSidebar`: custom header and footer content is centered while collapsed so it lines up with the nav icon column.
  - `TFormField`: slightly larger label-to-control gap so control focus rings no longer overlap the label.

## 0.8.0

### Minor Changes

- a6561c0: **Breaking:** adopt a single `T`-prefixed public surface and drop the `Tree<Name>` compatibility layer.
  - The `Tree<Name>` component aliases and their global plugin registrations are removed; use `T<Name>` exports only (the `TNavbar` / `TAppBar` and `TSteps` / `TStepper` pairs remain).
  - Exported types are renamed: `TreeSize` → `TSize`, `TreeVariant` → `TVariant`, `TreeBadgeTone` → `TBadgeTone`, `TreeIconName` → `TIconName`, and so on.
  - Source SFCs are renamed `T<Name>.vue`, and component BEM classes are renamed `tree-*` → `t-*` (for example `tree-button` → `t-button`).
  - Design-token CSS variables keep the `--tree-*` prefix and the `[data-tree-theme]` attribute is unchanged, so theming is not affected.

  Migrate by replacing any `Tree<Name>` imports/usages with `T<Name>`, updating the renamed type names, and renaming `tree-*` class selectors to `t-*` in custom CSS.

### Patch Changes

- Updated dependencies [a6561c0]
- Updated dependencies [50ac321]
- Updated dependencies [50ac321]
  - @treeui/icons@0.8.0
  - @treeui/tokens@0.8.0
  - @treeui/utils@0.8.0

## 0.7.0

### Minor Changes

- 5e9b553: Add `TIcon` (alias `TreeIcon`) component: render any registered TreeUI icon by `name` with consistent sizing and a11y defaults. Icons are decorative (`aria-hidden`) by default, becoming `role="img"` with `aria-label` when a `label` prop is provided.

### Patch Changes

- 5e9b553: Sync root `vite` devDependency spec to `^8.0.14` to match the lockfile resolution. The Dependabot security PR bumped the lockfile (vite 5 → 8) without updating the `package.json` spec; this aligns them.
- Updated dependencies [5e9b553]
  - @treeui/tokens@0.7.0
  - @treeui/utils@0.7.0
  - @treeui/icons@0.7.0

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

- Updated dependencies [c5fb383]
  - @treeui/tokens@0.6.2
  - @treeui/utils@0.6.2
  - @treeui/icons@0.6.2

## 0.6.1

### Patch Changes

- Improve TreeUI consumer ergonomics and release safety by adding semantic badge tones, numeric select values, breadcrumb router targets, built-in stat loading, clearer recipes/docs, and release tarball verification for published packages.

## 0.6.0

### Minor Changes

- feat: Milestone 3 — Routing, Cards & Inline Links
  - TNavMenu: add `to` and `icon` props to TreeNavMenuItem; render RouterLink when vue-router is available, button otherwise
  - TCard: add `title` prop and `#actions` slot for built-in header semantics; `#header` slot remains as full override
  - TCard: add `variant="inset"` for nested sub-sections inside other cards (subtle bg, no shadow, light border)
  - TLink: new inline link component with `to` (RouterLink), `href` (anchor), `external`, `disabled`, and `variant` (default | muted | danger)
  - Add `.tree-eyebrow` CSS utility class using existing typography tokens
  - Add skeleton TablePlaceholder and CardPlaceholder composition recipes
  - Create nav-menu.yaml and link.yaml AI contracts; update card.yaml and CONTRACTS.yaml

## 0.5.0

### Minor Changes

- Add `TDateTimePicker` with a custom TreeUI-styled date and time surface, plus public exports, Storybook docs, showcase coverage, and component tests.

## 0.4.0

### Minor Changes

- Ship the app-ready surface from Milestone 1 and Milestone 2, including the new application primitives
  and layout helpers such as `TStat`, `TMultiSelect`, `TNumberInput`, `TSelectableList`, `TTreeView`,
  `TSteps` / `TStepper`, `TToggleGroup`, `TContainer`, `TGrid`, `TStack`, `TSidebar`, `TNavMenu`,
  and `TNavbar` / `TAppBar`.

  Refresh the docs with shipped roadmap status, explicit alias and naming conventions, docs-first pattern recipes,
  and updated release guidance.

## 0.3.0

### Minor Changes

- Add new app-ready Vue components including `TCombobox`, `TConfirmDialog`, `TEmptyState`, `TTimeline`, and `TFileUpload`.

  Expand the package surface with typed exports, stories, tests, and contract/docs coverage for the new components, including drag-and-drop and `Ctrl+V` paste support in `TFileUpload`.

## 0.2.1

### Patch Changes

- Fix `TreeToastProvider` so it renders the default slot while still teleporting toast notifications to `body`.

  Improve package DX by adding a CommonJS export path and JavaScript source maps to the Vue build output.

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

### Patch Changes

- 97716f8: Fix lint errors and warnings across components
  - Remove unused `useSlots` import in `TreeBreadcrumbItem`
  - Remove unused `onBeforeUnmount` import and `listType` variable in `TreeMarkdownEditor`
  - Fix unused expression in `TreePopover` (replace `||` with proper `if` statement)
  - Fix `vue/max-attributes-per-line` warnings in `TreeAccordionItem`, `TreeMarkdownEditor`, `TreePagination`, and `TreePopover`
  - Fix `vue/singleline-html-element-content-newline` warnings in `TreeFormField`
  - Suppress intentional `v-html` warning in `TreeMarkdownEditor` preview pane
  - Prefix unused `file` parameter in `MarkdownEditor` stories

- Updated dependencies
  - @treeui/tokens@0.2.0
