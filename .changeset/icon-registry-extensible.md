---
'@treeui/icons': minor
'@treeui/vue': minor
---

Make the icon registry extensible and grow the built-in set from 11 to 71.

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
  string to `:is` would have Vue look for a *globally registered component* by
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
  that is *not* registered does not throw, but it installs a plain property the
  registry never consults, so it is worth avoiding for the same reason.

`@treeui/react` has no icon layer yet. Geometry is exported as framework-agnostic
data (`builtinTreeIconNodes` — named for what it holds, since the set is geometry
rather than components), so a React `TIcon` can be built on the same source without
duplicating artwork.
