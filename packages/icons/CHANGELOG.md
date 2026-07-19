# @treeui/icons

## 0.18.0

### Minor Changes

- bff587c: Expand the built-in TreeUI icon catalog from 71 to 364 names. The catalog now
  covers the consolidated P0/P1/P2 product vocabulary, application glyphs, file
  families, status and action icons, and the documented migration aliases. Product
  icons use concise unprefixed names, while company logos remain app-owned SVG
  components rather than built-ins. Built-in keys now feed `TIconRegistry`
  automatically so every shipped name remains available through `TIconName` in the
  generated declarations.
- bff587c: Make the icon registry extensible and grow the built-in set from 11 to 71.

  The registry was closed in both directions: `TIconName` was `keyof typeof treeIcons`
  over a closed object literal, so no augmentation was possible, and `createTreeIcon`
  was module-private, so an application could not build an icon that honoured the
  prop contract either. The 11 shipped icons were all internal chrome — chevrons,
  check, x — so anything an application actually needed was out of reach. Both
  consumers we know of responded the same way: they reimplemented `createTreeIcon`
  and hand-rolled their own parallel icon set. `examples/dashboard-vue` did it inside
  this repo, down to re-drawing a `search` icon that already shipped.

  - `createTreeIcon`, `registerTreeIcons`, `resolveTreeIcon`, `hasTreeIcon` and
    `listTreeIcons` are now public, and re-exported from `@treeui/vue` so an
    application does not need `@treeui/icons` as a direct dependency.
  - `TIconRegistry` is an augmentable interface and `TIconName` is `keyof` it, so
    a `declare module` block gives custom names the same autocomplete and
    typo-checking the built-ins have. `getTreeIcon('typo')` still fails to compile.
  - `registerTreeIcons` takes geometry or a ready component, so adopting an existing
    set is `registerTreeIcons({ workflow: Workflow })`. Registering a name the
    library already ships replaces that built-in rather than adding to it, so the
    examples deliberately use names outside the built-in set.
  - 60 new original TreeUI built-ins, using descriptive kebab-case names. The set covers what
    the two known consumers had drawn by hand plus the usual app-shell vocabulary.
  - `TNavMenuItem.icon` widens from `Component` to `TIconInput`, so `icon: 'cpu'`
    works. Names are resolved centrally before `<component :is>` — passing a raw
    string to `:is` would have Vue look for a _globally registered component_ by
    that name and silently render nothing. An unknown name falls back to the item's
    letter marker and warns.
  - Lookups read a version ref that every registration bumps, so an icon resolved
    inside a `computed` or a render function re-resolves when the registry changes.
    Registration is no longer required to happen before first render: an icon
    registered by a lazily loaded route appears in components that already rendered.
  - The registry is anchored on `Symbol.for('@treeui/icons.registry')` rather than
    module scope. Mutable module state gives two copies of the package two separate
    registries, which presents as icons rendering in some parts of an application
    and not others — a failure mode that is very hard to read back to a duplicated
    dependency. A well-known global key makes duplicate copies share one registry.
  - `resetTreeIcons` restores the shipped set, dropping everything registered since.
    The registry is process-wide mutable state, so one test that registers an icon
    leaks into every test after it; this is what an `afterEach` calls.
  - Unknown-icon warnings are deduped per name, so a missing icon in a list that
    renders every frame warns once rather than flooding the console. They fire in
    production too: a missing icon is a misconfiguration worth hearing about exactly
    once, and the alternative — sniffing `process.env.NODE_ENV` — reads as
    `undefined` in the many browser bundles that do not shim `process`.
  - Geometry is stored as data and a component is built on first lookup, so an icon
    nobody renders never becomes a `defineComponent`. This is not tree-shaking and
    does not shrink the payload: the registry seeds itself from
    `builtinTreeIconNodes` at module scope and holds a live reference, so any import
    of the package retains the geometry for all 71 icons. `sideEffects: false` does
    not change that. What is lazy is component construction, not bytes shipped.

  Two latent bugs fixed along the way: node attributes are typed
  `Record<string, string | number>` (the root `<svg>` was already passing a number
  for `stroke-width`, so the old string-only type was self-contradictory), and a
  non-numeric or zero `size` no longer produces `stroke-width="NaN"` or `"Infinity"`.

  Hand-rolled icons were not just duplication — they silently lost the
  `absoluteStrokeWidth` correction, which keeps stroke weight optically constant
  across sizes. Because a hand-rolled `<svg>` pins the `stroke-width` attribute
  while the viewBox scales, its stroke tracks the icon's size: slightly light at
  small sizes and visibly bold at large ones. The migrated example had two 16px
  icons rendering at 1.33px of stroke next to library icons at 2px; they are
  correct now.

  What might break when you upgrade:

  - `TIconName` now spans 71 names instead of 11, so any exhaustive mapping keyed by
    it stops compiling — a `Record<TIconName, string>` label map that listed all 11
    old names now fails with 60 missing keys. Widening the name set is the point of
    the change, and an exhaustive map is the one pattern that cannot absorb it; use
    `Partial<Record<TIconName, string>>` or an index signature. This reaches
    `@treeui/vue` consumers as well, since `TIconName` was already re-exported there.
  - `treeIcons` was an object literal with `satisfies`, so each entry kept its
    concrete `DefineComponent` type; it is now `Record<TIconName, Component>`. Key
    access, `keyof typeof treeIcons`, `Object.keys`, and assigning an entry to
    `Component` are all unaffected. What changes is the value type:
    `InstanceType<typeof treeIcons['check']>` no longer compiles, because `Component`
    is not constructible, and prop types are no longer checked through the map, so
    `h(treeIcons.check, { absoluteStrokeWidth: 'yes' })` was an error before and now
    compiles silently. The silent one is the more expensive of the two. Code that
    went through `getTreeIcon` is unaffected — it has always returned `Component`.
  - Entries are getters with no setter, so `treeIcons['check'] = MyIcon` now throws a
    `TypeError` where it used to patch the map. Patching was never a supported way to
    replace an icon; `registerTreeIcons({ check: MyIcon })` does it properly and
    invalidates the component cached from the superseded geometry. Assigning a name
    that is _not_ registered does not throw, but it installs a plain property the
    registry never consults, so it is worth avoiding for the same reason.

  `@treeui/react` has no icon layer yet. Geometry is exported as framework-agnostic
  data (`builtinTreeIconNodes` — named for what it holds, since the set is geometry
  rather than components), so a React `TIcon` can be built on the same source without
  duplicating artwork.

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
