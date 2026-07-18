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

**Form control sizing**

- **`width` prop on TInput / TSelect / TTextarea** — a shared `TFieldWidth` scale (`xs` 8rem → `xl` 32rem, `full` default) that caps a control's inline size via `max-inline-size`, so it still shrinks on narrow containers. Replaces inline `width` / `max-width` styles at call sites.

**App shell & drawer fixes**

- **TAppShell** — new `sidebar-header` and `sidebar-footer` slots. The footer pins to the bottom of the rail, and both are inset to match `TNavMenu`'s item padding so a brand mark and a user row line up with the nav icons instead of the rail edge.
- **TAppShell** — built-in collapse toggle in the sidebar footer (`showCollapseButton`, `collapseLabel`, `expandLabel`, `collapse-icon` slot), mirroring the existing mobile menu button. Apps no longer have to place a collapse control in the global header.
- **TDrawer** — the scrolling body no longer clips focus and selection rings painted outside an edge-flush control (e.g. a selected colour swatch).
- **TStack** — no longer forces `width: 100%`. A flex container already fills its container as a block-level box, while the forced width made nested stacks claim a whole row and starve sibling `TSpacer`s, so header clusters could not be pushed to the edges.
- **TChart** — the visually-hidden data table is now wrapped in a hidden `<div>`. A `<table>` ignores a width below its min-content, so hiding it directly left a full-width box that added horizontal page scroll.
- **TAppShell** — resets the default body margin (scoped with `:has()` to pages that mount a shell) so the viewport-sized frame sits flush instead of leaking an 8px offset and a stray page scrollbar.

**Theming**

- **`useTheme()` (`@treeui/vue`)** — theme-mode + accent controller: resolves `system` against the OS, writes `data-tree-theme`, persists the choice, and re-derives a custom accent whenever the theme flips.
- **TColorSwatch (`@treeui/vue`)** — preset colour swatches with an optional native colour input, built for accent pickers.
- **`accentCssVariables()` (`@treeui/tokens`)** — the brand ramp as runtime-applicable CSS custom properties.
- **`deriveBrandRamp()` (`@treeui/tokens`)** now keeps the brand colour legible: the primary doubles as text on its own soft tint, and a raw accent often failed WCAG AA there (a mid-tone blue lands at ~4.25:1 on the light tint and ~2.7:1 on the dark one). It is now walked darker/lighter until it clears, and the on-brand text colour flips with it. Pass `ensureLegible: false` to keep the previous verbatim behaviour.

**Layout regressions fixed**

- **TDrawer / TModal** — the wrapper that hosts an optional trigger no longer occupies layout when there is no trigger. As empty `inline-flex` boxes they still generated a line box (~18px), silently adding page height — enough to push a viewport-sized shell past `100vh` and render a second scrollbar next to the shell's own.
- **TAppShell** — new `header-start` slot. With it the header mirrors the shell's grid columns, so content in the `header` slot lines up with the content panel below instead of floating over the rail boundary.
