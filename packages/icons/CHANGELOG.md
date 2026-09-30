# @treeui/icons

## 0.32.0

### Minor Changes

- 08fba8b: Icons are now drawn to a named contract, **Branchline**, and the contract is enforced by rendering rather than by review.

  **Modifier variants are legible again.** `mail-check`, `mail-plus` and `mail-warning` used to be the same picture: they were distinguished only by a ~1.2u mark inside a 6.7u corner badge, which at the default 20px render is roughly one pixel. The badge is gone. A modifier is now drawn inside bases that enclose space (`shield`, `file`, `folder`, `calendar`, `ticket`, `message-square`, `square`, `badge`, `search`) and in a cleared corner otherwise. Measured at 16px, `shield-check` and `shield-x` now differ by 15% of their ink, against 0.6% before — and `shield-*` reads as a shield again instead of as a broken ring.

  **A modified icon is the same size as the icon it modifies.** The base is not scaled down to make room for the corner mark; it keeps its full size and is redrawn with that corner interrupted, so `globe` and `globe-check` are the same globe. A new rule, `checkCornerClearance`, holds 5.5u of empty canvas around every corner mark and fails the build when the base crowds it.

  **Fourteen icons had geometry generated from a hash of their own name.** `network`, `network-nodes`, `workflow`, `hierarchy`, `git-branch`, `git-fork`, `route` and `timeline` were interchangeable arrangements of sticks and dots, plus six overlay uses in `brain-circuit`, `brain-lock`, `repeat-*`, `browser`, `page-snapshot` and `ai-studio`. All are now drawn to the convention each concept already has.

  **Names that did not match their drawing.** `settings` was a sun and is now a gear. `circle-alert` held a warning triangle inside a circle — two alert metaphors stacked — and now holds an exclamation. `info` and `clock` both carried a broken ring with a dot floating outside it, which reads as a notification; both rings are closed. `users-round` drew two heads over one shared body inside a ring, which read as a face, and is now two avatars. `bot-users` was a bot with a plus, meaning "add a bot", and is now a bot with the person it serves. `support` was a spiral and is now a headset. `wrench-zap` drew its bolt inside the wrench outline, so it shared a silhouette with `wrench`. `file-pdf` spelled three letters in a 9u box that no size could resolve. `chevrons-up-down` closed into a diamond. `lock` no longer carries the keyhole that `lock-keyhole` is named for.

  **Other redrawings:** `file-archive`, `folder-input`, `calendar-dot`, `list-rule`, `send-request`, `library-books`, `assistant`, `lightbulb-sparkles` and `code-api` were redrawn to clear the contract.

  **Five names became aliases rather than separate drawings.** `microphone`, `house`, `paper-plane`, `alert-circle` and `check-circle` now share the geometry of `mic`, `home`, `send`, `circle-alert` and `circle-check`. Every name still resolves; nothing was removed from the catalog.

  **Six new icons open a subject the catalog had no way to draw.** `briefcase`, `car`, `graduation-cap`, `landmark`, `shirt` and `utensils` land in a new `everyday` category — everyday-life subjects, as opposed to the payment mechanics `commerce` already covered. Before them, any expense- or subject-categorisation UI had to fall back to `price-tag`: transport, food, education, apparel and civic all resolved to the same picture.

  `trending-up` is now an alias of `trend-up`. It is the spelling a Lucide-shaped codebase reaches for first, and reaching for it used to produce an unknown-icon warning.

  **Two names were removed: `toggle-left` and `toggle-right`.** They drew a switch, and TreeUI ships `TSwitch` — a real one, with keyboard operation, `role="switch"`, focus-visible treatment and a 44×44 target. A picture of a switch has none of that, and shipping it invites `<TIcon name="toggle-right" />` where `<TSwitch>` was meant. The rule now lives in `DECISIONS.md` → "What Is Not an Icon": if the thing depicted is a control the library already builds, the catalog does not draw it. `check`, `circle-check` and `square-check` are unaffected — a tick is a statement about state, not a box the user clicks.

  **The `product` category is gone, and its sixteen icons are filed by what they draw.** Whether `market` reads as a product mark or as a shop front is decided by where it is rendered, so a `product` category recorded an application's decision as library metadata — and made those sixteen unfindable by anyone searching for what they actually show. `market` is now under commerce, `storage` under data, `assistant` under ai, `trail` under navigation, and so on. They keep their shared rounded-square container, which is a drawing treatment rather than a namespace; the helper that applies it is `FRAMED_GLYPH_NAMES`.

  **One of those sixteen still carried a name that described an application rather than a drawing, and is now `campaign`.** It draws a megaphone with a sparkle inside the shared rounded square, so it is filed by what it shows like the rest of them. For a consumer this is one name added and one name removed, with no alias between them: an alias would keep a name that says nothing about the drawing in the catalog forever, which is the reason for the rename. Code that still asks for the old name now gets the usual unknown-icon warning and should ask for `campaign` instead. The frame and the sparkle stay, so `campaign` remains distinct from the unframed `megaphone`.

  **The catalog is browsable.** `treeIconFamilies`, `treeIconCategories`, `treeIconCategoryOrder`, `treeIconCategoryLabels`, `treeIconAliases`, `treeIconCategory(name)` and `treeIconFamily(name)` are new exports from `@treeui/icons` and `@treeui/vue`: the catalog's own structure, two levels deep. Sixteen subjects, each split into families — `signal` with its four strengths, `chevron` with its four directions.

  Three rules make that structure worth shipping rather than deriving. A family lists its variants **by meaning**, so a scale reads `off`, `low`, `medium`, `high` rather than the alphabetical `high`, `low`, `medium`, `off`. An icon with no relatives is a family of one named after itself, so every group renders the same way. And only canonical names appear: `close` and `x` are one drawing under two names, listed once, with `treeIconAliases` giving the synonyms — enough for a picker to match "close" in a search without showing the same picture twice. `categories.test.ts` holds all three, so a new icon cannot ship without a family and a family cannot drift out of order.

  Storybook's icon gallery is rebuilt on top of it: grouped by subject and family, searchable by name or synonym, with a second row of family chips inside a chosen category and a drawer that shows the family siblings and hands you the line of code.

  The rules ship as tooling: `pnpm --filter @treeui/icons branchline` reports on any icon, and `branchline.test.ts` gates the build. It replaces a test that compared serialised geometry — which measured byte uniqueness, something hash-generated geometry satisfies perfectly while drawing nothing, and which in the other direction forbade true synonyms from sharing one glyph.

## 0.29.0

### Minor Changes

- 1a9d136: Ship the `skip-forward` icon — transport, not navigation: the pair
  of `play`/`pause`, for "end this phase now".

  It was added to the source in the 0.28 cycle but **no changeset ever named
  `@treeui/icons`**, so the package was never versioned and the icon never
  published: `@treeui/vue@0.28.0` still resolved `@treeui/icons@0.18.0`, where it
  does not exist. The consumer found it by looking in the installed registry
  rather than trusting the release note, which is the only way that class of
  mistake gets caught.

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
