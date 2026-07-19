# @treeui/react

## 0.2.2

### Patch Changes

- 2c046f3: Set a base `html { font-family: var(--tree-font-family-sans) }` in the component
  stylesheets. The design font was previously applied only through a per-component
  selector list, so unstyled prose, layout roots, and the overlays teleported to
  `<body>` (modal, drawer, popover, dropdown) fell back to the browser default
  serif. The rule is specificity (0,0,1), so any consumer rule still overrides it.

## 0.2.1

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

## 0.2.0

### Minor Changes

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

## 0.1.3

### Patch Changes

- Updated dependencies [2bf772b]
  - @treeui/tokens@0.14.0

## 0.1.2

### Patch Changes

- Updated dependencies [b90e9ac]
  - @treeui/tokens@0.13.0
  - @treeui/utils@0.13.0

## 0.1.1

### Patch Changes

- Updated dependencies [54afe01]
  - @treeui/tokens@0.11.0

## 0.1.0

### Minor Changes

- a6561c0: Add `@treeui/react`, an early React component package built on the same `@treeui/tokens` and `t-*` BEM classes as `@treeui/vue`. The first release ships `TButton`, `TInput`, `TBadge`, and `TCard`, plus the shared `TSize`, `TVariant`, `TCardVariant`, and `TBadgeTone` types. Import `@treeui/react/style.css` once to load tokens, themes, and component styles.

### Patch Changes

- Updated dependencies [50ac321]
- Updated dependencies [50ac321]
  - @treeui/tokens@0.8.0
  - @treeui/utils@0.8.0
