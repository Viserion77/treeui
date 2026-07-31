---
"@treeui/vue": minor
---

Extend `TText` for marketing surfaces and fix two `TLanguageSelect` bugs.

- **TText display/heading sizes (TREEUX-024)**: `size` gains `4xl`, `5xl`, and `display` — a responsive hero step (`clamp(3xl→5xl)` with compact line-height and tight tracking), so a landing hero scales with the viewport without a consumer `clamp()`.
- **TText overline (TREEUX-025)**: `size="overline"` — a closed eyebrow style (xs, semibold, uppercase, wide tracking) that leaves colour to the `tone` axis (brand on a site, muted on a product LP).
- **TText reading measure (TREEUX-029)**: `measure="lead" | "prose"` caps line length in `ch` (58 / 68) and renders block, so every surface uses the same measure without hardcoding `ch`.
- **TLanguageSelect SSR fix (TREEUX-028)**: the outside-click listener bound in an `immediate` watcher touched `document` during setup and crashed server rendering (`nuxt generate`). The client-only side effect moved to `onMounted`; a `renderToString` smoke test now guards the overlay/select components against DOM access during setup.
- **TLanguageSelect icon-only fix (TREEUX-026)**: `icon-only` (switcher) now visually hides the language name (kept as the accessible name) and collapses the trigger to a square, instead of only tightening padding — so a narrow navbar no longer shows the full endonym.
