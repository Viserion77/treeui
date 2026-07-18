---
"@treeui/vue": minor
---

Add layout & typography primitives so app-level layout no longer needs hand-written CSS:

- **TText** — typography primitive (`size`, `tone`, `weight`, `truncate`, polymorphic `as`).
- **TSpacer** — flexible spacer that absorbs free space / pins content to the end.
- **TKbd** — keyboard-key hint chip.
- **TSplit** — responsive main + aside two-pane layout that stacks when narrow (no media query).
- **TStackItem** — per-child flex control (`grow`, `shrink`, `basis`, `minWidth`, `align`) for a `TStack`.
- **TButton** — new `block` (full-width) and `align` (`start`/`center`/`end`) props.
- **TStack** — new `grow` prop to fill the parent's main axis.
