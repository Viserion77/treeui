---
"@treeui/tokens": minor
"@treeui/vue": minor
---

Add layout, typography and theming primitives so app-level chrome no longer needs hand-written CSS.

**Layout & typography (`@treeui/vue`)**

- **TText** — typography primitive (`size`, `tone`, `weight`, `truncate`, polymorphic `as`).
- **TSpacer** — flexible spacer that absorbs free space / pins content to the end.
- **TKbd** — keyboard-key hint chip.
- **TSplit** — responsive main + aside two-pane layout that stacks when narrow (no media query).
- **TStackItem** — per-child flex control (`grow`, `shrink`, `basis`, `minWidth`, `align`) for a `TStack`.
- **TButton** — new `block` (full-width) and `align` (`start`/`center`/`end`) props.
- **TStack** — new `grow` prop to fill the parent's main axis.

**Theming**

- **`useTheme()` (`@treeui/vue`)** — theme-mode + accent controller: resolves `system` against the OS, writes `data-tree-theme`, persists the choice, and re-derives a custom accent whenever the theme flips.
- **TColorSwatch (`@treeui/vue`)** — preset colour swatches with an optional native colour input, built for accent pickers.
- **`accentCssVariables()` (`@treeui/tokens`)** — the brand ramp as runtime-applicable CSS custom properties.
- **`deriveBrandRamp()` (`@treeui/tokens`)** now keeps the brand colour legible: the primary doubles as text on its own soft tint, and a raw accent often failed WCAG AA there (a mid-tone blue lands at ~4.25:1 on the light tint and ~2.7:1 on the dark one). It is now walked darker/lighter until it clears, and the on-brand text colour flips with it. Pass `ensureLegible: false` to keep the previous verbatim behaviour.
