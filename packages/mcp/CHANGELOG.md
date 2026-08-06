# @treeui/mcp

## 0.8.0

### Minor Changes

- ed3167a: Turn colour into a three-layer, validated, themeable contract.

  Colour is now **primitives** (raw values, never referenced, never emitted),
  **semantics** (the public API a product fills in), and **derived states** (hover,
  press, selected, disabled — computed by the library). A product supplies one
  accent and gets a complete, contrast-checked interaction set.

  **New**

  - `contract.ts` — the versioned semantic token list, the pairs the library
    renders, and the state-distinction rules. One file, `CONTRACT_VERSION` 1.0.
  - `validateTheme` / `assertThemeValid` / `validateThemePair` — an exportable
    validator for consumer CI. Failures name the pair, both values, the measured
    ratio and the threshold.
  - `createTheme` / `createThemePair` / `createValidatedThemePair` — theming from a
    seed. `accent` is the only required input; `accentSecondary`, `neutral`,
    `status` and pointwise `overrides` are optional and validated identically.
  - 53 derived colour variables, including the first press states the library has
    ever shipped, and `--tree-color-border-interactive` (3:1 control boundaries,
    WCAG 1.4.11).
  - Storybook → **Foundation → Theme preview**: renders the component set against
    any seed, light and dark, with every contrast pair measured on the page.

  **Fixed**

  - `TButton` never changed colour on hover — the only feedback was a 1px lift.
    No component in the library had an `:active` rule.
  - Disabled was `opacity` in eight different values, dropping muted text to
    roughly 2.2:1 and invisible to any contrast check. It is now a colour held at
    the 3:1 UI floor; opacity survives only where no text is involved.
  - Control borders measured 1.29–1.86:1 against 1.4.11's 3:1.
  - Seven token values failed AA and were corrected: light `status.warning` and
    chart 2/3/7; dark `brand.primary`, `status.success` and `status.error`.
  - The elevation scale emitted a slate umbra on `:root` and reused it on the dark
    surface; shadow colour is now themed via `--tree-color-shadow-rgb`.
  - `accentCssVariables` set five variables while the ramp fed fourteen, so a
    runtime accent switch changed a button's rest colour but not its pressed one.
    `useTheme` cleared only those five, leaving nine stale inline properties.
  - `deriveBrandRamp` only checked legibility on the soft tint, letting a seeded
    brand land at 4.37:1 on the quietest surface; it now checks both, and no
    longer returns an invisible hover for a near-black or near-white seed.

  - A near-miss contrast failure printed `4.50:1 is below 4.5:1`, which reads as a
    bug in the validator to whoever has to fix it in CI. The measured ratio now
    gains digits until it is visibly under the threshold.
  - `examples/dashboard-vue` is the worked example for a product whose theme is a
    PICKER rather than a single brand colour: `src/theme.ts` holds the seed and
    every colour literal in the app, `scripts/check-theme.ts` validates all five
    accents in both modes in CI, and the settings drawer runs a custom accent
    through the same helper at pick time, so the build and the running app cannot
    disagree about what passes.
  - `docs/ai/PROMPTS/adopt-colour-contract.md` is a ready-to-run migration prompt
    for a consuming product's agent: audit (with a mandatory stop), define the
    theme, migrate, deliverables. It does not let an agent choose the brand tone.

  **Enforced**

  - `contract.test.ts` fails on any colour literal outside `primitives.ts` —
    `VALIDATION.yaml` had required this since v0.2 with nothing checking it.
  - `tokens-contract-sync.test.ts` fails when `docs/ai/TOKENS.yaml` drifts from
    what the package emits.

  No token, prop or CSS variable was removed. See `MIGRATION.md`.

- 5a37952: Row activation, a colour axis for the confirm dialog, and a template surface a
  consumer can actually type.

  **`TTable` — six edges found by adopting row activation in production**

  - The click target was the FIRST CELL, not the row. Every cell was positioned, so
    the first one became the overlay's containing block and `inset: 0` covered that
    cell alone — the whole row showed pointer and hover while only the first cell
    navigated. Only cells after the first are positioned now.
  - `is-linked` followed the presence of `rowHref`/`rowTo`, not the resolved target,
    so a row whose `rowTo` returned `undefined` rendered no link and still promised
    one with a pointer and a hover.
  - `rowActivatable` renders a real `<button>` in the first cell instead of
    `role="button"` on the `<tr>`. `role="button"` made every cell presentational
    and destroyed the table's grid semantics, so a row that was activatable AND
    contained a control had no accessible shape at all. As a side effect a control
    in another cell is now a sibling, so it no longer fires `row-activate` — the
    `@click.stop` consumers were writing can go.
  - `rowHref`/`rowTo` and `rowActivatable` are mutually exclusive, and dev builds
    say so.
  - `rowLabel` applies in both modes. It was link-only, so an activatable row's
    accessible name was every cell concatenated, with no way to pass a translation.
  - `aria-expanded`/`aria-controls` are off the `<tr>`: they announced every row as
    expandable and pointed at an id the consumer could not reach. Cell slots receive
    `detailId` and `expanded`, so the control that actually toggles carries them.

  **`TConfirmDialog`**

  - New `confirmTone` (default `danger`), forwarded to the confirm button's `tone`.
    "It composes through TButton" does not hold here: the dialog owns its footer, so
    there is no call site to compose from.
  - `confirmVariant` now defaults to `solid` rather than the deprecated `danger`,
    which was making every dialog emit the deprecation warning from inside the
    library with no action available to the consumer. Appearance is unchanged.
  - `tone` works in `variant="soft"`. The stylesheet had `outline` and `ghost` only,
    so a destructive soft button accepted the prop and did nothing.

  **Typing (`strictTemplates`)**

  - `TInput` and `TTabs` are generic over their model type, so `ref<number>` and
    `ref<'a' | 'b'>` bind without a cast and get their own type back from
    `update:modelValue` instead of a widened union.
  - Element attributes are declared props bound to the native element rather than
    left to `$attrs`: `min`/`max`/`step`/`minlength`/`maxlength`/`pattern`/
    `inputmode`/`autocomplete`/`name`/`required`/`readonly` on `TInput`, the text
    subset on `TTextarea`, and `href`/`target`/`rel`/`download` on `TButton`
    (rendered only when `as="a"`). Fallthrough works at runtime and is invisible to
    the type checker, so a numeric input or a link button was untypeable.
  - `TToggleGroup` is generic over its option type and its selection mode, so
    `single` binds a `T` and `multiple` binds a `T[]`. It was `string | string[]`
    in and `string | string[] | undefined` out — no literal-union ref could bind
    it, and `undefined` was never emitted. Found by the gate below, not by a
    consumer.
  - `TMenu` declared its `header` slot required while the template guards it with
    `v-if`, which told the type checker the guard was dead code.
  - The repo's `vue-tsc` moved to 3.x. It was 2.x while consumers were on 3.x, and
    three rounds of a reported model-typing error could not be reproduced here for
    exactly that reason. `pnpm typecheck:strict-templates` now runs the same major
    consumers do.

  **`TChart` / `TSpanLanes`**

  - `TChart` gains `seriesLabel` for the accessible table's series column, which was
    a hardcoded English `Series` with no slot — the one string in the component that
    could not go through a product's catalogue.
  - `TSpanLanes` gains `maxRows` and `overflowLabel`. Capping in the consumer with
    `.slice()` hides data without saying so, so the cap is the library's and it
    always renders a footer declaring how many lanes it left out.

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
