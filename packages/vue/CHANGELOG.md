# @treeui/vue

## 0.17.0

### Minor Changes

- 3f094fd: Add `TFlag` and `TLanguageSelect` for language and locale selection, plus a
  `languages` icon in `@treeui/icons`.

  - `TFlag` renders a country flag from an ISO 3166-1 alpha-2 code. Assets load from
    `https://flagcdn.com` by default; `baseUrl` repoints the component at a mirror, so
    self-hosting later is a configuration change rather than a breaking one. The path
    template is part of the public contract and is documented in `SETUP.yaml`.
  - Flags use the CDN's fixed-height endpoints, which serve flat artwork at each flag's
    true proportions. The CDN does offer ratio-normalised endpoints, but it normalises
    only by switching to waving artwork, which reads as decoration beside flat UI icons.
    A shared height is what actually aligns a column of flags; the varying widths are
    absorbed by a fixed 3:2 box in CSS, so Nepal stays a pennant and Switzerland stays
    square without knocking the labels out of line.
  - When the image cannot load — an unknown code, a strict `img-src` policy, an offline
    client — `TFlag` falls back to the uppercased country code instead of an empty box,
    and retries once the resolved source changes.
  - `TLanguageSelect` reuses the listbox, keyboard and overlay behaviour of `TSelect`,
    adding a flag and an optional description per option. Options carry an optional
    `code`: flags are an imprecise proxy for languages (Spanish is not Spain, English is
    not the US), so a language with no defensible flag simply renders without one.
  - Two variants. `field` is a form control and leads with the flag, since a form label
    already says what it is. `switcher` is a page-level control for a navbar, where
    nothing nearby explains it: a translate icon opens the row and the current flag
    closes it, so the control reads as "page language, now set to this" on its own.
    `iconOnly` drops the language name for a tight bar.
  - Neither component ships locale data. The application owns its language list and all
    locale side effects; the control only emits the chosen value.

  Follow-up worth doing separately: `TLanguageSelect` currently forks `TSelect`'s listbox
  navigation rather than sharing it. Extracting a `useListboxNavigation` composable would
  remove the duplication, but it rewrites `TSelect`'s internals and is better done as its
  own change with its own regression run.

### Patch Changes

- 2c046f3: Set a base `html { font-family: var(--tree-font-family-sans) }` in the component
  stylesheets. The design font was previously applied only through a per-component
  selector list, so unstyled prose, layout roots, and the overlays teleported to
  `<body>` (modal, drawer, popover, dropdown) fell back to the browser default
  serif. The rule is specificity (0,0,1), so any consumer rule still overrides it.
- 3f094fd: Fix focus restoration in `TPopover` when a custom `trigger` slot is used, and stop
  the published type declarations from pointing outside the tarball.

  - `TPopover` bound its `triggerRef` to the built-in fallback `<button>`, which does
    not render once a consumer supplies a `trigger` slot. With a custom trigger the
    ref was `null`, so closing with Escape restored focus nowhere and focus fell back
    to `<body>` (WCAG 2.4.3). The ref now lives on the `t-popover__anchor` wrapper and
    resolves the real trigger via `focusFirst()` — the same approach `TDropdown`
    already used.
  - The `trigger` slot of `TPopover` and `TDropdown` now also receives the id of the
    panel it controls (`contentId` / `menuId`). Custom triggers previously had no way
    to wire a correct `aria-controls`; on `TDropdown` it was impossible, since the
    generated menu id was never exposed. `TDropdown` also gains an optional `id` prop,
    matching `TPopover`.
  - `vite-plugin-dts` inlined the monorepo `@treeui/*` tsconfig path aliases into the
    emitted declarations, so `TIconName` was re-exported from `../../../icons/src`, a
    path absent from the published package. Under `skipLibCheck` that silently degraded
    the type to `any` and `<TIcon name="does-not-exist" />` type-checked. These are real
    dependencies and now stay bare specifiers.

- Updated dependencies [3f094fd]
  - @treeui/icons@0.17.0

## 0.16.0

### Minor Changes

- 44f01fc: Fix two slots that were documented but non-functional.

  **`TCard` `#header` no longer swallows `#actions`.** The title and actions
  markup sat inside the `header` slot's fallback content, so filling `#header`
  removed the action buttons with no error or warning. `t-card__actions` is now a
  sibling of the slot, matching `TModal` and `TDrawer`.

  _Upgrade note:_ if you worked around this by duplicating your buttons into
  `#header`, they will now render twice — remove the duplicate.

  **`TDropdown`'s `trigger` slot now works.** `triggerRef` was bound to the
  built-in fallback button, which is inside the slot and therefore absent once you
  fill it. A custom trigger could not open the menu at all, and focus was never
  restored on close (WCAG 2.4.3). Handlers and the ref now live on the trigger
  wrapper, so a custom trigger opens on click and Enter/ArrowDown, and focus
  returns to it on Escape and after selecting an item.

- 44f01fc: Export 11 public types that were defined but unreachable from the package entry
  point — importing any of them failed with TS2614/TS2724:

  `TTableColumn`, `TTableSortState`, `TTableSortDirection`, `TAlertVariant`,
  `TAvatarStatus`, `TComboboxOption`, `TContextMenuItem`, `TTagVariant`,
  `TPricingPlan`, `TAccordionType`, `TTabsActivationMode`.

  The last three were declared without the `T` prefix required by the naming
  convention. They had never been exported, so they are published under the
  prefixed name only — no alias is needed.

  Adds a test that fails when a new type is declared without being exported or
  without the prefix, so the barrel cannot drift again.

- 44f01fc: **Security:** `TMarkdownEditor` no longer renders links or images whose URL uses
  an unsafe scheme. `[click](javascript:…)` previously reached the DOM as a live
  `href` and executed on click — the preview escapes HTML, so the URL scheme was
  the one remaining way to get script into it. Links now allow `http`, `https`,
  `mailto`, `tel` and relative URLs; images allow `http`, `https` and non-SVG
  `data:image/*`. A rejected URL renders as inert text marked with
  `t-md-editor__blocked-link` rather than being silently dropped.

  Adds a `sanitize?: (html: string) => string` prop so an app can apply its own
  policy (DOMPurify or otherwise) on top. No sanitizer is bundled.

  Also fixes the inline renderer corrupting its own output: the emphasis pass ran
  over already-generated HTML, so `target="_blank"` lost its underscore whenever a
  line held two links, and any URL containing `_` had `<em>` injected into its
  `href`. Links and images are now tokenized before the emphasis passes.

  **If you render user-authored markdown, this is a required upgrade.**

### Patch Changes

- 44f01fc: Fix four layout and token defects in the shipped stylesheets.

  - `.t-nav-menu__icon` referenced `--tree-icon-size-md`, which does not exist —
    the token is `--tree-size-icon-md`. An icon with intrinsic dimensions was
    unaffected (the 20px default happens to equal `1.25rem`), but an icon with
    only a `viewBox` rendered at roughly 1264px.
  - `.t-card__header` now wraps and `.t-card__title` can shrink, so a long title
    beside action buttons no longer overflows a narrow card. Wrapped actions
    align left, matching the existing `.t-page-header__bar` behavior.
  - The app-shell body reset matched only two nesting depths, so the common
    `body > #app > .app > .t-app-shell` structure kept the 8px user-agent margin
    and produced a second scrollbar over a `100dvh` shell. The selector is now
    depth-agnostic.
  - `TSelect`, `TDatePicker`, `TDateTimePicker`, `TMultiSelect` and `TInput` now
    set `min-inline-size: 0`, so they shrink inside a flex row instead of forcing
    it to overflow. Only their minimum changes; preferred width is untouched.

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

- 586e8fc: **Breaking:** remove the `solid` variant from `TCard`. Card variants are now `outline | soft | inset`.

  `TCard`'s `solid` variant swapped the text and background tokens (`background: var(--tree-color-text-primary)`) to produce an inverted surface. It is removed because it was inconsistent on three counts:

  - **`solid` meant two different things.** On `TButton`, `TBadge` and `TTag`, `solid` means "filled with the brand color". On `TCard` it meant "inverted neutral" — so in dark themes a solid button stayed brand blue while a solid card turned light. Card variants are a surface scale (plain → tinted → recessed), a different axis from the action variants.
  - **It coupled a surface role to a text token.** Any theme overriding `color.text.primary` silently changed the card's background, with no guarantee the result stayed legible.
  - **Inverting the surface broke nested content,** which still read the normal tokens. The workaround — a `.t-card--solid > *` block re-scoping seven tokens — never covered every case (brand-tinted table-row hover dropped to ~1.1:1 contrast) and was never ported to `@treeui/react`, so the same prop rendered differently in each framework.

  **Migration:** replace `<TCard variant="solid">` with `<TCard variant="soft">` or `<TCard variant="inset">`. For a high-emphasis card, use a brand-colored border rather than an inverted surface. If you rely on a genuinely inverted surface, it should be built on dedicated per-theme tokens rather than this swap — see `docs/ai/DECISIONS.md` → "Variant Vocabulary".

  `@treeui/mcp` ships a regenerated AI catalog, so agents reading it no longer see `solid` offered as a card variant.

  Also documented, with no code change: **TreeUI has no density axis** — spacing density is expressed through the existing `size` prop. The example dashboards label their `size` control "Density" as an application-level choice; see `docs/ai/DECISIONS.md` → "Density".

### Patch Changes

- Updated dependencies [87c7081]
  - @treeui/tokens@0.15.0

## 0.14.0

### Minor Changes

- 2bf772b: feat(file-upload): per-file upload state, resumable retry, and thumbnails

  `TFileUpload` can now render the whole lifecycle of an upload instead of only the
  picked file list.

  - **`uploadState`** — a new prop taking either a `ReadonlyMap<File, TFileUploadState>`
    or a `(file, index) => TFileUploadState | undefined` resolver. Both shapes key on the
    `File` object (never on index or name), and an unknown `File` renders name + meta only.
  - **Per-row progress** — determinate or indeterminate bar, percentage, uploaded bytes,
    and a remaining-time estimate, composed into one status line. An errored bar holds its
    last progress in the error tone rather than resetting, so the resume offer stays legible.
  - **`retry` / `cancel` events** — Retry offers `Resume from 90%` when the state is
    `resumable`, otherwise a plain restart; Remove and Clear all emit `cancel` so in-flight
    requests can be aborted.
  - **Thumbnails** — client-only object URLs for image files, revoked on removal and unmount,
    with an extension chip for everything else (and for SSR, so hydration matches).
  - **New props**: `dragLabel`, `dragRejectLabel`, `thumbnails`, `maxThumbnailSize`,
    `retryLabel`, `resumeLabel`, `remainingTimeFormat`, `statusLabels`.
  - **New slots**: `file` and `file-status` for per-row customization.
  - **New exported types**: `TFileUploadState`, `TFileUploadStateSource`, `TFileUploadStatus`,
    `TFileUploadRetryPayload`, `TFileUploadCancelPayload`, `TFileUploadFileSlotProps`.

  **BREAKING** — `loading` is now presentational on `TFileUpload`. It previously disabled the
  dropzone, the native input, Clear all, and every Remove, which made it impossible to remove
  file 1 while file 4 was uploading. It now only conveys busy state (`aria-busy`, `is-loading`).
  Use `:disabled` to reproduce the old behavior; prefer driving `uploadState` and freezing
  nothing. This aligns `loading` with the other form value controls (`TInput`, `TSelect`,
  `TTextarea`, `TCombobox`), where it has always been presentational.

  Accessibility: terminal transitions are announced with filenames through a polite
  `role="log"` region that appends each message, so a retry failing with the identical error
  is still announced; percentages reach assistive tech via each row's progressbar rather than
  the live region; and focus is rescued when a focused Retry unmounts.

  `@treeui/mcp`: catalog regenerated for the new `TFileUpload` surface.

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

### Patch Changes

- Updated dependencies [2bf772b]
  - @treeui/tokens@0.14.0

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
