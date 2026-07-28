---
"@treeui/vue": minor
---

Add `TPopover` `width` and fix rich panels collapsing / overflowing the viewport (TREEUX-018).

The panel content now sizes to its intrinsic width (`width: max-content`), so a grid or flex panel (e.g. an app-launcher `TGrid` whose columns have a near-zero min-content) no longer shrink-to-fits down to the `min-width`. The new `width` prop caps how wide it may grow — `sm` (18rem), `md` (24rem, base), `lg` (40rem), or `content` (no rem cap, viewport only). Width and height are always clamped to the viewport (`calc(100vw - space-8)` / `calc(100dvh - space-16)`) and the panel gets its own scroll, so a tall/wide panel never runs off-screen. `TMenu` forwards `width` too. This removes the need for consumers to reach into `:deep(.t-popover__content)` for width/overflow.
