# @treeui/icons

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

## 0.8.0

### Minor Changes

- a6561c0: **Breaking:** adopt a single `T`-prefixed public surface and drop the `Tree<Name>` compatibility layer.
  - The `Tree<Name>` component aliases and their global plugin registrations are removed; use `T<Name>` exports only (the `TNavbar` / `TAppBar` and `TSteps` / `TStepper` pairs remain).
  - Exported types are renamed: `TreeSize` → `TSize`, `TreeVariant` → `TVariant`, `TreeBadgeTone` → `TBadgeTone`, `TreeIconName` → `TIconName`, and so on.
  - Source SFCs are renamed `T<Name>.vue`, and component BEM classes are renamed `tree-*` → `t-*` (for example `tree-button` → `t-button`).
  - Design-token CSS variables keep the `--tree-*` prefix and the `[data-tree-theme]` attribute is unchanged, so theming is not affected.

  Migrate by replacing any `Tree<Name>` imports/usages with `T<Name>`, updating the renamed type names, and renaming `tree-*` class selectors to `t-*` in custom CSS.

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
