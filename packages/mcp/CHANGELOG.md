# @treeui/mcp

## 0.7.0

### Minor Changes

- fdbc50b: Add the named TreeUI practices as a first-class contract and refresh the landing page around them. `docs/ai/practices.json` is the canonical source for the philosophy statement and the six named UX practices, each with rules, an icon, and per-component conformance. The MCP catalog now carries a top-level `practices` section, per-component `practices` ids, a `treeui://practices` resource, and practice ids in component summaries. Storybook gains a `Foundation/Practices` page plus per-story practice notes rendered from the same data. The landing page gains a "Best practices" section linking each practice to the components that follow it, i18n (English, Portuguese, Spanish) via `TLanguageSelect`, a persistent light/dark toggle via `useTheme`, hero CTAs, and an install snippet with copy feedback.

## 0.6.0

### Minor Changes

- 8810382: Add the named TreeUI practices as a first-class contract. `docs/ai/practices.json` is the canonical source for the philosophy statement and the six named UX practices with per-component conformance. The MCP catalog now carries a top-level `practices` section, per-component `practices` ids, a `treeui://practices` resource, and practice ids in component summaries. The landing page gains a "Best practices" menu section linking each practice to the components that follow it, and Storybook gains a `Foundation/Practices` page plus per-story practice notes rendered from the same data.

## 0.5.0

### Minor Changes

- 44f01fc: Add a `search_tokens` tool and expose the design tokens in the catalog. The
  catalog previously contained no token entries at all, so an agent connected to
  the server could not see that a token existed and would hardcode its value
  instead — the observed cause of consumer apps reimplementing
  `--tree-gradient-brand` and the container max-widths by hand.

  Matching works on variable name, category, and literal value, so `64rem` or
  `#0969da` resolves to the token that already ships. Entries are generated from
  `@treeui/tokens` using the same path-to-name logic as the stylesheet, so the
  emitted `cssVar` is guaranteed to match what consumers actually load, and a test
  fails if the two ever diverge.

## 0.4.1

### Patch Changes

- 586e8fc: **Breaking:** remove the `solid` variant from `TCard`. Card variants are now `outline | soft | inset`.

  `TCard`'s `solid` variant swapped the text and background tokens (`background: var(--tree-color-text-primary)`) to produce an inverted surface. It is removed because it was inconsistent on three counts:

  - **`solid` meant two different things.** On `TButton`, `TBadge` and `TTag`, `solid` means "filled with the brand color". On `TCard` it meant "inverted neutral" — so in dark themes a solid button stayed brand blue while a solid card turned light. Card variants are a surface scale (plain → tinted → recessed), a different axis from the action variants.
  - **It coupled a surface role to a text token.** Any theme overriding `color.text.primary` silently changed the card's background, with no guarantee the result stayed legible.
  - **Inverting the surface broke nested content,** which still read the normal tokens. The workaround — a `.t-card--solid > *` block re-scoping seven tokens — never covered every case (brand-tinted table-row hover dropped to ~1.1:1 contrast) and was never ported to `@treeui/react`, so the same prop rendered differently in each framework.

  **Migration:** replace `<TCard variant="solid">` with `<TCard variant="soft">` or `<TCard variant="inset">`. For a high-emphasis card, use a brand-colored border rather than an inverted surface. If you rely on a genuinely inverted surface, it should be built on dedicated per-theme tokens rather than this swap — see `docs/ai/DECISIONS.md` → "Variant Vocabulary".

  `@treeui/mcp` ships a regenerated AI catalog, so agents reading it no longer see `solid` offered as a card variant.

  Also documented, with no code change: **TreeUI has no density axis** — spacing density is expressed through the existing `size` prop. The example dashboards label their `size` control "Density" as an application-level choice; see `docs/ai/DECISIONS.md` → "Density".

## 0.4.0

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
