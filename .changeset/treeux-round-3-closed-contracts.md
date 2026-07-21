---
"@treeui/vue": minor
---

Ship the round-3 contract items agreed with the S7 and LSS consumer apps — all additive prop/slot surface on existing components.

**TButton — dev-only accessible-name warning for `iconOnly`** (S7-001, LSS-006)

An `iconOnly` button with no `label` / `aria-label` / `aria-labelledby` now logs a console warning in development. The check is guarded by `process.env.NODE_ENV`, which the vue package's build keeps as a runtime reference (via a vite `define`) so the consumer's bundler resolves it — the warning fires in their dev build and tree-shakes out of production. Completes the item's exit criterion without a separate `TIconButton`.

**TStack — `fill="viewport" | "parent"`** (S7-006)

Gives the stack a floor height (`100dvh` / `100%`) so a centered child fills the screen or its parent with no local height CSS. Composes with `align`/`justify="center"` and with `TContainer`/`TPage`. Distinct from `grow`, which fills a flex parent's main axis.

**TPopover — `size`** (S7-004)

`size` (`sm | md | lg`) scales the content padding via the shared size tokens, so a compact rich panel uses a prop instead of overriding `.t-popover__content`. This is the `size` axis, not a density prop. Compact menus of actions still belong in `TDropdown`.

**TText — `family="sans" | "mono"`** (LSS-001)

`mono` maps to `--tree-font-family-mono`, the token-driven way to render inline code, IDs, and ARNs without a local monospace class.

**TLink — `underline` and `weight`; TCard — `interactive`** (LSS-002)

`TLink` gains `underline` (`always | hover | none`) and `weight` (`regular | medium | semibold`); `variant` stays a pure emphasis axis (no `plain`). For wrapping a whole card/button in a link, `TCard` gains `interactive` — hover elevation + focus-visible ring + cleared decoration — so `<TCard as="a" interactive>` is a real link surface without an inner `TLink` underlining the card's text.

**TTable — `rowState` and `rowKey`** (LSS-012)

`rowState(row, index) => 'default' | 'muted'` applies a per-row visual state by data, not position, so it survives sorting; `rowKey` gives rows stable identity. `muted` is written at compound specificity so it beats the zebra/hover rules. Dimming is documented as a non-sole signal — pair it with a status cell or hidden text.

**TAppShell — `header-end` slot** (LSS-007)

A trailing header region pinned to the far end of the row, so brand-at-start / actions-at-end no longer needs a consumer `TStack` wrapper inside `#header`. Works in the plain flex header, the `has-start` grid (as a content-sized third column), and the mobile fallback.

Practice conformance: `TCard` now claims `interaction-feedback` (it ships hover + focus-visible as an interactive surface).
