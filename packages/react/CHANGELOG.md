# @treeui/react

## 0.3.0

### Minor Changes

- 8810382: Harden the consumer-facing contract for icon-only actions, loading buttons, plain-text output, table semantics, and immersive layouts.

  **TButton — icon-only actions (`iconOnly`, `label`)**

  `iconOnly` renders a square control that matches its size token instead of a padded pill, and suppresses the `t-button__label` wrapper. Because the `icon` slot is `aria-hidden`, an icon-only button needs an explicit name — `label` is the first-class channel and is rendered as `aria-label`. Mirrored in `@treeui/react` (which names itself via `aria-label`).

  **TButton — localized, single-glyph loading (`loadingLabel`, `hideIconWhileLoading`)**

  The loading announcement was hardcoded to English "Loading" with no way to translate it. `loadingLabel` forwards to the nested spinner, so the state is announced in the app's locale — consistent with TreeUI shipping English defaults as overridable props rather than an i18n layer.

  The spinner also used to render _beside_ a supplied icon, showing two glyphs and widening the button mid-action. The spinner now replaces the icon by default. **Behavior change:** pass `hideIconWhileLoading: false` to restore the previous spinner + icon + label order.

  **TText — `preserveWhitespace`**

  Renders authored line breaks and blank lines as written (`white-space: pre-wrap`) while still wrapping long lines, so plain-text output such as AI responses no longer needs a local `white-space: pre-wrap` class. Mutually exclusive with `truncate`, which wins when both are set.

  **TTable — honest semantics and a reachable accessible name (`caption`)**

  TTable applied `role="grid"` without implementing the composite-widget keyboard model — no roving tabindex, no `gridcell`/`row` roles, no 2D arrow-key navigation. Screen readers announced an interactive grid and offered cell navigation that did not exist. **Behavior change:** the explicit role is removed and the component is now a native reading table. An opt-in interactive grid mode is deliberately withheld until the keyboard model ships.

  The accessible name was also unreachable: `role="grid"` sat on the `<table>` while attributes fell through to the `.t-table-wrapper` scroll container, so a consumer's `aria-label` never reached the named element. `inheritAttrs` is now false — `class`/`style` stay on the wrapper and every other attribute is forwarded to the `<table>`. The new `caption` prop renders a visible `<caption>`.

  **TAppShell — `immersive`**

  Hides the header and sidebar so content fills the viewport, replacing consumer-side `:deep()` overrides of `.t-app-shell__header` / `.t-app-shell__sidebar` plus a re-templated grid. The chrome is hidden with CSS rather than unmounted, so toggling never remounts the default slot. Follows the existing controllable pattern (`immersive` / `defaultImmersive` + `update:immersive` / `immersive-change`).

  Because immersive hides the chrome, the default slot is the only place an exit control can live, so it now also receives `immersive` and `toggleImmersive`. `AppShellSlotProps` gains both.

  **Internal glyphs now resolve through the icon registry**

  `TAppShell` (hamburger, collapse toggle), `TTag` (remove) and `TTable` (sort affordances) rendered hand-inlined SVGs that bypassed `@treeui/icons`. They now resolve through the registry, so they follow the same geometry and any registry override. The collapse toggle additionally reflects direction (`panel-left` / `panel-right`) instead of a single static glyph. Expect small visual diffs where the registry geometry differs from the old inline paths.

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
