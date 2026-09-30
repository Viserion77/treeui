# @treeui/react

## 0.5.0

### Minor Changes

- 6f62a18: `@treeui/react`'s `TButton` gains the tone axis, so the four ecosystems now spell a destructive action the same way.

  **`tone` is a second axis, orthogonal to `variant`.** `tone="neutral" | "brand" | "accent" | "success" | "warning" | "danger" | "info"` emits `has-tone` plus `t-button--tone-<tone>`, the same closed vocabulary (`TActionTone`, from `@treeui/tokens`) the Vue component and the two ports use. On `solid` it fills; on `outline`, `ghost` and `soft` it inks only the label and the border. Before this, the only destructive React button was `variant="danger"` — a filled red block — so "destructive, but not the primary action of this row" was inexpressible, and the spelling that expresses it, `variant="ghost" tone="danger"`, was a type error.

  **`variant="danger"` now warns in development builds.** It is a colour trapped in the shape scale, which is why it cannot combine with `outline`/`ghost`/`soft`. It keeps working and renders identically; `variant="solid" tone="danger"` is the replacement. An `iconOnly` button with no `aria-label` or `aria-labelledby` warns too — it has no visible text and an `aria-hidden` glyph, so without one of those it reaches assistive tech unnamed. Both checks sit behind a bare `process.env.NODE_ENV !== 'production'` compare, so a consumer's production bundle drops them along with their strings.

  **The stylesheet gained the tone machinery, which is what makes the prop do anything.** `packages/react/src/style.css` predated the tone axis: its `.t-button` assigned `--tree-button-bg: var(--tree-color-brand-primary)` directly, with none of the `--tree-button-accent-*` indirection a tone resolves through, and it had no `.t-button--tone-*`, `has-tone`, `--block` or `--align-*` rules at all. A `tone="danger"` button emitted the right classes and painted brand blue. Ported from `@treeui/vue`, which is the source of truth for every shared `t-*` block: the accent triple on `.t-button`, `solid`/`soft` rewritten against it, the three `has-tone` rules that ink a quiet variant without filling it, and all seven tone blocks. `variant="ghost" tone="danger"` now resolves to a transparent button with a `#d1242f` label on light and `#f5766e` on dark, at 5.24:1 and 5.51:1.

  **`block` and `align` land with it.** `block` emits `t-button--block` for a full-width button; `align="start" | "end"` emits `t-button--align-start` / `t-button--align-end`, which only means anything once the button is wider than its content — `center` is the base rule and emits no class. Neither class had a rule in this package's stylesheet before, so a React consumer's only route to a full-width or left-aligned button was hand-written CSS.

  `TActionTone` — and `TAccent`, `TBreakpoint`, `TFieldWidth` and `TTooltipSide`, which the vocabulary move in this release describes as reaching the public surface — are now actually exported from the package root rather than only from the internal `types.ts` that re-exports them. Typing a `tone` variable in a consumer app meant reaching into the package source before this.

  **The badge reads its tint from the derived token instead of mixing its own.** `--tree-badge-soft-bg` and `--tree-badge-danger-bg` were hand-rolled `color-mix(in srgb, var(--tree-color-status-x) 14%, var(--tree-color-bg-surface))`, which is the pattern `@treeui/tokens`' `states.ts` exists to delete; they now read `--tree-color-status-x-soft` like the Vue stylesheet does. The 14% mixes resolve byte-identically to the token in both themes, so `variant="soft"` does not change. The `danger` slots mixed 16% and 18% and land 2–4% lighter on the token, with the ink unchanged and every pair measuring between 4.54:1 and 5.33:1. Badge icons also scale with the badge size now (`.t-badge--sm`/`--lg`), which needed the rule that consumes `--tree-badge-icon-size` as well as the two that set it.

  **The package has tests now.** `TButton.test.tsx` is the first, and it renders with `renderToStaticMarkup` because the whole contract of a class-driven component is which classes and ARIA attributes come out. The part worth keeping is the parity check: it parses the `tv()` config and the state dictionary out of `packages/vue/src/components/TButton.vue` and asserts the React button emits exactly the string the Vue button would for the same props. The two packages share one stylesheet, so a renamed or reordered class is not a cosmetic difference — it is an unstyled button, and nothing else in the suite could see it. `style-parity.test.ts` closes the other half of that gap: it compares the two stylesheets rule by rule, because matching class names on a stylesheet that lacks the rules is exactly how the tone axis shipped inert the first time.

- 6f62a18: The closed vocabularies move into `@treeui/tokens`, and the token model gains a second and third rendering.

  **A closed set kept in four places is not closed.** `sm | md | lg`, `solid | outline | ghost | soft`, the seven action tones — these are design decisions, not framework ones, and every ecosystem that renders TreeUI has to reproduce exactly the same members. They lived in `@treeui/vue`'s `types/contracts.ts`, which meant `@treeui/react` shipped a hand-typed copy with a comment promising to centralize it, and a non-web target had nowhere to import them from at all. They now live in `@treeui/tokens`: `treeSizes`, `treeVariants`, `treeCardVariants`, `treeActionTones`, `treeBadgeTones`, `treeAccents`, `treeBreakpoints`, `treeFieldWidths`, `treeTooltipSides`, `treeDrawerSides`, with their types.

  Nothing moves for a consumer. `@treeui/vue`'s `types/contracts.ts` re-exports every name it exported before, and `TBadgeTone` is still exported from `TBadge` as well as from the shared surface. `@treeui/react`'s types are now re-exports rather than re-declarations, which also adds `TAccent`, `TActionTone`, `TBreakpoint`, `TFieldWidth` and `TTooltipSide` to its public surface.

  **`@treeui/tokens` can now render itself for a target that has no CSS.** `css.ts` has always emitted custom properties; `native.ts` resolves the same model into numbers and colours — `rem` into pixels, `color-mix()` into a real alpha, the elevation scale tinted by each theme's own umbra, the brand gradient into an angle and stops — and `kotlin.ts` and `rust.ts` emit source from that. New exports: `resolveNativeTokens`, `nativeParityReport`, `resolveTone`, `NATIVE_TONES`, `NATIVE_TOKEN_GROUPS`, `NATIVE_VOCABULARIES`, `createKotlinTokens`, `createRustTokens`.

  `nativeParityReport` is the part that matters: it compares the stylesheet's variables with the resolved model key by key, and `native.test.ts` fails the build on a token that is in one and not the other. Adding a token without teaching the resolver about it would otherwise turn a second ecosystem into a stale copy of the design system — which is worse than no copy, because it still looks authoritative.

  **The tone axis is data now, and the stylesheet is tested against it.** The mapping from a tone to the ten colours it resolves to only ever existed as seven blocks of `.t-button--tone-*` assignments. It is `NATIVE_TONES`, and a new `tone-contract.test.ts` parses the shipped stylesheet and fails when the two disagree, so one decision has three renderings and no hand-maintained copy.

  **A deprecated member is declared as one.** `treeDeprecatedVariants` names `danger` — a colour trapped in the shape scale, which is why the tone axis exists — so a generator can leave it out. It keeps working on the web, where removing it would break consumers.

  `TButton`'s tone axis is also documented at last. It has shipped since the axis was introduced, but the Vue Storybook had no `tone` control and no tone story — so the decision that motivated splitting colour out of the shape scale was only visible in `DECISIONS.md`. Three stories now cover it: every tone, one tone across all four variants, and the row the axis exists for — a destructive action sitting quietly among other quiet ones.

  Also in this release: `TTagInput`'s and `TAppShell`'s example and test fixtures use neutral sample data, and a number of source comments, contract notes and changelog entries that justified a decision by pointing at an external application now state the same claim as a property of the problem. No behaviour changes with any of it.

- 97a1cec: The library takes back the layout work it had been leaving to consumers: a surface no longer grows to fit something inside it, an anchored panel is no longer clipped by an ancestor, and the strings a screen reader announces are props rather than English literals.

  This closes a measured audit of `@treeui/vue` 0.31.0 — every item below came with a repro, pixel measurements at 320/390/600/1440, and a consumer case. They are not thirty-one independent defects; they are four causes.

  **A surface takes its container's width.** `.t-card`, `.t-card__body`, `.t-modal__body`, `.t-confirm-dialog`, `.t-timeline`, `.t-timeline__content`, `.t-nav-menu__list` and `.t-nav-menu__copy` are grids with no `grid-template-columns`, so their track was the implicit `auto` — whose minimum is the **min-content of its items**. One descendant that cannot break (a `TTable`, a `TCodeBlock`, a machine string) behind any wrapper widened the whole surface, and then every sibling on it was laid out at the inflated width: `TText truncate` never engaged because the box grew instead of clipping, the `TTable` wrapper's `overflow-x` never scrolled because the track grew in its place, and anything aligned to the end — a modal's close button, a footer, a card's `#actions` — was painted outside the surface or on top of the neighbouring card. A `TModal size="lg"` holding a markdown editor measured 651px of overflow at 1440, with close and save unreachable. They all declare `minmax(0, 1fr)` now. `.t-confirm-dialog--with-icon` becomes `auto minmax(0, 1fr)`.

  **Text that can arrive without a break opportunity wraps.** `overflow-wrap: anywhere` on `.t-modal__title`, `.t-modal__description`, `.t-card__title`, `.t-timeline__title`, `.t-timeline__description`, `.t-nav-menu__label`, `.t-nav-menu__description` and `.t-select__option`. `anywhere`, not `break-word`: only `anywhere` reduces the min-content, which is the property that lets the box shrink at all. `TCodeBlock`'s `wrap` had exactly this bug — it promised to wrap and used `break-word`, which breaks only once a width is already settled, so in a table cell or an `auto` track a URL still set the minimum width and pushed the container. `TText` had it too, in the cascade: `.t-text.is-pre-wrap` is (0,2,0) and `.t-text--wrap-anywhere` was (0,1,0), so `preserveWhitespace` silently downgraded `wrap="anywhere"` to `break-word`. The wrap axis is now qualified with `.t-text` and wins.

  **An anchored panel is rendered in a layer nothing can clip.** `TPopover`, `TMenu`, `TSelect` and `TDatePicker` positioned their panels `absolute` inside their own root, which puts them in an ancestor's clip and an ancestor's coordinate space. One cause, four symptoms: a popover inside the `TAppShell` sidebar was cut off and unreachable, `align="end"` on a trigger away from the right edge opened the panel at a negative `left` with its first column off-screen, the select listbox was cut off by the `TTable` wrapper's `overflow`, and the date-picker panel was trapped in a modal surface. All four now render through `<Teleport to="body">` and are placed by a new exported composable, **`useAnchoredLayer`**, which measures from the trigger's viewport rect, flips to the opposite side when the requested one has no room, and clamps the panel into `[16px, innerWidth - 16px]` — a width that _would_ fit is not the same as a position that fits. **This changes where the panel lives in the DOM:** it is no longer a descendant of the component's root, so a test or a selector that descends from the trigger's container has to read `document.body` instead.

  **Controls stay inside the surface they belong to.** `.t-card__actions` was `flex-shrink: 0` and is now allowed to shrink and wrap, like the header it sits in. `.t-list-item__actions` takes its own line inside the container query that already drops the meta, rather than squeezing the content column to 40–110px. `.t-tabs__list` scrolls within its own strip (`overflow-x: auto`, `overscroll-behavior-x: contain`) instead of pushing the page sideways, and `TTabList` scrolls the active tab into view when it changes. `.t-modal__surface` becomes a flex column that clips, with `.t-modal__body` as the only scroller — the whole surface used to scroll, which put the footer's actions below the fold on a short viewport.

  **Accessibility fixes that were not optional.** A `TText tone="muted"` inside a selected `TToggleGroup` item kept reading `--tree-color-text-muted` over the brand fill and measured **1.18:1 in light and 1.09:1 in dark**, against the 4.5:1 that `xs` text requires; the selected item now rebinds that token to `--tree-color-brand-contrast`, the one value that clears AA in both themes (5.19:1 / 6.21:1). `TFileUpload`'s "Clear all" and "Remove" and `TToast`'s "Dismiss notification" were hard-coded English with no way out, leaving those controls unnamed to a screen reader in any other language: they are now `clearLabel`, `removeLabel`, `removeAriaLabel` (a function, because the file name sits inside the sentence) and `closeLabel` (on `TToastProvider` as the instance default, or per toast). `.t-app-shell__main` gains `position: relative`, without which the library's own `.t-visually-hidden` `TProgress` label anchored to the initial block and extended the **document's** scroll past the `100dvh` shell.

  **New and changed public API.**

  - **`TIcon.size` is now `number | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`.** It was `number | string`, so `<TIcon size="sm" />` type-checked, wrote `width="sm"` onto the svg, and left the icon unsized — it then stretched to fill its container, measured at 300px. The token names map to the icon scale (16/20/24/32/48). **This is the one breaking change here:** a free-form CSS length is no longer accepted, and for JavaScript consumers an unknown value falls back to the default with a development warning instead of rendering at an arbitrary size.
  - **`TSelect` is generic over its value** (`T extends string | number = string`), so a `ref<'scan' | 'query'>` gets its own literal union back from `v-model` instead of a widened `string | number` — the move `TInput`, `TTabs` and `TToggleGroup` already made. Consumers running `strictTemplates` lose a cast at every binding.
  - **`useBreakpoint`** answers the breakpoint question in JavaScript, from the same `--tree-breakpoint-*` values `TShow`/`THide` are generated from, so the two cannot drift. It is the escape hatch, not the default: `TShow`/`THide` still win for anything purely visual, because both of their branches render and neither flashes. Reach for this when a branch must not **mount**, or when the answer is not about rendering at all.
  - `TBadge` gains `truncate` and `label` (Vue and React). The default stays wrapping — a status pill that silently loses the end of its text is worse than a two-line pill — and a wrapped second line no longer touches the border, because `line-height: 1` has become the UI line height with block padding.
  - `TTable` columns gain `minWidth`, a floor that the automatic table layout must honour. `width` could not be one: under `table-layout: auto` a CSS width on a cell is a suggestion, and the algorithm goes under it whenever the row is tight.
  - `TChart` **measures** its axis labels instead of reserving 44px on the left and one x label per 52px. A formatted `1,234,567` was clipped and month names overlapped; the first and last x labels also anchor inward so they cannot leave the SVG. `yAxisWidth` fixes the gutter when several charts need to line up.
  - `TCodeBlock` gains `size`, `TTextarea` gains `spellcheck` (a real `<textarea>` attribute missing from the declared surface — it is what stops a mono JSON editor underlining every key).
  - `TPageHeader` reads its `#title`/`#subtitle` slot presence during render. A `computed` over `useSlots()` cached the first answer, so a conditionally provided slot never appeared, or left an empty `<h1>` behind.
  - `TAppShell` hides the collapse toggle inside the auto-rail band and derives its `aria-expanded`/`aria-label` from the effective state. In that band the width decides, so the button could not change anything, did nothing when pressed, and announced the manual preference rather than what was on screen.
  - Smaller: `TLinkTile`'s default slot no longer stretches its children (a four-character `TTag` was as wide as the description); `TDatePicker`'s month title capitalises only its first letter, so pt-BR reads "Setembro de 2026" rather than "Setembro De 2026"; the `TAppShell` skip link stops painting a shadow while hidden, which had been a permanent grey smudge in the top-left of every header.

### Patch Changes

- 6f62a18: **`TBadge`'s tinted variants had an illegible label, including with no props at all.**

  `soft` and `danger` painted the label with the tone's full-strength colour on the tone's own tint. Measured against the surface, eight of the ten tone/theme pairs fell below the 4.5:1 that WCAG 1.4.3 asks of normal-size text:

  | `soft` tone | light    | dark     |
  | ----------- | -------- | -------- |
  | neutral     | 4.56     | **4.49** |
  | success     | **4.31** | **4.36** |
  | warning     | **4.30** | **4.38** |
  | danger      | **4.19** | **4.45** |
  | info        | **4.26** | 5.33     |

  `variant="soft" tone="neutral"` is what `<TBadge>` renders with nothing passed, and in the dark theme it measured 4.49:1 — one rounding step from passing, which is how it survived review.

  Both variants now read the tone's `*-on-soft` colour. That token already existed and already carried this exact job: it is derived to clear AA on a tint and it deepens as the tint deepens, which is why `.t-button--soft` has always used it. Every pair now clears, worst case 4.54:1. **The label colour changes visibly on tinted badges** — it is a step darker in light mode and a step lighter in dark.

  Nothing had caught it. `CONTRAST_PAIRS` in `contract.ts` checks the semantic colours against the three surfaces, and a component pairing two semantic colours of its own is not in that list. It was found by rendering: the new Compose and egui ports each measure the full variant × tone × theme matrix in their own suites, and both failed here independently before the web had a test that could. `packages/tokens/src/badge-contrast.test.ts` is that test now.

  The mapping itself is no longer only CSS. `NATIVE_BADGE_TONES` in `@treeui/tokens` declares all twenty cells, `badge-tone-contract.test.ts` parses the shipped stylesheet and fails if the two disagree, and both ports generate their accessor from it instead of deriving it by hand a third time.

  One thing that is NOT fixed, and is recorded rather than changed: `--tree-badge-solid-text` is `--tree-color-brand-contrast` for every tone, including the four status ones. It measures 5.19:1 to 8.13:1 today, so it passes — but it passes because the shipped status hues happen to be dark enough, not by construction. `TButton` does this properly, reading the per-theme `--tree-color-status-*-contrast`. A product re-theming the brand or seeding a lighter warning would break the badge and not the button.

- Updated dependencies [6f62a18]
- Updated dependencies [6f62a18]
  - @treeui/tokens@0.32.0

## 0.4.1

### Patch Changes

- Updated dependencies [c619743]
  - @treeui/tokens@0.31.0

## 0.4.0

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

### Patch Changes

- Updated dependencies [ed3167a]
  - @treeui/tokens@0.30.0

## 0.3.6

### Patch Changes

- Updated dependencies [1a9d136]
  - @treeui/utils@0.29.0

## 0.3.5

### Patch Changes

- Updated dependencies [ec31a47]
  - @treeui/tokens@0.28.0

## 0.3.4

### Patch Changes

- Updated dependencies [ddbbf86]
  - @treeui/tokens@0.27.0

## 0.3.3

### Patch Changes

- Updated dependencies [184914c]
  - @treeui/utils@0.26.0

## 0.3.2

### Patch Changes

- Updated dependencies [2628793]
  - @treeui/tokens@0.25.0

## 0.3.1

### Patch Changes

- Updated dependencies [2a5c192]
  - @treeui/utils@0.24.0

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
