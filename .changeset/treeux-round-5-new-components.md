---
"@treeui/vue": minor
---

Fix the `TButton` `iconOnly` dev warning and add three new components agreed with the S7 and LSS consumer apps.

**Fix — TButton `iconOnly` accessible-name warning (TREEUX-001, rejected in validation)**

The 0.20.0 warning never fired in a real browser dev build: the `typeof process !== 'undefined'` guard is `false` in the browser (no `process` global), and wrapping the check in a function made it opaque to tree-shaking, so the block and its strings survived into production bundles. The guard is now a bare, inlined `process.env.NODE_ENV !== 'production'` compare, which the consumer's bundler statically replaces: it runs in their development build and is dead-code-eliminated — block and string literal — from production. A regression test asserts the source keeps the bare pattern (no `typeof` guard, no function wrapper).

**TBrandLockup** (TREEUX-009) — a generic product brand lockup: a `logo` slot kept at its intrinsic aspect ratio (never cropped, unlike TAvatar), a truncating `title` and optional `subtitle`, a `collapsed` mode for a shell's collapsed rail, and an optional home link (`href`/`to`, router-aware). Ships no identity — the asset and strings belong to the consumer.

**TCodeBlock** (TREEUX-003) — a scrollable monospace surface for logs, JSON and ARNs. `wrap` toggles between horizontal-scroll (logs) and wrapping (JSON), `maxBlockSize` caps the height, and the `<pre>` is a labelled keyboard-scrollable `role="region"`. Optional built-in copy button (`copyable` + `code`). No syntax highlighting or virtualization by design. For inline code use `TText family="mono"`.

**TLinkTile** (TREEUX-008) — an interactive navigational tile: a single link surface (`href`/`to`) with `leading`/`title`/`description` regions, a closed `tone` accent axis (status/brand tokens, soft tint derived via color-mix), and `current` → `aria-current="page"`. Owns hover/focus/sizing but no grid — compose collections with TGrid.

Practice conformance updated in `docs/ai/practices.json`: `TLinkTile` → interaction-feedback, accessible-by-default, token-driven; `TCodeBlock` → accessible-by-default, token-driven; `TBrandLockup` → content-alignment, token-driven.
